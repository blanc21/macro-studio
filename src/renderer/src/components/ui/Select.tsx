import type { SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@renderer/lib/cn'

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>): React.JSX.Element {
  return (
    <div className="relative">
      <select
        className={cn(
          'no-drag h-8 w-full appearance-none rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] pl-2.5 pr-7 text-[12.5px] text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent)]',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={13}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
      />
    </div>
  )
}
