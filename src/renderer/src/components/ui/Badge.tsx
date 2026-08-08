import type { HTMLAttributes } from 'react'
import { cn } from '@renderer/lib/cn'

type Tone = 'neutral' | 'accent' | 'success' | 'danger' | 'warning'

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-[var(--surface-2)] text-[var(--text-secondary)] border-[var(--border)]',
  accent: 'bg-[var(--accent-soft)] text-[var(--accent-text)] border-transparent',
  success: 'bg-[var(--success-soft)] text-[var(--success)] border-transparent',
  danger: 'bg-[var(--danger-soft)] text-[var(--danger)] border-transparent',
  warning: 'bg-[var(--warning-soft)] text-[var(--warning)] border-transparent'
}

export function Badge({
  tone = 'neutral',
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }): React.JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium',
        toneClasses[tone],
        className
      )}
      {...props}
    />
  )
}
