import { dialog, ipcMain } from 'electron'
import { IpcChannels } from '../../shared/ipc'
import * as macroStore from '../macros/macroStore'
import type { Macro } from '../../shared/types'
import { getMainWindow } from '../window'

export function registerMacrosIpc(): void {
  ipcMain.handle(IpcChannels.macrosList, () => macroStore.listMacros())
  ipcMain.handle(IpcChannels.macrosGet, (_e, id: string) => macroStore.getMacro(id))
  ipcMain.handle(IpcChannels.macrosCreate, (_e, name?: string) => macroStore.createNewMacro(name))
  ipcMain.handle(IpcChannels.macrosUpdate, (_e, macro: Macro) => macroStore.updateMacro(macro))
  ipcMain.handle(IpcChannels.macrosRename, (_e, id: string, name: string) =>
    macroStore.renameMacro(id, name)
  )
  ipcMain.handle(IpcChannels.macrosDuplicate, (_e, id: string) => macroStore.duplicateMacro(id))
  ipcMain.handle(IpcChannels.macrosDelete, (_e, id: string) => macroStore.deleteMacro(id))
  ipcMain.handle(IpcChannels.macrosRecordStats, (_e, id: string, durationMs: number) =>
    macroStore.recordExecution(id, durationMs)
  )
  ipcMain.handle(IpcChannels.statsGet, () => macroStore.getAppStats())

  ipcMain.handle(IpcChannels.macrosExport, async (_e, id: string) => {
    const macro = macroStore.getMacro(id)
    if (!macro) return { ok: false }
    const win = getMainWindow()
    const result = win
      ? await dialog.showSaveDialog(win, {
          title: 'Exporter la macro',
          defaultPath: `${macro.name.replace(/[\\/:*?"<>|]/g, '_')}.macro.json`,
          filters: [{ name: 'Macro Studio', extensions: ['json'] }]
        })
      : await dialog.showSaveDialog({
          title: 'Exporter la macro',
          defaultPath: `${macro.name}.macro.json`,
          filters: [{ name: 'Macro Studio', extensions: ['json'] }]
        })
    if (result.canceled || !result.filePath) return { ok: false }
    await macroStore.exportMacro(id, result.filePath)
    return { ok: true, filePath: result.filePath }
  })

  ipcMain.handle(IpcChannels.macrosImport, async () => {
    const win = getMainWindow()
    const result = win
      ? await dialog.showOpenDialog(win, {
          title: 'Importer une macro',
          filters: [{ name: 'Macro Studio', extensions: ['json'] }],
          properties: ['openFile']
        })
      : await dialog.showOpenDialog({
          title: 'Importer une macro',
          filters: [{ name: 'Macro Studio', extensions: ['json'] }],
          properties: ['openFile']
        })
    if (result.canceled || result.filePaths.length === 0) return { ok: false }
    const macro = await macroStore.importMacro(result.filePaths[0])
    return { ok: true, macro }
  })
}
