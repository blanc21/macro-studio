import { create } from 'zustand'
import type { Action, ActionType, Macro, RepeatConfig } from '@shared/types'
import { createAction } from '@shared/factory'

interface EditorState {
  macro: Macro | null
  dirty: boolean
  saving: boolean
  load: (macro: Macro) => void
  clear: () => void
  save: () => Promise<void>
  rename: (name: string) => void
  setDescription: (description: string) => void
  addAction: (type: ActionType) => void
  updateAction: (id: string, patch: Partial<Action>) => void
  removeAction: (id: string) => void
  duplicateAction: (id: string) => void
  reorderActions: (activeId: string, overId: string) => void
  toggleAction: (id: string) => void
  setRepeat: (repeat: RepeatConfig) => void
  insertRecordedActions: (actions: Action[]) => void
}

export const useEditorStore = create<EditorState>((set, get) => ({
  macro: null,
  dirty: false,
  saving: false,

  load: (macro) => set({ macro, dirty: false }),
  clear: () => set({ macro: null, dirty: false }),

  save: async () => {
    const { macro } = get()
    if (!macro) return
    set({ saving: true })
    const updated = await window.api.macros.update(macro)
    set({ macro: updated, dirty: false, saving: false })
  },

  rename: (name) => set((s) => (s.macro ? { macro: { ...s.macro, name }, dirty: true } : s)),

  setDescription: (description) =>
    set((s) => (s.macro ? { macro: { ...s.macro, description }, dirty: true } : s)),

  addAction: (type) =>
    set((s) => {
      if (!s.macro) return s
      return {
        macro: { ...s.macro, actions: [...s.macro.actions, createAction(type)] },
        dirty: true
      }
    }),

  updateAction: (id, patch) =>
    set((s) => {
      if (!s.macro) return s
      return {
        macro: {
          ...s.macro,
          actions: s.macro.actions.map((a) => (a.id === id ? ({ ...a, ...patch } as Action) : a))
        },
        dirty: true
      }
    }),

  removeAction: (id) =>
    set((s) => {
      if (!s.macro) return s
      return {
        macro: { ...s.macro, actions: s.macro.actions.filter((a) => a.id !== id) },
        dirty: true
      }
    }),

  duplicateAction: (id) =>
    set((s) => {
      if (!s.macro) return s
      const idx = s.macro.actions.findIndex((a) => a.id === id)
      if (idx === -1) return s
      const copy: Action = { ...s.macro.actions[idx], id: `${id}-${Date.now().toString(36)}` }
      const actions = [...s.macro.actions]
      actions.splice(idx + 1, 0, copy)
      return { macro: { ...s.macro, actions }, dirty: true }
    }),

  reorderActions: (activeId, overId) =>
    set((s) => {
      if (!s.macro || activeId === overId) return s
      const actions = [...s.macro.actions]
      const from = actions.findIndex((a) => a.id === activeId)
      const to = actions.findIndex((a) => a.id === overId)
      if (from === -1 || to === -1) return s
      const [moved] = actions.splice(from, 1)
      actions.splice(to, 0, moved)
      return { macro: { ...s.macro, actions }, dirty: true }
    }),

  toggleAction: (id) =>
    set((s) => {
      if (!s.macro) return s
      return {
        macro: {
          ...s.macro,
          actions: s.macro.actions.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
        },
        dirty: true
      }
    }),

  setRepeat: (repeat) => set((s) => (s.macro ? { macro: { ...s.macro, repeat }, dirty: true } : s)),

  insertRecordedActions: (recorded) =>
    set((s) => {
      if (!s.macro) return s
      return { macro: { ...s.macro, actions: [...s.macro.actions, ...recorded] }, dirty: true }
    })
}))
