import { app } from 'electron'
import { spawn, type ChildProcessWithoutNullStreams } from 'child_process'
import { createInterface } from 'readline'
import path from 'path'
import { nanoid } from 'nanoid'
import type { KeyMode, MouseButton, ClickMode, ScrollDirection, TextMode } from '../../shared/types'

interface PendingRequest {
  resolve: (value: Record<string, unknown>) => void
  reject: (reason: Error) => void
}

let child: ChildProcessWithoutNullStreams | null = null
const pending = new Map<string, PendingRequest>()

function resolveHelperPath(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'native', 'input-helper.exe')
  }
  return path.join(app.getAppPath(), 'resources', 'native', 'input-helper.exe')
}

function ensureProcess(): ChildProcessWithoutNullStreams {
  if (child && !child.killed) return child

  const exePath = resolveHelperPath()
  const proc = spawn(exePath, [], { windowsHide: true })
  proc.on('exit', () => {
    if (child === proc) child = null
  })
  proc.on('error', (err) => {
    for (const [, req] of pending) req.reject(err)
    pending.clear()
  })

  const rl = createInterface({ input: proc.stdout })
  rl.on('line', (line) => {
    if (!line.trim()) return
    try {
      const msg = JSON.parse(line) as { id: string; ok: boolean; error?: string } & Record<
        string,
        unknown
      >
      const req = pending.get(msg.id)
      if (!req) return
      pending.delete(msg.id)
      if (msg.ok) req.resolve(msg)
      else req.reject(new Error(msg.error ?? 'Unknown input-helper error'))
    } catch {
      // ignore malformed line
    }
  })

  child = proc
  return proc
}

function send(command: Record<string, unknown>): Promise<Record<string, unknown>> {
  const proc = ensureProcess()
  const id = nanoid(8)
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject })
    proc.stdin.write(JSON.stringify({ ...command, id }) + '\n')
  })
}

export function stopSimulator(): void {
  if (child && !child.killed) child.kill()
  child = null
}

export async function moveMouse(
  x: number,
  y: number,
  durationMs: number,
  relative: boolean
): Promise<void> {
  await send({ cmd: 'moveMouse', x, y, durationMs, relative })
}

export async function click(button: MouseButton, mode: ClickMode): Promise<void> {
  await send({ cmd: 'click', button, mode })
}

export async function scroll(direction: ScrollDirection, amount: number): Promise<void> {
  await send({ cmd: 'scroll', direction, amount })
}

export async function keyAction(keys: string[], mode: KeyMode, holdMs: number): Promise<void> {
  await send({ cmd: 'key', keys, mode, holdMs })
}

export async function typeText(text: string, mode: TextMode, charDelayMs: number): Promise<void> {
  await send({ cmd: 'type', text, mode, charDelayMs })
}

export async function getCursorPosition(): Promise<{ x: number; y: number }> {
  const res = await send({ cmd: 'getCursorPos' })
  return { x: res.x as number, y: res.y as number }
}
