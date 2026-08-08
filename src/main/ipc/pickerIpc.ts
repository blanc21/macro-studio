import { ipcMain } from 'electron'
import { IpcChannels } from '../../shared/ipc'
import * as picker from '../input/picker'

export function registerPickerIpc(): void {
  ipcMain.handle(IpcChannels.pickerPosition, () => picker.pickPosition())
  ipcMain.handle(IpcChannels.pickerKey, () => picker.pickKey())
}
