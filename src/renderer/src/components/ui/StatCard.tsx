import type { LucideIcon } from 'lucide-react'
import { Card } from './Card'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string
}

export function StatCard({ icon: Icon, label, value }: StatCardProps): React.JSX.Element {
  return (
    <Card className="flex items-center gap-3.5 px-5 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-text)]">
        <Icon size={18} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <div className="mono text-xl font-semibold tracking-tight text-[var(--text-primary)]">
          {value}
        </div>
        <div className="truncate text-xs text-[var(--text-tertiary)]">{label}</div>
      </div>
    </Card>
  )
}
