import { Tray, Menu, app, nativeImage } from 'electron'
import icon from '../../resources/icon.png?asset'
import { getMainWindow } from './window'

let tray: Tray | null = null

export function createTray(): void {
  if (tray) return
  tray = new Tray(nativeImage.createFromPath(icon).resize({ width: 16, height: 16 }))
  tray.setToolTip('Macro Studio')
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: 'Ouvrir Macro Studio',
        click: () => {
          const win = getMainWindow()
          if (win) {
            win.show()
            win.focus()
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Quitter',
        click: () => app.quit()
      }
    ])
  )
  tray.on('click', () => {
    const win = getMainWindow()
    if (win) {
      win.isVisible() ? win.hide() : win.show()
    }
  })
}

export function destroyTray(): void {
  tray?.destroy()
  tray = null
}
