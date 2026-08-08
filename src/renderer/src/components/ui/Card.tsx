import type { HTMLAttributes } from 'react'
import { cn } from '@renderer/lib/cn'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]',
        className
      )}
      {...props}
    />
  )
}
