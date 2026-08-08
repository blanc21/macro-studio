import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Circle,
  MousePointer2,
  Move,
  Keyboard as KeyboardIcon,
  Timer,
  Square,
  Check
} from 'lucide-react'
import { useNavStore } from '@renderer/store/useNavStore'
import { useEditorStore } from '@renderer/store/useEditorStore'
import { useMacrosStore } from '@renderer/store/useMacrosStore'
import { useSettingsStore } from '@renderer/store/useSettingsStore'
import { useToastStore } from '@renderer/store/useToastStore'
import { Card } from '@renderer/components/ui/Card'
import { Button } from '@renderer/components/ui/Button'
import { Switch } from '@renderer/components/ui/Switch'
import { EmptyState } from '@renderer/components/ui/EmptyState'
import { ACTION_LABELS } from '@shared/factory'
import { ACTION_ICONS } from '@renderer/components/actions/actionMeta'
import type { Action, CaptureToggles } from '@shared/types'

function actionSummary(action: Action): string {
  switch (action.type) {
    case 'mouse-move':
      return `X:${action.x} Y:${action.y}`
    case 'mouse-click':
      return `${action.button} · ${action.mode}`
    case 'mouse-scroll':
      return `${action.direction} · ${action.amount}`
    case 'key':
      return `${action.keys.join(' + ')} · ${action.mode}`
    case 'text':
      return action.content.slice(0, 24) || '(vide)'
    case 'wait':
      return `${action.ms} ms`
  }
}

export function Recording(): React.JSX.Element {
  const editingId = useNavStore((s) => s.editingMacroId)
  const openEditor = useNavStore((s) => s.openEditor)
  const editorMacro = useEditorStore((s) => s.macro)
  const insertRecordedActions = useEditorStore((s) => s.insertRecordedActions)
  const editorSave = useEditorStore((s) => s.save)
  const createMacro = useMacrosStore((s) => s.create)
  const settings = useSettingsStore((s) => s.settings)
  const push = useToastStore((s) => s.push)

  const [recording, setRecording] = useState(false)
  const [captured, setCaptured] = useState<Action[]>([])
  const [toggles, setToggles] = useState<CaptureToggles>(settings.capture)

  useEffect(() => {
    if (!recording) return
    return window.api.recording.onActionCaptured((action) => {
      setCaptured((prev) => [...prev, action])
    })
  }, [recording])

  async function start(): Promise<void> {
    setCaptured([])
    setRecording(true)
    await window.api.recording.start(toggles)
  }

  async function stop(): Promise<void> {
    setRecording(false)
    await window.api.recording.stop()
  }

  async function applyToMacro(): Promise<void> {
    if (captured.length === 0) return
    if (editingId && editorMacro?.id === editingId) {
      insertRecordedActions(captured)
      await editorSave()
      push('Actions ajoutées à la macro', 'success')
      openEditor(editingId)
    } else {
      const macro = await createMacro('Macro enregistrée')
      await window.api.macros.update({ ...macro, actions: captured })
      push('Nouvelle macro créée depuis l’enregistrement', 'success')
      openEditor(macro.id)
    }
  }

  useEffect(() => {
    return window.api.hotkeys.onTriggered((action) => {
      if (action !== 'record') return
      if (recording) void stop()
      else void start()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recording, toggles])

  return (
    <div className="mx-auto max-w-2xl px-8 py-8">
      <h1 className="text-[19px] font-semibold tracking-tight text-[var(--text-primary)]">
        Enregistrement automatique
      </h1>
      <p className="mt-1 text-[12.5px] text-[var(--text-tertiary)]">
        {editingId && editorMacro?.id === editingId
          ? `Les actions seront ajoutées à « ${editorMacro.name} ».`
          : 'Effectuez vos actions, Macro Studio les capture automatiquement.'}
      </p>

      <Card className="mt-6 p-5">
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              ['mouseMove', 'Mouvements de souris', Move],
              ['mouseClicks', 'Clics souris', MousePointer2],
              ['keyboard', 'Clavier', KeyboardIcon],
              ['delays', 'Délais entre actions', Timer]
            ] as const
          ).map(([key, label, Icon]) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-lg bg-[var(--bg-elevated)] px-3 py-2"
            >
              <span className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
                <Icon size={14} />
                {label}
              </span>
              <Switch
                checked={toggles[key]}
                onChange={(v) => setToggles((t) => ({ ...t, [key]: v }))}
                disabled={recording}
              />
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-center">
          {!recording ? (
            <Button variant="danger" size="lg" onClick={start}>
              <Circle size={14} className="fill-current" />
              Démarrer l’enregistrement (F9)
            </Button>
          ) : (
            <Button variant="primary" size="lg" onClick={stop}>
              <Square size={13} className="fill-current" />
              Arrêter l’enregistrement
            </Button>
          )}
        </div>
      </Card>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[12.5px] font-medium text-[var(--text-secondary)]">
            Actions capturées ({captured.length})
          </h2>
          {!recording && captured.length > 0 && (
            <Button variant="primary" size="sm" onClick={applyToMacro}>
              <Check size={13} />
              Utiliser ces actions
            </Button>
          )}
        </div>

        {captured.length === 0 ? (
          <Card className="py-2">
            <EmptyState
              icon={Circle}
              title="Aucune action capturée"
              description="Lancez l'enregistrement puis effectuez vos actions à la souris et au clavier."
            />
          </Card>
        ) : (
          <div className="max-h-80 space-y-1.5 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {captured.map((action, i) => {
                const Icon = ACTION_ICONS[action.type]
                return (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2"
                  >
                    <span className="mono w-5 text-[10px] text-[var(--text-tertiary)]">
                      {i + 1}
                    </span>
                    <Icon size={13} className="text-[var(--accent-text)]" />
                    <span className="text-[12px] font-medium text-[var(--text-primary)]">
                      {ACTION_LABELS[action.type]}
                    </span>
                    <span className="mono truncate text-[11px] text-[var(--text-tertiary)]">
                      {actionSummary(action)}
                    </span>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
