import { UiohookKey } from 'uiohook-napi'

const NAME_OVERRIDES: Record<string, string> = {
  Enter: 'ENTER',
  Escape: 'ESC',
  Backspace: 'BACKSPACE',
  Tab: 'TAB',
  Space: 'SPACE',
  CapsLock: 'CAPSLOCK',
  PageUp: 'PAGEUP',
  PageDown: 'PAGEDOWN',
  End: 'END',
  Home: 'HOME',
  ArrowLeft: 'LEFT',
  ArrowUp: 'UP',
  ArrowRight: 'RIGHT',
  ArrowDown: 'DOWN',
  Insert: 'INSERT',
  Delete: 'DELETE',
  Ctrl: 'CTRL',
  CtrlRight: 'RCTRL',
  Alt: 'ALT',
  AltRight: 'RALT',
  Shift: 'SHIFT',
  ShiftRight: 'RSHIFT',
  Meta: 'WIN',
  MetaRight: 'RWIN',
  NumLock: 'NUMLOCK',
  ScrollLock: 'SCROLLLOCK',
  PrintScreen: 'PRINTSCREEN',
  Semicolon: ';',
  Equal: '=',
  Comma: ',',
  Minus: '-',
  Period: '.',
  Slash: '/',
  Backquote: '`',
  BracketLeft: '[',
  Backslash: '\\',
  BracketRight: ']',
  Quote: "'",
  NumpadMultiply: 'MULTIPLY',
  NumpadAdd: 'ADD',
  NumpadSubtract: 'SUBTRACT',
  NumpadDecimal: 'DECIMAL',
  NumpadDivide: 'DIVIDE'
}

export const KEYCODE_TO_NAME: Record<number, string> = {}
for (const [name, code] of Object.entries(UiohookKey)) {
  if (typeof code !== 'number') continue
  if (code in KEYCODE_TO_NAME) continue
  KEYCODE_TO_NAME[code] = NAME_OVERRIDES[name] ?? name.toUpperCase()
}

export const NAME_TO_KEYCODE: Record<string, number> = {}
for (const [code, name] of Object.entries(KEYCODE_TO_NAME)) {
  NAME_TO_KEYCODE[name] = Number(code)
}
