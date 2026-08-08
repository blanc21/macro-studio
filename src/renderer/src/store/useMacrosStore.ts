import { create } from 'zustand'
import type { AppStats, Macro, MacroSummary } from '@shared/types'

interface MacrosState {
  macros: MacroSummary[]
  stats: AppStats
  loaded: boolean
  refresh: () => Promise<void>
  refreshStats: () => Promise<void>
  create: (name?: string) => Promise<Macro>
  rename: (id: string, name: string) => Promise<void>
  duplicate: (id: string) => Promise<void>
  remove: (id: string) => Promise<void>
  exportMacro: (id: string) => Promise<{ ok: boolean; filePath?: string }>
  importMacro: () => Promise<{ ok: boolean; macro?: Macro }>
}

export const useMacrosStore = create<MacrosState>((set, get) => ({
  macros: [],
  stats: { macroCount: 0, totalExecutions: 0, totalActiveMs: 0 },
  loaded: false,
  refresh: async () => {
    const macros = await window.api.macros.list()
    set({ macros, loaded: true })
  },
  refreshStats: async () => {
    const stats = await window.api.stats.get()
    set({ stats })
  },
  create: async (name) => {
    const macro = await window.api.macros.create(name)
    await get().refresh()
    return macro
  },
  rename: async (id, name) => {
    await window.api.macros.rename(id, name)
    await get().refresh()
  },
  duplicate: async (id) => {
    await window.api.macros.duplicate(id)
    await get().refresh()
  },
  remove: async (id) => {
    await window.api.macros.delete(id)
    await get().refresh()
    await get().refreshStats()
  },
  exportMacro: async (id) => window.api.macros.export(id),
  importMacro: async () => {
    const result = await window.api.macros.import()
    if (result.ok) await get().refresh()
    return result
  }
}))
