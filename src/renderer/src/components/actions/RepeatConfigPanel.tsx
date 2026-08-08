import { Repeat } from 'lucide-react'
import type { RepeatConfig, RepeatMode } from '@shared/types'
import { Card } from '@renderer/components/ui/Card'
import { SegmentedControl } from '@renderer/components/ui/SegmentedControl'
import { NumberField, Label } from '@renderer/components/ui/Field'

const MODES: { value: RepeatMode; label: string }[] = [
  { value: 'once', label: 'Une seule fois' },
  { value: 'count', label: 'Nombre personnalisé' },
  { value: 'infinite', label: "Jusqu'à arrêt manuel" }
]

export function RepeatConfigPanel({
  repeat,
  onChange
}: {
  repeat: RepeatConfig
  onChange: (repeat: RepeatConfig) => void
}): React.JSX.Element {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center gap-2 text-[12.5px] font-medium text-[var(--text-secondary)]">
        <Repeat size={14} />
        Répétition
      </div>
      <SegmentedControl
        options={MODES}
        value={repeat.mode}
        onChange={(mode) => onChange({ ...repeat, mode })}
      />

      <div className="mt-3 flex flex-wrap gap-4">
        {repeat.mode === 'count' && (
          <div className="w-32">
            <Label>Répétitions</Label>
            <NumberField
              value={repeat.count}
              min={1}
              onChange={(e) => onChange({ ...repeat, count: Number(e.target.value) })}
            />
          </div>
        )}
        {repeat.mode !== 'once' && (
          <div className="w-40">
            <Label>Pause entre chaque répétition (ms)</Label>
            <NumberField
              value={repeat.pauseBetweenMs}
              min={0}
              onChange={(e) => onChange({ ...repeat, pauseBetweenMs: Number(e.target.value) })}
            />
          </div>
        )}
      </div>
    </Card>
  )
}
