import { uIOhook, type UiohookKeyboardEvent } from 'uiohook-napi'
import { KEYCODE_TO_NAME } from './keycodes'
import type { HotkeyAction, HotkeyMap } from '../../shared/types'

type TriggerListener = (action: HotkeyAction) => void

let bindings: HotkeyMap | null = null
let onTrigger: TriggerListener = () => {}
let hooked = false

function onKeyDown(e: UiohookKeyboardEvent): void {
  if (!bindings) return
  const name = KEYCODE_TO_NAME[e.keycode]
  if (!name) return

  for (const [action, key] of Object.entries(bindings) as [HotkeyAction, string][]) {
    if (key.toUpperCase() === name) {
      onTrigger(action)
    }
  }
}

export function setHotkeys(map: HotkeyMap): void {
  bindings = map
}

export function initHotkeys(listener: TriggerListener): void {
  onTrigger = listener
  if (hooked) return
  hooked = true
  uIOhook.on('keydown', onKeyDown)
}
