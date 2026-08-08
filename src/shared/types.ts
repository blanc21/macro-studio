export type MouseButton = 'left' | 'right' | 'middle'
export type ClickMode = 'single' | 'double' | 'down' | 'up'
export type ScrollDirection = 'up' | 'down' | 'left' | 'right'
export type KeyMode = 'press' | 'down' | 'up' | 'hold'
export type TextMode = 'instant' | 'char-by-char'

interface BaseAction {
  id: string
  enabled: boolean
  delayBeforeMs: number
  delayAfterMs: number
}

export interface MouseMoveAction extends BaseAction {
  type: 'mouse-move'
  x: number
  y: number
  durationMs: number
  relative: boolean
}

export interface MouseClickAction extends BaseAction {
  type: 'mouse-click'
  button: MouseButton
  mode: ClickMode
}

export interface MouseScrollAction extends BaseAction {
  type: 'mouse-scroll'
  direction: ScrollDirection
  amount: number
}

export interface KeyAction extends BaseAction {
  type: 'key'
  keys: string[]
  mode: KeyMode
  holdMs: number
}

export interface TextAction extends BaseAction {
  type: 'text'
  content: string
  mode: TextMode
  charDelayMs: number
}

export interface WaitAction extends BaseAction {
  type: 'wait'
  ms: number
  randomMaxMs: number | null
}

export type Action =
  MouseMoveAction | MouseClickAction | MouseScrollAction | KeyAction | TextAction | WaitAction

export type ActionType = Action['type']

export type RepeatMode = 'once' | 'count' | 'infinite'

export interface RepeatConfig {
  mode: RepeatMode
  count: number
  pauseBetweenMs: number
}

export interface MacroStats {
  execCount: number
  lastRunAt: number | null
  totalRunMs: number
}

export interface Macro {
  id: string
  name: string
  description: string
  actions: Action[]
  repeat: RepeatConfig
  stats: MacroStats
  createdAt: number
  updatedAt: number
}

export type MacroSummary = Pick<
  Macro,
  'id' | 'name' | 'description' | 'stats' | 'createdAt' | 'updatedAt'
> & { actionCount: number }

export type EngineStatus = 'idle' | 'running' | 'paused' | 'stopped'

export interface EngineProgress {
  status: EngineStatus
  macroId: string | null
  macroName: string | null
  currentActionIndex: number
  totalActions: number
  currentRepeat: number
  /** -1 means infinite */
  totalRepeats: number
  elapsedMs: number
  currentAction: Action | null
  error: string | null
}

export type HotkeyAction = 'start' | 'pause' | 'stop' | 'record'

export type HotkeyMap = Record<HotkeyAction, string>

export interface CaptureToggles {
  mouseMove: boolean
  mouseClicks: boolean
  keyboard: boolean
  delays: boolean
}

export interface Settings {
  theme: 'dark' | 'light'
  defaultMoveDurationMs: number
  defaultKeyDelayMs: number
  defaultCharDelayMs: number
  hotkeys: HotkeyMap
  capture: CaptureToggles
  mouseMoveSampleMs: number
  launchOnStartup: boolean
  minimizeToTray: boolean
}

export interface RecordedActionBatch {
  actions: Action[]
}

export type ToastVariant = 'success' | 'error' | 'info'

export interface AppStats {
  macroCount: number
  totalExecutions: number
  totalActiveMs: number
}
