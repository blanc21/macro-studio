import { useEffect, useMemo, useState } from 'react'
import { Copy, Download, Pencil, Plus, Search, Trash2, Upload, Wand2 } from 'lucide-react'
import { useMacrosStore } from '@renderer/store/useMacrosStore'
import { useNavStore } from '@renderer/store/useNavStore'
import { useEditorStore } from '@renderer/store/useEditorStore'
import { useToastStore } from '@renderer/store/useToastStore'
import { Card } from '@renderer/components/ui/Card'
import { Button } from '@renderer/components/ui/Button'
import { IconButton } from '@renderer/components/ui/IconButton'
import { EmptyState } from '@renderer/components/ui/EmptyState'
import { ConfirmDialog } from '@renderer/components/ui/ConfirmDialog'
import { TextField } from '@renderer/components/ui/Field'
import { formatRelativeTime } from '@renderer/lib/format'
import type { MacroSummary } from '@shared/types'

export function MacroLibrary(): React.JSX.Element {
  const macros = useMacrosStore((s) => s.macros)
  const refresh = useMacrosStore((s) => s.refresh)
  const create = useMacrosStore((s) => s.create)
  const rename = useMacrosStore((s) => s.rename)
  const duplicate = useMacrosStore((s) => s.duplicate)
  const remove = useMacrosStore((s) => s.remove)
  const exportMacro = useMacrosStore((s) => s.exportMacro)
  const importMacro = useMacrosStore((s) => s.importMacro)
  const openEditor = useNavStore((s) => s.openEditor)
  const loadEditor = useEditorStore((s) => s.load)
  const push = useToastStore((s) => s.push)

  const [query, setQuery] = useState('')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [pendingDelete, setPendingDelete] = useState<MacroSummary | null>(null)

  useEffect(() => {
    void refresh()
  }, [refresh])

  const filtered = useMemo(
    () => macros.filter((m) => m.name.toLowerCase().includes(query.toLowerCase())),
    [macros, query]
  )

  async function openMacro(id: string): Promise<void> {
    const macro = await window.api.macros.get(id)
    if (!macro) return
    loadEditor(macro)
    openEditor(id)
  }

  async function handleCreate(): Promise<void> {
    const macro = await create()
    loadEditor(macro)
    openEditor(macro.id)
  }

  function startRename(m: MacroSummary): void {
    setRenamingId(m.id)
    setRenameValue(m.name)
  }

  async function commitRename(): Promise<void> {
    if (renamingId && renameValue.trim()) {
      await rename(renamingId, renameValue.trim())
    }
    setRenamingId(null)
  }

  return (
    <div className="mx-auto max-w-5xl px-8 py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[19px] font-semibold tracking-tight text-[var(--text-primary)]">
            Mes macros
          </h1>
          <p className="mt-1 text-[12.5px] text-[var(--text-tertiary)]">
            {macros.length} macro{macros.length > 1 ? 's' : ''} enregistrée
            {macros.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={async () => {
              const res = await importMacro()
              if (res.ok) push('Macro importée', 'success')
            }}
          >
            <Upload size={14} />
            Importer
          </Button>
          <Button variant="primary" onClick={handleCreate}>
            <Plus size={15} />
            Nouvelle macro
          </Button>
        </div>
      </div>

      <div className="relative mt-5 max-w-xs">
        <Search
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
        />
        <TextField
          placeholder="Rechercher une macro..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Wand2}
          title={macros.length === 0 ? 'Aucune macro pour le moment' : 'Aucun résultat'}
          description={
            macros.length === 0
              ? 'Créez votre première macro pour automatiser des actions répétitives.'
              : 'Essayez un autre terme de recherche.'
          }
          action={
            macros.length === 0 ? (
              <Button variant="primary" size="sm" onClick={handleCreate}>
                <Plus size={14} />
                Créer une macro
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="mt-6 grid grid-cols-3 gap-3.5">
          {filtered.map((m) => (
            <Card key={m.id} className="flex flex-col p-4">
              {renamingId === m.id ? (
                <TextField
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => void commitRename()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void commitRename()
                    if (e.key === 'Escape') setRenamingId(null)
                  }}
                />
              ) : (
                <button
                  className="truncate text-left text-[14px] font-medium text-[var(--text-primary)] hover:text-[var(--accent-text)]"
                  onClick={() => void openMacro(m.id)}
                >
                  {m.name}
                </button>
              )}

              <div className="mt-1.5 text-[11.5px] text-[var(--text-tertiary)]">
                {m.actionCount} action{m.actionCount > 1 ? 's' : ''} · {m.stats.execCount} exécution
                {m.stats.execCount > 1 ? 's' : ''}
              </div>
              <div className="text-[11px] text-[var(--text-tertiary)]">
                Dernière utilisation : {formatRelativeTime(m.stats.lastRunAt)}
              </div>

              <div className="mt-3.5 flex items-center gap-1 border-t border-[var(--border-subtle)] pt-2.5">
                <IconButton title="Renommer" onClick={() => startRename(m)}>
                  <Pencil size={14} />
                </IconButton>
                <IconButton title="Dupliquer" onClick={() => void duplicate(m.id)}>
                  <Copy size={14} />
                </IconButton>
                <IconButton
                  title="Exporter"
                  onClick={async () => {
                    const res = await exportMacro(m.id)
                    if (res.ok) push('Macro exportée', 'success')
                  }}
                >
                  <Download size={14} />
                </IconButton>
                <div className="flex-1" />
                <IconButton
                  title="Supprimer"
                  className="hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
                  onClick={() => setPendingDelete(m)}
                >
                  <Trash2 size={14} />
                </IconButton>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title={`Supprimer « ${pendingDelete?.name ?? ''} » ?`}
        description="Cette action est définitive et supprimera toutes les actions de cette macro."
        confirmLabel="Supprimer"
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (pendingDelete) {
            await remove(pendingDelete.id)
            push('Macro supprimée', 'info')
          }
          setPendingDelete(null)
        }}
      />
    </div>
  )
}
