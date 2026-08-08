import { ElectronAPI } from '@electron-toolkit/preload'
import type { MacroStudioApi } from './index'

declare global {
  interface Window {
    electron: ElectronAPI
    api: MacroStudioApi
  }
}
