import { uIOhook, type UiohookKeyboardEvent, type UiohookMouseEvent } from 'uiohook-napi'
import { nanoid } from 'nanoid'
import { KEYCODE_TO_NAME } from './keycodes'
import type { Action, CaptureToggles } from '../../shared/types'

type ActionListener = (action: Action) => void

let recording = false
let toggles: CaptureToggles = { mouseMove: true, mouseClicks: true, keyboard: true, delays: true }
let sampleMs = 60
let listener: ActionListener = () => {}
let lastEventAt = 0
let lastMoveEmitAt = 0
let lastMoveEmitPos: { x: number; y: number } | null = null

let pendingClick: {
  button: 'left' | 'right' | 'middle'
  x: number
  y: number
  time: number
} | null = null
let lastEmittedClick: {
  button: string
  x: number
  y: number
  time: number
  action: Action
} | null = null

const keyDownAt = new Map<number, number>()

function delayBeforeNow(now: number): number {
  if (!toggles.delays) return 0
  return lastEventAt === 0 ? 0 : Math.max(0, now - lastEventAt)
}

function baseFields(now: number): {
  id: string
  enabled: boolean
  delayBeforeMs: number
  delayAfterMs: number
} {
  const delayBeforeMs = delayBeforeNow(now)
  lastEventAt = now
  return { id: nanoid(8), enabled: true, delayBeforeMs, delayAfterMs: 0 }
}

function mouseButtonName(button: unknown): 'left' | 'right' | 'middle' {
  const n = Number(button)
  if (n === 2) return 'right'
  if (n === 3) return 'middle'
  return 'left'
}

function onMouseMove(e: UiohookMouseEvent): void {
  if (!recording || !toggles.mouseMove) return
  const now = Date.now()
  if (now - lastMoveEmitAt < sampleMs) return
  if (lastMoveEmitPos && lastMoveEmitPos.x === e.x && lastMoveEmitPos.y === e.y) return
  lastMoveEmitAt = now
  lastMoveEmitPos = { x: e.x, y: e.y }

  const action: Action = {
    ...baseFields(now),
    type: 'mouse-move',
    x: e.x,
    y: e.y,
    durationMs: sampleMs,
    relative: false
  }
  listener(action)
}

function onMouseDown(e: UiohookMouseEvent): void {
  if (!recording || !toggles.mouseClicks) return
  pendingClick = { button: mouseButtonName(e.button), x: e.x, y: e.y, time: Date.now() }
}

function onMouseUp(e: UiohookMouseEvent): void {
  if (!recording || !toggles.mouseClicks) return
  const now = Date.now()
  const button = mouseButtonName(e.button)
  if (!pendingClick || pendingClick.button !== button || now - pendingClick.time > 600) {
    pendingClick = null
    return
  }
  pendingClick = null

  if (
    lastEmittedClick &&
    lastEmittedClick.button === button &&
    Math.abs(lastEmittedClick.x - e.x) < 4 &&
    Math.abs(lastEmittedClick.y - e.y) < 4 &&
    now - lastEmittedClick.time < 400 &&
    lastEmittedClick.action.type === 'mouse-click' &&
    lastEmittedClick.action.mode === 'single'
  ) {
    lastEmittedClick.action.mode = 'double'
    lastEmittedClick = null
    return
  }

  const action: Action = {
    ...baseFields(now),
    type: 'mouse-click',
    button,
    mode: 'single'
  }
  lastEmittedClick = { button, x: e.x, y: e.y, time: now, action }
  listener(action)
}

function onWheel(e: { rotation: number; direction: number }): void {
  if (!recording || !toggles.mouseMove) return
  const now = Date.now()
  const vertical = e.direction === 3
  const direction = vertical ? (e.rotation < 0 ? 'up' : 'down') : e.rotation < 0 ? 'left' : 'right'
  const action: Action = {
    ...baseFields(now),
    type: 'mouse-scroll',
    direction,
    amount: Math.max(1, Math.abs(e.rotation))
  }
  listener(action)
}

function onKeyDown(e: UiohookKeyboardEvent): void {
  if (!recording || !toggles.keyboard) return
  if (keyDownAt.has(e.keycode)) return
  keyDownAt.set(e.keycode, Date.now())
}

function onKeyUp(e: UiohookKeyboardEvent): void {
  if (!recording || !toggles.keyboard) return
  const downAt = keyDownAt.get(e.keycode)
  keyDownAt.delete(e.keycode)
  if (downAt === undefined) return

  const now = Date.now()
  const heldMs = now - downAt
  const keyName = KEYCODE_TO_NAME[e.keycode]
  if (!keyName) return

  const action: Action =
    heldMs >= 250
      ? { ...baseFields(now), type: 'key', keys: [keyName], mode: 'hold', holdMs: heldMs }
      : { ...baseFields(now), type: 'key', keys: [keyName], mode: 'press', holdMs: 0 }
  listener(action)
}

let hooked = false
function ensureHooked(): void {
  if (hooked) return
  hooked = true
  uIOhook.on('mousemove', onMouseMove)
  uIOhook.on('mousedown', onMouseDown)
  uIOhook.on('mouseup', onMouseUp)
  uIOhook.on('wheel', onWheel)
  uIOhook.on('keydown', onKeyDown)
  uIOhook.on('keyup', onKeyUp)
}

export function startRecording(opts: {
  toggles: CaptureToggles
  mouseMoveSampleMs: number
  onAction: ActionListener
}): void {
  ensureHooked()
  toggles = opts.toggles
  sampleMs = Math.max(16, opts.mouseMoveSampleMs)
  listener = opts.onAction
  lastEventAt = 0
  lastMoveEmitAt = 0
  lastMoveEmitPos = null
  pendingClick = null
  lastEmittedClick = null
  keyDownAt.clear()
  recording = true
}

export function stopRecording(): void {
  recording = false
}
