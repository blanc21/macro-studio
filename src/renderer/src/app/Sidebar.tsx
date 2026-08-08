import { Home, ListVideo, Radio, Settings as SettingsIcon } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useNavStore, type PageId } from '@renderer/store/useNavStore'
import { cn } from '@renderer/lib/cn'

interface NavItem {
  id: PageId
  label: string
  icon: LucideIcon
}

const items: NavItem[] = [
  { id: 'dashboard', label: 'Accueil', icon: Home },
  { id: 'library', label: 'Macros', icon: ListVideo },
  { id: 'recording', label: 'Enregistrer', icon: Radio },
  { id: 'settings', label: 'Paramètres', icon: SettingsIcon }
]

export function Sidebar(): React.JSX.Element {
  const page = useNavStore((s) => s.page)
  const goTo = useNavStore((s) => s.goTo)
  const openRecording = useNavStore((s) => s.openRecording)

  return (
    <nav className="flex w-[190px] shrink-0 flex-col gap-0.5 border-r border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-2.5">
      {items.map((item) => {
        const active = page === item.id || (item.id === 'library' && page === 'editor')
        const Icon = item.icon
        return (
          <button
            key={item.id}
            onClick={() => (item.id === 'recording' ? openRecording(null) : goTo(item.id))}
            className={cn(
              'no-drag flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-colors',
              active
                ? 'bg-[var(--accent-soft)] text-[var(--accent-text)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
            )}
          >
            <Icon size={16} strokeWidth={2} />
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}
