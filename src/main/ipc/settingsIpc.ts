import { app, ipcMain } from 'electron'
import { IpcChannels } from '../../shared/ipc'
import * as settingsStore from '../macros/settingsStore'
import * as hotkeys from '../input/hotkeys'
import { createTray, destroyTray } from '../tray'
import type { Settings } from '../../shared/types'

function applySystemSettings(settings: Settings): void {
  hotkeys.setHotkeys(settings.hotkeys)
  app.setLoginItemSettings({ openAtLogin: settings.launchOnStartup })
  if (settings.minimizeToTray) createTray()
  else destroyTray()
}

export function registerSettingsIpc(): void {
  applySystemSettings(settingsStore.getSettings())

  ipcMain.handle(IpcChannels.settingsGet, () => settingsStore.getSettings())
  ipcMain.handle(IpcChannels.settingsUpdate, async (_e, partial: Partial<Settings>) => {
    const next = await settingsStore.updateSettings(partial)
    applySystemSettings(next)
    return next
  })
}
