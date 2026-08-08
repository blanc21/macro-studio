import { useState } from 'react'
import { Crosshair, Keyboard as KeyboardIcon, Plus, X } from 'lucide-react'
import type {
  Action,
  ClickMode,
  KeyAction,
  KeyMode,
  MouseButton,
  MouseClickAction,
  MouseMoveAction,
  MouseScrollAction,
  ScrollDirection,
  TextAction,
  TextMode,
  WaitAction
} from '@shared/types'
import { NumberField, Label } from '@renderer/components/ui/Field'
import { SegmentedControl } from '@renderer/components/ui/SegmentedControl'
import { Switch } from '@renderer/components/ui/Switch'
import { Button } from '@renderer/components/ui/Button'

type Patch<T extends Action> = (patch: Partial<T>) => void

export function MouseMoveForm({
  action,
  onChange
}: {
  action: MouseMoveAction
  onChange: Patch<MouseMoveAction>
}): React.JSX.Element {
  const [picking, setPicking] = useState(false)

  async function pick(): Promise<void> {
    setPicking(true)
    const pos = await window.api.picker.pickPosition()
    setPicking(false)
    if (pos) onChange({ x: pos.x, y: pos.y })
  }

  return (
    <div className="grid grid-cols-2 gap-2.5">
      <div>
        <Label>X</Label>
        <NumberField value={action.x} onChange={(e) => onChange({ x: Number(e.target.value) })} />
      </div>
      <div>
        <Label>Y</Label>
        <NumberField value={action.y} onChange={(e) => onChange({ y: Number(e.target.value) })} />
      </div>
      <div>
        <Label>Durée (ms)</Label>
        <NumberField
          value={action.durationMs}
          min={0}
          onChange={(e) => onChange({ durationMs: Number(e.target.value) })}
        />
      </div>
      <div className="flex flex-col justify-end">
        <Button variant="secondary" size="sm" onClick={pick} disabled={picking} className="w-full">
          <Crosshair size={13} />
          {picking ? 'Cliquez sur l’écran...' : 'Choisir sur l’écran'}
        </Button>
      </div>
      <div className="col-span-2 flex items-center justify-between rounded-lg bg-[var(--bg-elevated)] px-2.5 py-1.5">
        <span className="text-[11.5px] text-[var(--text-secondary)]">Déplacement relatif</span>
        <Switch checked={action.relative} onChange={(v) => onChange({ relative: v })} />
      </div>
    </div>
  )
}

const CLICK_MODES: { value: ClickMode; label: string }[] = [
  { value: 'single', label: 'Simple' },
  { value: 'double', label: 'Double' },
  { value: 'down', label: 'Maintenir' },
  { value: 'up', label: 'Relâcher' }
]
const BUTTONS: { value: MouseButton; label: string }[] = [
  { value: 'left', label: 'Gauche' },
  { value: 'right', label: 'Droit' },
  { value: 'middle', label: 'Milieu' }
]

export function MouseClickForm({
  action,
  onChange
}: {
  action: MouseClickAction
  onChange: Patch<MouseClickAction>
}): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div>
        <Label>Bouton</Label>
        <SegmentedControl
          options={BUTTONS}
          value={action.button}
          onChange={(v) => onChange({ button: v })}
        />
      </div>
      <div>
        <Label>Type de clic</Label>
        <SegmentedControl
          options={CLICK_MODES}
          value={action.mode}
          onChange={(v) => onChange({ mode: v })}
        />
      </div>
    </div>
  )
}

const SCROLL_DIRECTIONS: { value: ScrollDirection; label: string }[] = [
  { value: 'up', label: 'Haut' },
  { value: 'down', label: 'Bas' },
  { value: 'left', label: 'Gauche' },
  { value: 'right', label: 'Droite' }
]

export function MouseScrollForm({
  action,
  onChange
}: {
  action: MouseScrollAction
  onChange: Patch<MouseScrollAction>
}): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div>
        <Label>Direction</Label>
        <SegmentedControl
          options={SCROLL_DIRECTIONS}
          value={action.direction}
          onChange={(v) => onChange({ direction: v })}
        />
      </div>
      <div className="w-24">
        <Label>Crans</Label>
        <NumberField
          value={action.amount}
          min={1}
          onChange={(e) => onChange({ amount: Number(e.target.value) })}
        />
      </div>
    </div>
  )
}

