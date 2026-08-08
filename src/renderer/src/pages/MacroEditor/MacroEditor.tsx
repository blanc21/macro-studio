import { useEffect, useRef } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ChevronDown, Loader2, Radio, Wand2 } from 'lucide-react'
import { useEditorStore } from '@renderer/store/useEditorStore'
import { useNavStore } from '@renderer/store/useNavStore'
import { ActionCard } from '@renderer/components/actions/ActionCard'
import { AddActionRow } from '@renderer/components/actions/AddActionRow'
import { RepeatConfigPanel } from '@renderer/components/actions/RepeatConfigPanel'
import { EmptyState } from '@renderer/components/ui/EmptyState'
import { Button } from '@renderer/components/ui/Button'
import { TextField } from '@renderer/components/ui/Field'

export function MacroEditor(): React.JSX.Element | null {
  const editingId = useNavStore((s) => s.editingMacroId)
  const goTo = useNavStore((s) => s.goTo)
  const openRecording = useNavStore((s) => s.openRecording)

  const macro = useEditorStore((s) => s.macro)
  const dirty = useEditorStore((s) => s.dirty)
  const saving = useEditorStore((s) => s.saving)
  const load = useEditorStore((s) => s.load)
  const save = useEditorStore((s) => s.save)
  const rename = useEditorStore((s) => s.rename)
  const addAction = useEditorStore((s) => s.addAction)
  const updateAction = useEditorStore((s) => s.updateAction)
  const removeAction = useEditorStore((s) => s.removeAction)
  const duplicateAction = useEditorStore((s) => s.duplicateAction)
  const reorderActions = useEditorStore((s) => s.reorderActions)
  const toggleAction = useEditorStore((s) => s.toggleAction)
  const setRepeat = useEditorStore((s) => s.setRepeat)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!editingId) return
    if (macro?.id === editingId) return
    void window.api.macros.get(editingId).then((m) => {
      if (m) load(m)
    })
  }, [editingId, macro?.id, load])

  useEffect(() => {
    if (!dirty) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => void save(), 700)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [dirty, save])

  if (!macro) return null

  function handleDragEnd(event: DragEndEvent): void {
    const { active, over } = event
    if (over && active.id !== over.id) {
      reorderActions(String(active.id), String(over.id))
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <button
        onClick={() => goTo('library')}
        className="no-drag mb-4 flex items-center gap-1.5 text-[12px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
      >
        <ArrowLeft size={13} />
        Bibliothèque
      </button>

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <TextField
            value={macro.name}
            onChange={(e) => rename(e.target.value)}
            className="h-auto border-none bg-transparent px-0 text-[22px] font-semibold tracking-tight text-[var(--text-primary)] focus:border-none"
          />
          <div className="mt-1 flex items-center gap-2 text-[12px] text-[var(--text-tertiary)]">
            <span>
              {macro.actions.length} action{macro.actions.length > 1 ? 's' : ''}
            </span>
            <span>·</span>
            <span>
              {saving
                ? 'Enregistrement...'
                : dirty
                  ? 'Modifications non enregistrées'
                  : 'Enregistré'}
            </span>
            {saving && <Loader2 size={11} className="animate-spin" />}
          </div>
        </div>
        <Button variant="secondary" onClick={() => openRecording(macro.id)}>
          <Radio size={14} className="text-[var(--danger)]" />
          Enregistrer des actions
        </Button>
      </div>

      <div className="mt-7">
        {macro.actions.length === 0 ? (
          <EmptyState
            icon={Wand2}
            title="Cette macro est vide"
            description="Ajoutez des actions ci-dessous ou utilisez l'enregistrement pour capturer une séquence automatiquement."
          />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={macro.actions.map((a) => a.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col items-stretch">
                <AnimatePresence initial={false}>
                  {macro.actions.map((action, index) => (
                    <motion.div
                      key={action.id}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      {index > 0 && (
                        <div className="flex justify-center py-1 text-[var(--text-tertiary)]">
                          <ChevronDown size={16} />
                        </div>
                      )}
                      <ActionCard
                        action={action}
                        index={index}
                        onChange={(patch) => updateAction(action.id, patch)}
                        onDuplicate={() => duplicateAction(action.id)}
                        onRemove={() => removeAction(action.id)}
                        onToggle={() => toggleAction(action.id)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <div className="mt-4">
        <AddActionRow onAdd={addAction} />
      </div>

      <div className="mt-5">
        <RepeatConfigPanel repeat={macro.repeat} onChange={setRepeat} />
      </div>
    </div>
  )
}
