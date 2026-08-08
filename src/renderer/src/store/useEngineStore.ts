import { create } from 'zustand'
import type { EngineProgress, Macro } from '@shared/types'

const IDLE_PROGRESS: EngineProgress = {
  status: 'idle',
  macroId: null,
  macroName: null,
  currentActionIndex: -1,
  totalActions: 0,
  currentRepeat: 0,
  totalRepeats: 1,
  elapsedMs: 0,
  currentAction: null,
  error: null
}

interface EngineState {
  progress: EngineProgress
  initialized: boolean
  init: () => void
  run: (macro: Macro) => Promise<void>
  pause: () => Promise<void>
  resume: () => Promise<void>
  stop: () => Promise<void>
}

export const useEngineStore = create<EngineState>((set, get) => ({
  progress: IDLE_PROGRESS,
  initialized: false,
  init: () => {
    if (get().initialized) return
    set({ initialized: true })
    window.api.engine.onProgress((progress) => set({ progress }))
  },
  run: async (macro) => {
    await window.api.engine.start(macro)
  },
  pause: async () => {
    await window.api.engine.pause()
  },
  resume: async () => {
    await window.api.engine.resume()
  },
  stop: async () => {
    await window.api.engine.stop()
  }
}))
