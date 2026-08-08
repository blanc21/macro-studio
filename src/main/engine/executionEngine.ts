import type { Action, EngineProgress, EngineStatus, Macro } from '../../shared/types'
import { resolveWaitMs, runAction } from './actionRunners'

class StopSignal extends Error {}

interface EngineState {
  status: EngineStatus
  macro: Macro | null
  startedAt: number
  currentActionIndex: number
  currentRepeat: number
  totalRepeats: number
}

const state: EngineState = {
  status: 'idle',
  macro: null,
  startedAt: 0,
  currentActionIndex: -1,
  currentRepeat: 0,
  totalRepeats: 1
}

type ProgressListener = (progress: EngineProgress) => void
type DoneListener = (macro: Macro, elapsedMs: number, error: string | null) => void

let onProgress: ProgressListener = () => {}
let onDone: DoneListener = () => {}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function interruptibleWait(ms: number): Promise<void> {
  const stepMs = 25
  let remaining = Math.max(0, ms)
  while (remaining > 0) {
    if (state.status === 'stopped') throw new StopSignal()
    if (state.status === 'paused') {
      await sleep(stepMs)
      continue
    }
    const step = Math.min(stepMs, remaining)
    await sleep(step)
    remaining -= step
  }
  if (state.status === 'stopped') throw new StopSignal()
}

function emitProgress(currentAction: Action | null): void {
  if (!state.macro) return
  onProgress({
    status: state.status,
    macroId: state.macro.id,
    macroName: state.macro.name,
    currentActionIndex: state.currentActionIndex,
    totalActions: state.macro.actions.length,
    currentRepeat: state.currentRepeat,
    totalRepeats: state.totalRepeats,
    elapsedMs: Date.now() - state.startedAt,
    currentAction,
    error: null
  })
}

export function getStatus(): EngineStatus {
  return state.status
}

export function pause(): void {
  if (state.status === 'running') state.status = 'paused'
}

export function resume(): void {
  if (state.status === 'paused') state.status = 'running'
}

export function stop(): void {
  if (state.status === 'running' || state.status === 'paused') state.status = 'stopped'
}

export function onProgressUpdate(listener: ProgressListener): void {
  onProgress = listener
}

export function onExecutionDone(listener: DoneListener): void {
  onDone = listener
}

export async function startMacro(macro: Macro): Promise<void> {
  if (state.status === 'running' || state.status === 'paused') return

  state.status = 'running'
  state.macro = macro
  state.startedAt = Date.now()
  state.currentActionIndex = -1
  state.currentRepeat = 0
  state.totalRepeats =
    macro.repeat.mode === 'once' ? 1 : macro.repeat.mode === 'infinite' ? -1 : macro.repeat.count

  let error: string | null = null

  try {
    while (state.totalRepeats === -1 || state.currentRepeat < state.totalRepeats) {
      for (let i = 0; i < macro.actions.length; i++) {
        const action = macro.actions[i]
        state.currentActionIndex = i
        if (!action.enabled) continue

        emitProgress(action)
        await interruptibleWait(action.delayBeforeMs)

        if (action.type === 'wait') {
          await interruptibleWait(resolveWaitMs(action))
        } else {
          await runAction(action)
        }

        await interruptibleWait(action.delayAfterMs)
      }

      state.currentRepeat++
      const hasMore = state.totalRepeats === -1 || state.currentRepeat < state.totalRepeats
      if (hasMore && macro.repeat.pauseBetweenMs > 0) {
        emitProgress(null)
        await interruptibleWait(macro.repeat.pauseBetweenMs)
      }
    }
  } catch (e) {
    if (!(e instanceof StopSignal)) {
      error = e instanceof Error ? e.message : String(e)
    }
  }

  const elapsedMs = Date.now() - state.startedAt
  state.status = 'idle'
  onProgress({
    status: 'idle',
    macroId: macro.id,
    macroName: macro.name,
    currentActionIndex: -1,
    totalActions: macro.actions.length,
    currentRepeat: state.currentRepeat,
    totalRepeats: state.totalRepeats,
    elapsedMs,
    currentAction: null,
    error
  })
  onDone(macro, elapsedMs, error)
  state.macro = null
}
