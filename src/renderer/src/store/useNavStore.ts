import { create } from 'zustand'

export type PageId = 'dashboard' | 'library' | 'editor' | 'recording' | 'settings'

interface NavState {
  page: PageId
  editingMacroId: string | null
  goTo: (page: PageId) => void
  openEditor: (macroId: string) => void
  openRecording: (macroId: string | null) => void
}

export const useNavStore = create<NavState>((set) => ({
  page: 'dashboard',
  editingMacroId: null,
  goTo: (page) => set({ page }),
  openEditor: (macroId) => set({ page: 'editor', editingMacroId: macroId }),
  openRecording: (macroId) => set({ page: 'recording', editingMacroId: macroId })
}))
