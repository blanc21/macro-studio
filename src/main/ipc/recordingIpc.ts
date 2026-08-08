import { ipcMain } from 'electron'
import { IpcChannels } from '../../shared/ipc'
import * as recorder from '../input/recorder'
import * as settingsStore from '../macros/settingsStore'
import { getMainWindow } from '../window'
import type { CaptureToggles } from '../../shared/types'

export function registerRecordingIpc(): void {
  ipcMain.handle(IpcChannels.recordingStart, (_e, toggles: CaptureToggles) => {
    const settings = settingsStore.getSettings()
    recorder.startRecording({
      toggles,
      mouseMoveSampleMs: settings.mouseMoveSampleMs,
      onAction: (action) => {
        getMainWindow()?.webContents.send(IpcChannels.recordingActionCaptured, action)
      }
    })
    return true
  })

  ipcMain.handle(IpcChannels.recordingStop, () => {
    recorder.stopRecording()
    return true
  })
}
