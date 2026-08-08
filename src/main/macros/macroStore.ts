import { app } from 'electron'
import { promises as fs } from 'fs'
import path from 'path'
import { createMacro } from '../../shared/factory'
import type { Macro, MacroSummary } from '../../shared/types'

let macrosDir = ''
const cache = new Map<string, Macro>()

function toSummary(macro: Macro): MacroSummary {
  return {
    id: macro.id,
    name: macro.name,
    description: macro.description,
    stats: macro.stats,
    createdAt: macro.createdAt,
    updatedAt: macro.updatedAt,
    actionCount: macro.actions.length
  }
}

function filePathFor(id: string): string {
  return path.join(macrosDir, `${id}.json`)
}

async function writeMacroFile(macro: Macro): Promise<void> {
  await fs.writeFile(filePathFor(macro.id), JSON.stringify(macro, null, 2), 'utf-8')
}

export async function initMacroStore(): Promise<void> {
  macrosDir = path.join(app.getPath('userData'), 'macros')
  await fs.mkdir(macrosDir, { recursive: true })
  const entries = await fs.readdir(macrosDir)
  for (const entry of entries) {
    if (!entry.endsWith('.json')) continue
    try {
      const raw = await fs.readFile(path.join(macrosDir, entry), 'utf-8')
      const macro = JSON.parse(raw) as Macro
      cache.set(macro.id, macro)
    } catch {
      // skip corrupted file
    }
  }
}

export function listMacros(): MacroSummary[] {
  return Array.from(cache.values())
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map(toSummary)
}

export function getMacro(id: string): Macro | null {
  return cache.get(id) ?? null
}

export async function createNewMacro(name?: string): Promise<Macro> {
  const macro = createMacro(name)
  cache.set(macro.id, macro)
  await writeMacroFile(macro)
  return macro
}

export async function updateMacro(macro: Macro): Promise<Macro> {
  const updated: Macro = { ...macro, updatedAt: Date.now() }
  cache.set(updated.id, updated)
  await writeMacroFile(updated)
  return updated
}

export async function renameMacro(id: string, name: string): Promise<Macro | null> {
  const macro = cache.get(id)
  if (!macro) return null
  return updateMacro({ ...macro, name })
}

export async function duplicateMacro(id: string): Promise<Macro | null> {
  const macro = cache.get(id)
  if (!macro) return null
  const now = Date.now()
  const copy: Macro = {
    ...macro,
    id: `${macro.id}-copy-${now.toString(36)}`,
    name: `${macro.name} (copie)`,
    stats: { execCount: 0, lastRunAt: null, totalRunMs: 0 },
    createdAt: now,
    updatedAt: now
  }
  cache.set(copy.id, copy)
  await writeMacroFile(copy)
  return copy
}

export async function deleteMacro(id: string): Promise<void> {
  cache.delete(id)
  await fs.rm(filePathFor(id), { force: true })
}

export async function exportMacro(id: string, destPath: string): Promise<boolean> {
  const macro = cache.get(id)
  if (!macro) return false
  await fs.writeFile(destPath, JSON.stringify(macro, null, 2), 'utf-8')
  return true
}

export async function importMacro(srcPath: string): Promise<Macro> {
  const raw = await fs.readFile(srcPath, 'utf-8')
  const parsed = JSON.parse(raw) as Macro
  const now = Date.now()
  const macro: Macro = {
    ...parsed,
    id: `${parsed.id ?? 'import'}-${now.toString(36)}`,
    createdAt: now,
    updatedAt: now
  }
  cache.set(macro.id, macro)
  await writeMacroFile(macro)
  return macro
}

export async function recordExecution(id: string, durationMs: number): Promise<void> {
  const macro = cache.get(id)
  if (!macro) return
  await updateMacro({
    ...macro,
    stats: {
      execCount: macro.stats.execCount + 1,
      lastRunAt: Date.now(),
      totalRunMs: macro.stats.totalRunMs + durationMs
    }
  })
}

export function getAppStats(): {
  macroCount: number
  totalExecutions: number
  totalActiveMs: number
} {
  let totalExecutions = 0
  let totalActiveMs = 0
  for (const macro of cache.values()) {
    totalExecutions += macro.stats.execCount
    totalActiveMs += macro.stats.totalRunMs
  }
  return { macroCount: cache.size, totalExecutions, totalActiveMs }
}
