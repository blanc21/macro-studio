import { nanoid } from 'nanoid'
import type { Action, ActionType, Macro } from './types'

function baseAction(): Pick<Action, 'id' | 'enabled' | 'delayBeforeMs' | 'delayAfterMs'> {
  return { id: nanoid(8), enabled: true, delayBeforeMs: 0, delayAfterMs: 200 }
}

export function createAction(type: ActionType): Action {
  const base = baseAction()
  switch (type) {
    case 'mouse-move':
      return { ...base, type, x: 500, y: 300, durationMs: 300, relative: false }
    case 'mouse-click':
      return { ...base, type, button: 'left', mode: 'single' }
    case 'mouse-scroll':
      return { ...base, type, direction: 'down', amount: 3 }
    case 'key':
      return { ...base, type, keys: ['E'], mode: 'press', holdMs: 500 }
    case 'text':
      return { ...base, type, content: '', mode: 'instant', charDelayMs: 40 }
    case 'wait':
      return { ...base, type, ms: 500, randomMaxMs: null }
  }
}

export function createMacro(name = 'Nouvelle macro'): Macro {
  const now = Date.now()
  return {
    id: nanoid(10),
    name,
    description: '',
    actions: [],
    repeat: { mode: 'once', count: 10, pauseBetweenMs: 500 },
    stats: { execCount: 0, lastRunAt: null, totalRunMs: 0 },
    createdAt: now,
    updatedAt: now
  }
}

export const ACTION_LABELS: Record<ActionType, string> = {
  'mouse-move': 'Déplacer la souris',
  'mouse-click': 'Clic souris',
  'mouse-scroll': 'Molette',
  key: 'Touche clavier',
  text: 'Texte',
  wait: 'Attendre'
}
