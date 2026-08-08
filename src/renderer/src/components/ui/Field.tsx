import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@renderer/lib/cn'

const inputBase =
  'no-drag h-8 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2.5 text-[12.5px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none transition-colors focus:border-[var(--accent)]'

export function Label({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <label className="mb-1.5 block text-[11px] font-medium text-[var(--text-tertiary)]">
      {children}
    </label>
  )
}

export function TextField({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>): React.JSX.Element {
  return <input type="text" className={cn(inputBase, className)} {...props} />
}

export function NumberField({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>): React.JSX.Element {
  return <input type="number" className={cn(inputBase, 'mono', className)} {...props} />
}

interface FieldGroupProps {
  label: string
  children: ReactNode
  hint?: string
  className?: string
}

export function FieldGroup({
  label,
  children,
  hint,
  className
}: FieldGroupProps): React.JSX.Element {
  return (
    <div className={className}>
      <Label>{label}</Label>
      {children}
      {hint && <div className="mt-1 text-[11px] text-[var(--text-tertiary)]">{hint}</div>}
    </div>
  )
}
