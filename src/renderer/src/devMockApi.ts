import { DEFAULT_SETTINGS } from '@shared/defaultSettings'
import { createMacro } from '@shared/factory'
import type { Macro, MacroSummary } from '@shared/types'

/**
 * Only used when previewing the renderer in a plain browser tab (no Electron
 * preload bridge available). Never loaded inside the real packaged/dev app.
 */
export function installDevMockApiIfNeeded(): void {
  if (typeof window === 'undefined' || (window as unknown as { api?: unknown }).api) return

  const macros = new Map<string, Macro>()
  const seed = createMacro('Farm automatique')
  macros.set(seed.id, seed)

  const toSummary = (m: Macro): MacroSummary => ({
    id: m.id,
    name: m.name,
    description: m.description,
    stats: m.stats,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
    actionCount: m.actions.length
  })

  const settings = { ...DEFAULT_SETTINGS }

  ;(window as unknown as { api: unknown }).api = {
    macros: {
      list: async (): Promise<MacroSummary[]> => Array.from(macros.values()).map(toSummary),
      get: async (id: string): Promise<Macro | null> => macros.get(id) ?? null,
      create: async (name?: string): Promise<Macro> => {
        const m = createMacro(name)
        macros.set(m.id, m)
        return m
      },
      update: async (macro: Macro): Promise<Macro> => {
        macros.set(macro.id, macro)
        return macro
      },
      rename: async (id: string, name: string): Promise<Macro | null> => {
        const m = macros.get(id)
        if (!m) return null
        m.name = name
        return m
      },
      duplicate: async (id: string): Promise<Macro | null> => {
        const m = macros.get(id)
        if (!m) return null
        const copy = { ...m, id: `${id}-copy` }
        macros.set(copy.id, copy)
        return copy
      },
      delete: async (id: string): Promise<void> => {
        macros.delete(id)
      },
      export: async (): Promise<{ ok: boolean }> => ({ ok: false }),
      import: async (): Promise<{ ok: boolean }> => ({ ok: false })
    },
    stats: {
      get: async () => ({
        macroCount: macros.size,
        totalExecutions: 12,
        totalActiveMs: 3_600_000
      })
    },
    settings: {
      get: async () => settings,
      update: async (partial: Partial<typeof settings>) => Object.assign(settings, partial)
    },
    engine: {
      start: async (): Promise<boolean> => true,
      pause: async (): Promise<boolean> => true,
      resume: async (): Promise<boolean> => true,
      stop: async (): Promise<boolean> => true,
      getState: async () => 'idle',
      onProgress: () => () => {}
    },
    recording: {
      start: async (): Promise<boolean> => true,
      stop: async (): Promise<boolean> => true,
      onActionCaptured: () => () => {}
    },
    picker: {
      pickPosition: async () => null,
      pickKey: async () => null
    },
    hotkeys: {
      onTriggered: () => () => {}
    },
    window: {
      minimize: () => {},
      maximize: () => {},
      close: () => {}
    }
  }
}
