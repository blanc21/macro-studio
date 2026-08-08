import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Pause, Play, Square } from 'lucide-react'
import { useEngineStore } from '@renderer/store/useEngineStore'
import { ACTION_LABELS } from '@shared/factory'
import { ACTION_ICONS } from '@renderer/components/actions/actionMeta'
import { formatDuration } from '@renderer/lib/format'
import { Button } from '@renderer/components/ui/Button'

export function RunOverlay(): React.JSX.Element | null {
  const progress = useEngineStore((s) => s.progress)
  const pause = useEngineStore((s) => s.pause)
  const resume = useEngineStore((s) => s.resume)
  const stop = useEngineStore((s) => s.stop)

  const startedAtRef = useRef<number | null>(null)
  const [elapsed, setElapsed] = useState(0)

  const visible = progress.status === 'running' || progress.status === 'paused'

  useEffect(() => {
    if (!visible) {
      startedAtRef.current = null
      return
    }
    if (startedAtRef.current === null) startedAtRef.current = Date.now() - progress.elapsedMs
    const interval = setInterval(() => {
      if (startedAtRef.current !== null) setElapsed(Date.now() - startedAtRef.current)
    }, 400)
    return () => clearInterval(interval)
  }, [visible, progress.elapsedMs])

  const Icon = progress.currentAction ? ACTION_ICONS[progress.currentAction.type] : null
  const progressPct =
    progress.totalActions > 0
      ? Math.min(100, Math.round(((progress.currentActionIndex + 1) / progress.totalActions) * 100))
      : 0
  const repeatLabel = progress.totalRepeats === -1 ? '∞' : progress.totalRepeats

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed bottom-14 right-4 z-50 w-[320px] rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/95 p-4 shadow-[var(--shadow-lift)] backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--success)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)] animate-ms-pulse" />
              Automatisation en cours
            </div>
            <span className="mono text-[11px] text-[var(--text-tertiary)]">
              {formatDuration(elapsed)}
            </span>
          </div>

          <div className="mt-2 truncate text-[14px] font-medium text-[var(--text-primary)]">
            {progress.macroName}
          </div>

          <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-[var(--bg-elevated)] px-2.5 py-2">
            {Icon && <Icon size={14} className="shrink-0 text-[var(--accent-text)]" />}
            <span className="truncate text-[12px] text-[var(--text-secondary)]">
              {progress.currentAction
                ? ACTION_LABELS[progress.currentAction.type]
                : 'Pause entre répétitions'}
            </span>
          </div>

          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface)]">
            <motion.div
              className="h-full rounded-full bg-[var(--accent)]"
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.25 }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--text-tertiary)]">
            <span>
              Action {Math.min(progress.currentActionIndex + 1, progress.totalActions)}/
              {progress.totalActions}
            </span>
            <span>
              Répétition {progress.currentRepeat + 1}/{repeatLabel}
            </span>
          </div>

          <div className="mt-3.5 flex gap-1.5">
            <Button
              size="sm"
              variant="secondary"
              className="flex-1"
              onClick={() => (progress.status === 'running' ? pause() : resume())}
            >
              {progress.status === 'running' ? <Pause size={13} /> : <Play size={13} />}
              {progress.status === 'running' ? 'Pause' : 'Reprendre'}
            </Button>
            <Button size="sm" variant="danger" className="flex-1" onClick={stop}>
              <Square size={12} />
              Arrêter
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
