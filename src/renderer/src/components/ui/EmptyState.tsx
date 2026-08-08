import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action
}: EmptyStateProps): React.JSX.Element {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-[var(--text-tertiary)]">
        <Icon size={26} strokeWidth={1.6} />
      </div>
      <div className="max-w-xs space-y-1">
        <div className="text-[15px] font-medium text-[var(--text-primary)]">{title}</div>
        <div className="text-[13px] leading-relaxed text-[var(--text-tertiary)]">{description}</div>
      </div>
      {action}
    </div>
  )
}
