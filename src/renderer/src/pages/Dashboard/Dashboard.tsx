import { useEffect } from 'react'
import { ListVideo, Play, Plus, TimerReset, Wand2 } from 'lucide-react'
import { useMacrosStore } from '@renderer/store/useMacrosStore'
import { useNavStore } from '@renderer/store/useNavStore'
import { useEditorStore } from '@renderer/store/useEditorStore'
import { StatCard } from '@renderer/components/ui/StatCard'
import { EmptyState } from '@renderer/components/ui/EmptyState'
import { Button } from '@renderer/components/ui/Button'
import { Card } from '@renderer/components/ui/Card'
import { formatDuration, formatRelativeTime } from '@renderer/lib/format'

export function Dashboard(): React.JSX.Element {
  const macros = useMacrosStore((s) => s.macros)
  const stats = useMacrosStore((s) => s.stats)
  const refresh = useMacrosStore((s) => s.refresh)
  const refreshStats = useMacrosStore((s) => s.refreshStats)
  const create = useMacrosStore((s) => s.create)
  const openEditor = useNavStore((s) => s.openEditor)
  const loadEditor = useEditorStore((s) => s.load)

  useEffect(() => {
    void refresh()
    void refreshStats()
  }, [refresh, refreshStats])

  const recent = macros.slice(0, 6)

  async function handleCreate(): Promise<void> {
    const macro = await create()
    loadEditor(macro)
    openEditor(macro.id)
  }

  async function openMacro(id: string): Promise<void> {
    const macro = await window.api.macros.get(id)
    if (!macro) return
    loadEditor(macro)
    openEditor(id)
  }

  return (
    <div className="mx-auto max-w-4xl px-8 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-[var(--text-primary)]">
            Bonjour 👋
          </h1>
          <p className="mt-1 text-[13px] text-[var(--text-tertiary)]">
            Bienvenue dans Macro Studio.
          </p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          <Plus size={15} />
          Nouvelle macro
        </Button>
      </div>

      <div className="mt-7 grid grid-cols-3 gap-3.5">
        <StatCard icon={ListVideo} label="Macros" value={String(stats.macroCount)} />
        <StatCard
          icon={Play}
          label="Exécutions"
          value={stats.totalExecutions.toLocaleString('fr-FR')}
        />
        <StatCard
          icon={TimerReset}
          label="Temps actif"
          value={formatDuration(stats.totalActiveMs)}
        />
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-[13px] font-medium text-[var(--text-secondary)]">
          Macros récentes
        </h2>

        {recent.length === 0 ? (
          <Card className="py-2">
            <EmptyState
              icon={Wand2}
              title="Aucune macro pour le moment"
              description="Créez votre première macro pour automatiser des actions répétitives dans vos jeux ou logiciels."
              action={
                <Button variant="primary" size="sm" onClick={handleCreate}>
                  <Plus size={14} />
                  Créer une macro
                </Button>
              }
            />
          </Card>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {recent.map((m) => (
              <Card
                key={m.id}
                onClick={() => void openMacro(m.id)}
                className="cursor-pointer p-4 transition-colors hover:border-[var(--accent)]"
              >
                <div className="truncate text-[13.5px] font-medium text-[var(--text-primary)]">
                  {m.name}
                </div>
                <div className="mt-1 text-[11.5px] text-[var(--text-tertiary)]">
                  {m.actionCount} action{m.actionCount > 1 ? 's' : ''} ·{' '}
                  {formatRelativeTime(m.stats.lastRunAt)}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