const KEY_MODES: { value: KeyMode; label: string }[] = [
  { value: 'press', label: 'Appuyer' },
  { value: 'hold', label: 'Maintenir' },
  { value: 'down', label: 'Presser' },
  { value: 'up', label: 'Relâcher' }
]

export function KeyForm({
  action,
  onChange
}: {
  action: KeyAction
  onChange: Patch<KeyAction>
}): React.JSX.Element {
  const [listening, setListening] = useState(false)

  async function addKey(): Promise<void> {
    setListening(true)
    const key = await window.api.picker.pickKey()
    setListening(false)
    if (key && !action.keys.includes(key)) onChange({ keys: [...action.keys, key] })
  }

  function removeKey(key: string): void {
    onChange({ keys: action.keys.filter((k) => k !== key) })
  }

  return (
    <div className="space-y-2.5">
      <div>
        <Label>Touche(s)</Label>
        <div className="flex flex-wrap items-center gap-1.5">
          {action.keys.map((k) => (
            <span
              key={k}
              className="mono inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-1 text-[11.5px] text-[var(--text-primary)]"
            >
              {k}
              <button
                onClick={() => removeKey(k)}
                className="text-[var(--text-tertiary)] hover:text-[var(--danger)]"
              >
                <X size={11} />
              </button>
            </span>
          ))}
          <Button variant="secondary" size="sm" onClick={addKey} disabled={listening}>
            {listening ? (
              <KeyboardIcon size={13} className="animate-ms-pulse" />
            ) : (
              <Plus size={13} />
            )}
            {listening ? 'Appuyez sur une touche...' : 'Ajouter'}
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <Label>Mode</Label>
          <SegmentedControl
            options={KEY_MODES}
            value={action.mode}
            onChange={(v) => onChange({ mode: v })}
          />
        </div>
        {action.mode === 'hold' && (
          <div className="w-28">
            <Label>Durée (ms)</Label>
            <NumberField
              value={action.holdMs}
              min={0}
              onChange={(e) => onChange({ holdMs: Number(e.target.value) })}
            />
          </div>
        )}
      </div>
    </div>
  )
}

const TEXT_MODES: { value: TextMode; label: string }[] = [
  { value: 'instant', label: 'Instantané' },
  { value: 'char-by-char', label: 'Caractère par caractère' }
]

export function TextForm({
  action,
  onChange
}: {
  action: TextAction
  onChange: Patch<TextAction>
}): React.JSX.Element {
  return (
    <div className="space-y-2.5">
      <div>
        <Label>Texte à écrire</Label>
        <textarea
          value={action.content}
          onChange={(e) => onChange({ content: e.target.value })}
          placeholder="Bonjour123"
          rows={2}
          className="no-drag w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2.5 py-2 text-[12.5px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
        />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <Label>Mode</Label>
          <SegmentedControl
            options={TEXT_MODES}
            value={action.mode}
            onChange={(v) => onChange({ mode: v })}
          />
        </div>
        {action.mode === 'char-by-char' && (
          <div className="w-32">
            <Label>Délai / caractère (ms)</Label>
            <NumberField
              value={action.charDelayMs}
              min={0}
              onChange={(e) => onChange({ charDelayMs: Number(e.target.value) })}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export function WaitForm({
  action,
  onChange
}: {
  action: WaitAction
  onChange: Patch<WaitAction>
}): React.JSX.Element {
  const isRandom = action.randomMaxMs != null

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="w-32">
        <Label>{isRandom ? 'Minimum (ms)' : 'Durée (ms)'}</Label>
        <NumberField
          value={action.ms}
          min={0}
          onChange={(e) => onChange({ ms: Number(e.target.value) })}
        />
      </div>
      {isRandom && (
        <div className="w-32">
          <Label>Maximum (ms)</Label>
          <NumberField
            value={action.randomMaxMs ?? action.ms}
            min={action.ms}
            onChange={(e) => onChange({ randomMaxMs: Number(e.target.value) })}
          />
        </div>
      )}
      <div className="flex items-center gap-2 rounded-lg bg-[var(--bg-elevated)] px-2.5 py-1.5">
        <span className="text-[11.5px] text-[var(--text-secondary)]">Délai aléatoire</span>
        <Switch
          checked={isRandom}
          onChange={(v) => onChange({ randomMaxMs: v ? action.ms + 500 : null })}
        />
      </div>
    </div>
  )
}
