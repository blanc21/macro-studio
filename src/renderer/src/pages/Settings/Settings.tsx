import { useState } from 'react'
import {
  Keyboard as KeyboardIcon,
  Monitor,
  MousePointer2,
  Radio,
  Settings as SettingsIcon,
  Sun,
  Moon
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useSettingsStore } from '@renderer/store/useSettingsStore'
import { Card } from '@renderer/components/ui/Card'
import { NumberField } from '@renderer/components/ui/Field'
import { Switch } from '@renderer/components/ui/Switch'
import { SegmentedControl } from '@renderer/components/ui/SegmentedControl'
import { Button } from '@renderer/components/ui/Button'
import { Badge } from '@renderer/components/ui/Badge'
import type { CaptureToggles, HotkeyAction } from '@shared/types'

function Section({
  icon: Icon,
  title,
  children
}: {
  icon: LucideIcon
  title: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2 text-[13px] font-medium text-[var(--text-primary)]">
        <Icon size={15} className="text-[var(--accent-text)]" />
        {title}
      </div>
      <div className="space-y-4">{children}</div>
    </Card>
  )
}

function Row({
  label,
  hint,
  children
}: {
  label: string
  hint?: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-[12.5px] text-[var(--text-secondary)]">{label}</div>
        {hint && <div className="text-[11px] text-[var(--text-tertiary)]">{hint}</div>}
      </div>
      {children}
    </div>
  )
}

const HOTKEY_LABELS: Record<HotkeyAction, string> = {
  start: 'Démarrer',
  pause: 'Pause',
  stop: "Arrêter (arrêt d'urgence global)",
  record: 'Enregistrer'
}

function HotkeyRow({
  action,
  value,
  onChange
}: {
  action: HotkeyAction
  value: string
  onChange: (key: string) => void
}): React.JSX.Element {
  const [listening, setListening] = useState(false)

  async function rebind(): Promise<void> {
    setListening(true)
    const key = await window.api.picker.pickKey()
    setListening(false)
    if (key) onChange(key)
  }

  return (
    <Row label={HOTKEY_LABELS[action]}>
      <div className="flex items-center gap-2">
        <span className="mono rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-1 text-[11.5px] text-[var(--text-primary)]">
          {value}
        </span>
        <Button variant="secondary" size="sm" onClick={rebind} disabled={listening}>
          {listening ? 'Appuyez sur une touche...' : 'Modifier'}
        </Button>
      </div>
    </Row>
  )
}

const CAPTURE_ITEMS: { key: keyof CaptureToggles; label: string }[] = [
  { key: 'mouseMove', label: 'Mouvements de souris' },
  { key: 'mouseClicks', label: 'Clics souris' },
  { key: 'keyboard', label: 'Clavier' },
  { key: 'delays', label: 'Délais entre actions' }
]

export function Settings(): React.JSX.Element {
  const settings = useSettingsStore((s) => s.settings)
  const update = useSettingsStore((s) => s.update)

  const conflicts = new Set(
    Object.entries(settings.hotkeys)
      .filter(([, key], _i, arr) => arr.filter(([, k]) => k === key).length > 1)
      .map(([action]) => action)
  )

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-8 py-8">
      <h1 className="mb-2 text-[19px] font-semibold tracking-tight text-[var(--text-primary)]">
        Paramètres
      </h1>

      <Section icon={SettingsIcon} title="Général">
        <Row label="Thème">
          <SegmentedControl
            options={[
              { value: 'dark', label: 'Sombre' },
              { value: 'light', label: 'Clair' }
            ]}
            value={settings.theme}
            onChange={(theme) => update({ theme })}
          />
        </Row>
        <Row
          label="Démarrer avec Windows"
          hint="Lance Macro Studio automatiquement à l'ouverture de session"
        >
          <Switch
            checked={settings.launchOnStartup}
            onChange={(v) => update({ launchOnStartup: v })}
          />
        </Row>
        <Row
          label="Minimiser dans la barre système"
          hint="La fermeture de la fenêtre laisse l'application active"
        >
          <Switch
            checked={settings.minimizeToTray}
            onChange={(v) => update({ minimizeToTray: v })}
          />
        </Row>
      </Section>

      <Section icon={MousePointer2} title="Souris">
        <Row label="Durée de déplacement par défaut">
          <div className="w-28">
            <NumberField
              value={settings.defaultMoveDurationMs}
              min={0}
              onChange={(e) => update({ defaultMoveDurationMs: Number(e.target.value) })}
            />
          </div>
        </Row>
      </Section>

      <Section icon={KeyboardIcon} title="Clavier">
        <Row label="Délai par défaut entre les touches">
          <div className="w-28">
            <NumberField
              value={settings.defaultKeyDelayMs}
              min={0}
              onChange={(e) => update({ defaultKeyDelayMs: Number(e.target.value) })}
            />
          </div>
        </Row>
        <Row label="Délai par défaut entre les caractères (texte)">
          <div className="w-28">
            <NumberField
              value={settings.defaultCharDelayMs}
              min={0}
              onChange={(e) => update({ defaultCharDelayMs: Number(e.target.value) })}
            />
          </div>
        </Row>
      </Section>

      <Section icon={Radio} title="Enregistrement">
        {CAPTURE_ITEMS.map(({ key, label }) => (
          <Row key={key} label={label}>
            <Switch
              checked={settings.capture[key]}
              onChange={(v) => update({ capture: { ...settings.capture, [key]: v } })}
            />
          </Row>
        ))}
      </Section>

      <Section icon={Monitor} title="Raccourcis clavier">
        {(Object.keys(settings.hotkeys) as HotkeyAction[]).map((action) => (
          <div key={action} className="flex items-center gap-2">
            <div className="flex-1">
              <HotkeyRow
                action={action}
                value={settings.hotkeys[action]}
                onChange={(key) => update({ hotkeys: { ...settings.hotkeys, [action]: key } })}
              />
            </div>
            {conflicts.has(action) && <Badge tone="warning">Conflit</Badge>}
          </div>
        ))}
      </Section>

      <div className="flex items-center justify-center gap-1.5 pt-2 pb-4 text-[11px] text-[var(--text-tertiary)]">
        {settings.theme === 'dark' ? <Moon size={12} /> : <Sun size={12} />}
        Macro Studio · v1.0.0
      </div>
    </div>
  )
}
