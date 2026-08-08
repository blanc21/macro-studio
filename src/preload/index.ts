import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { IpcChannels } from '../shared/ipc'
import type {
  Action,
  CaptureToggles,
  EngineProgress,
  EngineStatus,
  HotkeyAction,
  Macro,
  MacroSummary,
  Settings,
  AppStats
} from '../shared/types'

function subscribe<T>(channel: string, callback: (payload: T) => void): () => void {
  const listener = (_e: unknown, payload: T): void => callback(payload)
  ipcRenderer.on(channel, listener)
  return () => ipcRenderer.removeListener(channel, listener)
}

const api = {
  macros: {
    list: (): Promise<MacroSummary[]> => ipcRenderer.invoke(IpcChannels.macrosList),
    get: (id: string): Promise<Macro | null> => ipcRenderer.invoke(IpcChannels.macrosGet, id),
    create: (name?: string): Promise<Macro> => ipcRenderer.invoke(IpcChannels.macrosCreate, name),
    update: (macro: Macro): Promise<Macro> => ipcRenderer.invoke(IpcChannels.macrosUpdate, macro),
    rename: (id: string, name: string): Promise<Macro | null> =>
      ipcRenderer.invoke(IpcChannels.macrosRename, id, name),
    duplicate: (id: string): Promise<Macro | null> =>
      ipcRenderer.invoke(IpcChannels.macrosDuplicate, id),
    delete: (id: string): Promise<void> => ipcRenderer.invoke(IpcChannels.macrosDelete, id),
    export: (id: string): Promise<{ ok: boolean; filePath?: string }> =>
      ipcRenderer.invoke(IpcChannels.macrosExport, id),
    import: (): Promise<{ ok: boolean; macro?: Macro }> =>
      ipcRenderer.invoke(IpcChannels.macrosImport)
  },
  stats: {
    get: (): Promise<AppStats> => ipcRenderer.invoke(IpcChannels.statsGet)
  },
  settings: {
    get: (): Promise<Settings> => ipcRenderer.invoke(IpcChannels.settingsGet),
    update: (partial: Partial<Settings>): Promise<Settings> =>
      ipcRenderer.invoke(IpcChannels.settingsUpdate, partial)
  },
  engine: {
    start: (macro: Macro): Promise<boolean> => ipcRenderer.invoke(IpcChannels.engineStart, macro),
    pause: (): Promise<boolean> => ipcRenderer.invoke(IpcChannels.enginePause),
    resume: (): Promise<boolean> => ipcRenderer.invoke(IpcChannels.engineResume),
    stop: (): Promise<boolean> => ipcRenderer.invoke(IpcChannels.engineStop),
    getState: (): Promise<EngineStatus> => ipcRenderer.invoke(IpcChannels.engineGetState),
    onProgress: (cb: (progress: EngineProgress) => void): (() => void) =>
      subscribe(IpcChannels.engineProgress, cb)
  },
  recording: {
    start: (toggles: CaptureToggles): Promise<boolean> =>
      ipcRenderer.invoke(IpcChannels.recordingStart, toggles),
    stop: (): Promise<boolean> => ipcRenderer.invoke(IpcChannels.recordingStop),
    onActionCaptured: (cb: (action: Action) => void): (() => void) =>
      subscribe(IpcChannels.recordingActionCaptured, cb)
  },
  picker: {
    pickPosition: (): Promise<{ x: number; y: number } | null> =>
      ipcRenderer.invoke(IpcChannels.pickerPosition),
    pickKey: (): Promise<string | null> => ipcRenderer.invoke(IpcChannels.pickerKey)
  },
  hotkeys: {
    onTriggered: (cb: (action: HotkeyAction) => void): (() => void) =>
      subscribe(IpcChannels.hotkeyTriggered, cb)
  },
  window: {
    minimize: (): void => ipcRenderer.send(IpcChannels.windowMinimize),
    maximize: (): void => ipcRenderer.send(IpcChannels.windowMaximize),
    close: (): void => ipcRenderer.send(IpcChannels.windowClose)
  }
}

export type MacroStudioApi = typeof api

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
