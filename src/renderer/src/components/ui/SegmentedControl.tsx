import { cn } from '@renderer/lib/cn'

interface Option<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange
}: SegmentedControlProps<T>): React.JSX.Element {
  return (
    <div className="no-drag inline-flex rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-md px-2.5 py-1 text-[11.5px] font-medium transition-colors',
            value === opt.value
              ? 'bg-[var(--accent)] text-white'
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
