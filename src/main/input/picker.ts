import { BrowserWindow, ipcMain, screen } from 'electron'
import { uIOhook, type UiohookKeyboardEvent } from 'uiohook-napi'
import { KEYCODE_TO_NAME } from './keycodes'

const PICKER_RESULT_CHANNEL = 'picker:__internal-result'

export function pickKey(timeoutMs = 12000): Promise<string | null> {
  return new Promise((resolve) => {
    let done = false
    const finish = (value: string | null): void => {
      if (done) return
      done = true
      uIOhook.removeListener('keydown', onKeyDown)
      clearTimeout(timer)
      resolve(value)
    }
    const onKeyDown = (e: UiohookKeyboardEvent): void => {
      const name = KEYCODE_TO_NAME[e.keycode]
      if (!name) return
      finish(name)
    }
    const timer = setTimeout(() => finish(null), timeoutMs)
    uIOhook.on('keydown', onKeyDown)
  })
}

export function pickPosition(): Promise<{ x: number; y: number } | null> {
  return new Promise((resolve) => {
    const displays = screen.getAllDisplays()
    const minX = Math.min(...displays.map((d) => d.bounds.x))
    const minY = Math.min(...displays.map((d) => d.bounds.y))
    const maxX = Math.max(...displays.map((d) => d.bounds.x + d.bounds.width))
    const maxY = Math.max(...displays.map((d) => d.bounds.y + d.bounds.height))

    const overlay = new BrowserWindow({
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      resizable: false,
      movable: false,
      skipTaskbar: true,
      hasShadow: false,
      focusable: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    })
    overlay.setAlwaysOnTop(true, 'screen-saver')

    let done = false
    const finish = (value: { x: number; y: number } | null): void => {
      if (done) return
      done = true
      ipcMain.removeListener(PICKER_RESULT_CHANNEL, onResult)
      if (!overlay.isDestroyed()) overlay.close()
      resolve(value)
    }
    const onResult = (_e: unknown, value: { x: number; y: number } | null): void => finish(value)
    ipcMain.on(PICKER_RESULT_CHANNEL, onResult)
    overlay.on('closed', () => finish(null))

    const html = `<!doctype html>
<html><body style="margin:0;cursor:crosshair;background:rgba(10,10,14,0.18);width:100vw;height:100vh;display:flex;align-items:flex-start;justify-content:center;user-select:none;">
  <div style="margin-top:28px;padding:10px 18px;background:#15151aee;color:#f5f5f7;border-radius:10px;font:13px -apple-system,'Segoe UI',sans-serif;border:1px solid #2a2a32;box-shadow:0 8px 24px rgba(0,0,0,0.35);">
    Cliquez pour capturer la position &mdash; &Eacute;chap pour annuler
  </div>
  <script>
    const { ipcRenderer } = require('electron')
    document.addEventListener('mousedown', (e) => {
      ipcRenderer.send('${PICKER_RESULT_CHANNEL}', { x: Math.round(e.screenX), y: Math.round(e.screenY) })
    })
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') ipcRenderer.send('${PICKER_RESULT_CHANNEL}', null)
    })
  </script>
</body></html>`

    overlay.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html))
    overlay.once('ready-to-show', () => overlay.show())
  })
}
