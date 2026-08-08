import type { Settings } from './types'

export const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  defaultMoveDurationMs: 300,
  defaultKeyDelayMs: 20,
  defaultCharDelayMs: 40,
  hotkeys: {
    start: 'F6',
    pause: 'F7',
    stop: 'F8',
    record: 'F9'
  },
  capture: {
    mouseMove: true,
    mouseClicks: true,
    keyboard: true,
    delays: true
  },
  mouseMoveSampleMs: 60,
  launchOnStartup: false,
  minimizeToTray: false
}
