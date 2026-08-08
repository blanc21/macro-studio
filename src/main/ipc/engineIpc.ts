import { ipcMain } from 'electron'
import { IpcChannels } from '../../shared/ipc'
import * as engine from '../engine/executionEngine'
import * as macroStore from '../macros/macroStore'
import { getMainWindow } from '../window'
import type { Macro } from '../../shared/types'

export function registerEngineIpc(): void {
  engine.onProgressUpdate((progress) => {
    getMainWindow()?.webContents.send(IpcChannels.engineProgress, progress)
  })

  engine.onExecutionDone((macro, elapsedMs) => {
    void macroStore.recordExecution(macro.id, elapsedMs)
  })

  ipcMain.handle(IpcChannels.engineStart, (_e, macro: Macro) => {
    void engine.startMacro(macro)
    return true
  })
  ipcMain.handle(IpcChannels.enginePause, () => {
    engine.pause()
    return true
  })
  ipcMain.handle(IpcChannels.engineResume, () => {
    engine.resume()
    return true
  })
  ipcMain.handle(IpcChannels.engineStop, () => {
    engine.stop()
    return true
  })
  ipcMain.handle(IpcChannels.engineGetState, () => engine.getStatus())
}
