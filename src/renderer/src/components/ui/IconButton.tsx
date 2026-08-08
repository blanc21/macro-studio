import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@renderer/lib/cn'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, active, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'no-drag inline-flex items-center justify-center h-8 w-8 rounded-lg transition-colors duration-150',
        'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]',
        'disabled:opacity-40 disabled:pointer-events-none active:scale-95',
        active && 'text-[var(--accent)] bg-[var(--accent-soft)]',
        className
      )}
      {...props}
    />
  )
)
IconButton.displayName = 'IconButton'
