import { registerMacrosIpc } from './macrosIpc'
import { registerSettingsIpc } from './settingsIpc'
import { registerEngineIpc } from './engineIpc'
import { registerRecordingIpc } from './recordingIpc'
import { registerPickerIpc } from './pickerIpc'
import { registerWindowIpc } from '../window'

export function registerAllIpc(): void {
  registerWindowIpc()
  registerMacrosIpc()
  registerSettingsIpc()
  registerEngineIpc()
  registerRecordingIpc()
  registerPickerIpc()
}
