import * as simulator from '../input/simulator'
import type { Action } from '../../shared/types'

export async function runAction(action: Action): Promise<void> {
  switch (action.type) {
    case 'mouse-move':
      await simulator.moveMouse(action.x, action.y, action.durationMs, action.relative)
      return
    case 'mouse-click':
      await simulator.click(action.button, action.mode)
      return
    case 'mouse-scroll':
      await simulator.scroll(action.direction, action.amount)
      return
    case 'key':
      await simulator.keyAction(action.keys, action.mode, action.holdMs)
      return
    case 'text':
      await simulator.typeText(action.content, action.mode, action.charDelayMs)
      return
    case 'wait':
      return
  }
}

export function resolveWaitMs(action: Extract<Action, { type: 'wait' }>): number {
  if (action.randomMaxMs != null && action.randomMaxMs > action.ms) {
    return action.ms + Math.floor(Math.random() * (action.randomMaxMs - action.ms + 1))
  }
  return action.ms
}
