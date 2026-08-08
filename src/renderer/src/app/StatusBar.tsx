import { Play, Pause, Square } from 'lucide-react'
import { useEngineStore } from '@renderer/store/useEngineStore'
import { useEditorStore } from '@renderer/store/useEditorStore'
import { useNavStore } from '@renderer/store/useNavStore'
import { useToastStore } from '@renderer/store/useToastStore'
import { Button } from '@renderer/components/ui/Button'
import { cn } from '@renderer/lib/cn'

const STATUS_LABEL: Record<string, string> = {
  idle: 'Prêt',
  running: 'Automatisation en cours',
  paused: 'En pause',
  stopped: 'Arrêt en cours...'
}

const STATUS_DOT: Record<string, string> = {
  idle: 'bg-[var(--text-tertiary)]',
  running: 'bg-[var(--success)] animate-ms-pulse',
  paused: 'bg-[var(--warning)]',
  stopped: 'bg-[var(--danger)]'
}

export function StatusBar(): React.JSX.Element {
  const progress = useEngineStore((s) => s.progress)
  const run = useEngineStore((s) => s.run)
  const pause = useEngineStore((s) => s.pause)
  const resume = useEngineStore((s) => s.resume)
  const stop = useEngineStore((s) => s.stop)
  const macro = useEditorStore((s) => s.macro)
  const page = useNavStore((s) => s.page)
  const push = useToastStore((s) => s.push)

  const idle = progress.status === 'idle'
  const running = progress.status === 'running'
  const paused = progress.status === 'paused'
  const canStart = idle && page === 'editor' && !!macro && macro.actions.length > 0

  const label =
    running && progress.macroName
      ? `${STATUS_LABEL.running} · ${progress.macroName}`
      : STATUS_LABEL[progress.status]

  return (
    <div className="drag-region flex h-9 shrink-0 items-center justify-between border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3.5">
      <div className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
        <span className={cn('h-1.5 w-1.5 rounded-full', STATUS_DOT[progress.status])} />
        {label}
      </div>
      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          variant="primary"
          disabled={!canStart}
          onClick={() => macro && run(macro)}
          title={canStart ? 'Démarrer (F6)' : 'Ouvrez une macro pour la démarrer'}
        >
          <Play size={13} />
          Démarrer
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={!running && !paused}
          onClick={() => {
            if (running) pause()
            else if (paused) resume()
          }}
          title="Pause (F7)"
        >
          <Pause size={13} />
          {paused ? 'Reprendre' : 'Pause'}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={!running && !paused}
          onClick={() => {
            stop()
            push('Macro arrêtée', 'info')
          }}
          title="Arrêter (F8)"
        >
          <Square size={12} />
          Arrêter
        </Button>
      </div>
    </div>
  )
}
