import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Copy, GripVertical, Trash2 } from 'lucide-react'
import type { Action } from '@shared/types'
import { ACTION_LABELS } from '@shared/factory'
import { ACTION_ICONS } from './actionMeta'
import {
  MouseClickForm,
  MouseMoveForm,
  MouseScrollForm,
  KeyForm,
  TextForm,
  WaitForm
} from './ActionForms'
import { NumberField, Label } from '@renderer/components/ui/Field'
import { IconButton } from '@renderer/components/ui/IconButton'
import { Switch } from '@renderer/components/ui/Switch'
import { cn } from '@renderer/lib/cn'

interface ActionCardProps {
  action: Action
  index: number
  onChange: (patch: Partial<Action>) => void
  onDuplicate: () => void
  onRemove: () => void
  onToggle: () => void
}

export function ActionCard({
  action,
  index,
  onChange,
  onDuplicate,
  onRemove,
  onToggle
}: ActionCardProps): React.JSX.Element {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: action.id
  })
  const Icon = ACTION_ICONS[action.type]

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  function renderForm(): React.JSX.Element {
    switch (action.type) {
      case 'mouse-move':
        return <MouseMoveForm action={action} onChange={(p) => onChange(p as Partial<Action>)} />
      case 'mouse-click':
        return <MouseClickForm action={action} onChange={(p) => onChange(p as Partial<Action>)} />
      case 'mouse-scroll':
        return <MouseScrollForm action={action} onChange={(p) => onChange(p as Partial<Action>)} />
      case 'key':
        return <KeyForm action={action} onChange={(p) => onChange(p as Partial<Action>)} />
      case 'text':
        return <TextForm action={action} onChange={(p) => onChange(p as Partial<Action>)} />
      case 'wait':
        return <WaitForm action={action} onChange={(p) => onChange(p as Partial<Action>)} />
    }
  }

  return (
    <div ref={setNodeRef} style={style} className={cn('relative', isDragging && 'z-10 opacity-90')}>
      <div
        className={cn(
          'rounded-2xl border bg-[var(--surface)] shadow-[var(--shadow-soft)] transition-colors',
          action.enabled ? 'border-[var(--border)]' : 'border-[var(--border-subtle)] opacity-55'
        )}
      >
        <div className="flex items-center gap-2.5 border-b border-[var(--border-subtle)] px-3.5 py-2.5">
          <button
            {...attributes}
            {...listeners}
            className="no-drag cursor-grab text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] active:cursor-grabbing"
          >
            <GripVertical size={15} />
          </button>
          <span className="mono w-5 text-center text-[10.5px] text-[var(--text-tertiary)]">
            {index + 1}
          </span>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent-text)]">
            <Icon size={14} />
          </div>
          <span className="flex-1 text-[13px] font-medium text-[var(--text-primary)]">
            {ACTION_LABELS[action.type]}
          </span>
          <Switch checked={action.enabled} onChange={onToggle} />
          <IconButton title="Dupliquer" onClick={onDuplicate}>
            <Copy size={14} />
          </IconButton>
          <IconButton
            title="Supprimer"
            className="hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
            onClick={onRemove}
          >
            <Trash2 size={14} />
          </IconButton>
        </div>

        <div className="px-3.5 py-3.5">{renderForm()}</div>

        <div className="flex items-center gap-4 border-t border-[var(--border-subtle)] px-3.5 py-2.5">
          <div className="w-28">
            <Label>Délai avant (ms)</Label>
            <NumberField
              value={action.delayBeforeMs}
              min={0}
              onChange={(e) => onChange({ delayBeforeMs: Number(e.target.value) })}
            />
          </div>
          <div className="w-28">
            <Label>Délai après (ms)</Label>
            <NumberField
              value={action.delayAfterMs}
              min={0}
              onChange={(e) => onChange({ delayAfterMs: Number(e.target.value) })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
