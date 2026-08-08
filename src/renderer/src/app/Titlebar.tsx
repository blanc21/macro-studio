import { Minus, Square, X, Wand2 } from 'lucide-react'
import { IconButton } from '@renderer/components/ui/IconButton'

export function Titlebar(): React.JSX.Element {
  return (
    <div className="drag-region flex h-9 shrink-0 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] pl-3.5 pr-2">
      <div className="flex items-center gap-2 text-[12.5px] font-medium text-[var(--text-secondary)]">
        <Wand2 size={13} className="text-[var(--accent)]" />
        Macro Studio
      </div>
      <div className="flex items-center gap-1">
        <IconButton className="h-7 w-9 rounded-md" onClick={() => window.api.window.minimize()}>
          <Minus size={13} />
        </IconButton>
        <IconButton className="h-7 w-9 rounded-md" onClick={() => window.api.window.maximize()}>
          <Square size={11} />
        </IconButton>
        <IconButton
          className="h-7 w-9 rounded-md hover:bg-[var(--danger)] hover:text-white"
          onClick={() => window.api.window.close()}
        >
          <X size={14} />
        </IconButton>
      </div>
    </div>
  )
}
