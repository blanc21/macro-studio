import { create } from 'zustand'
import type { Settings } from '@shared/types'
import { DEFAULT_SETTINGS } from '@shared/defaultSettings'

interface SettingsState {
  settings: Settings
  loaded: boolean
  load: () => Promise<void>
  update: (partial: Partial<Settings>) => Promise<void>
}

function applyTheme(theme: Settings['theme']): void {
  document.documentElement.setAttribute('data-theme', theme)
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,
  load: async () => {
    const settings = await window.api.settings.get()
    applyTheme(settings.theme)
    set({ settings, loaded: true })
  },
  update: async (partial) => {
    const settings = await window.api.settings.update(partial)
    applyTheme(settings.theme)
    set({ settings })
  }
}))
