import { app } from 'electron'
import { promises as fs } from 'fs'
import path from 'path'
import { DEFAULT_SETTINGS } from '../../shared/defaultSettings'
import type { Settings } from '../../shared/types'

let settingsPath = ''
let current: Settings = DEFAULT_SETTINGS

export async function initSettingsStore(): Promise<void> {
  settingsPath = path.join(app.getPath('userData'), 'settings.json')
  try {
    const raw = await fs.readFile(settingsPath, 'utf-8')
    current = { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) }
  } catch {
    current = DEFAULT_SETTINGS
    await fs.writeFile(settingsPath, JSON.stringify(current, null, 2), 'utf-8')
  }
}

export function getSettings(): Settings {
  return current
}

export async function updateSettings(partial: Partial<Settings>): Promise<Settings> {
  current = { ...current, ...partial }
  await fs.writeFile(settingsPath, JSON.stringify(current, null, 2), 'utf-8')
  return current
}
