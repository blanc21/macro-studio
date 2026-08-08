import {
  MousePointerClick,
  Move,
  ArrowUpDown,
  Keyboard,
  Type,
  Timer,
  type LucideIcon
} from 'lucide-react'
import type { ActionType } from '@shared/types'

export const ACTION_ICONS: Record<ActionType, LucideIcon> = {
  'mouse-move': Move,
  'mouse-click': MousePointerClick,
  'mouse-scroll': ArrowUpDown,
  key: Keyboard,
  text: Type,
  wait: Timer
}
