import { Plus } from 'lucide-react'
import type { ActionType } from '@shared/types'
import { ACTION_LABELS } from '@shared/factory'
import { ACTION_ICONS } from './actionMeta'

const TYPES: ActionType[] = ['mouse-move', 'mouse-click', 'mouse-scroll', 'key', 'text', 'wait']

export function AddActionRow({ onAdd }: { onAdd: (type: ActionType) => void }): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--border)] p-4">
      {TYPES.map((type) => {
        const Icon = ACTION_ICONS[type]
        return (
          <button
            key={type}
            onClick={() => onAdd(type)}
            className="no-drag flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent-text)]"
          >
            <Plus size={12} />
            <Icon size={13} />
            {ACTION_LABELS[type]}
          </button>
        )
      })}
    </div>
  )
}
