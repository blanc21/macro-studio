import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { uIOhook } from 'uiohook-napi'
import { createMainWindow, getMainWindow, setQuitting } from './window'
import { registerAllIpc } from './ipc'
import { initMacroStore } from './macros/macroStore'
import { initSettingsStore } from './macros/settingsStore'
import * as engine from './engine/executionEngine'
import * as hotkeys from './input/hotkeys'
import { stopSimulator } from './input/simulator'
import { destroyTray } from './tray'
import { IpcChannels } from '../shared/ipc'

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.macrostudio.app')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  await initMacroStore()
  await initSettingsStore()

  registerAllIpc()

  uIOhook.start()
  hotkeys.initHotkeys((action) => {
    if (action === 'stop') {
      engine.stop()
    } else if (action === 'pause') {
      if (engine.getStatus() === 'running') engine.pause()
      else if (engine.getStatus() === 'paused') engine.resume()
    }
    getMainWindow()?.webContents.send(IpcChannels.hotkeyTriggered, action)
  })

  createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  setQuitting(true)
  engine.stop()
  uIOhook.stop()
  stopSimulator()
  destroyTray()
})
