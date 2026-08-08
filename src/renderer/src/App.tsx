import { useEffect } from 'react'
import { AppShell } from './app/AppShell'
import { Dashboard } from './pages/Dashboard/Dashboard'
import { MacroLibrary } from './pages/MacroLibrary/MacroLibrary'
import { MacroEditor } from './pages/MacroEditor/MacroEditor'
import { Recording } from './pages/Recording/Recording'
import { Settings } from './pages/Settings/Settings'
import { useNavStore } from './store/useNavStore'
import { useSettingsStore } from './store/useSettingsStore'
import { useEngineStore } from './store/useEngineStore'
import { useEditorStore } from './store/useEditorStore'
import { useToastStore } from './store/useToastStore'

function App(): React.JSX.Element {
  const page = useNavStore((s) => s.page)
  const loadSettings = useSettingsStore((s) => s.load)
  const initEngine = useEngineStore((s) => s.init)
  const engineStatus = useEngineStore((s) => s.progress.status)
  const editorMacro = useEditorStore((s) => s.macro)
  const runMacro = useEngineStore((s) => s.run)
  const openRecording = useNavStore((s) => s.openRecording)
  const goTo = useNavStore((s) => s.goTo)
  const push = useToastStore((s) => s.push)

  useEffect(() => {
    void loadSettings()
    initEngine()
  }, [loadSettings, initEngine])

  useEffect(() => {
    return window.api.hotkeys.onTriggered((action) => {
      if (action === 'start') {
        if (engineStatus === 'idle' && editorMacro && editorMacro.actions.length > 0) {
          void runMacro(editorMacro)
        }
      } else if (action === 'record') {
        openRecording(editorMacro?.id ?? null)
      } else if (action === 'stop') {
        push('Macro arrêtée', 'info')
      }
    })
  }, [engineStatus, editorMacro, runMacro, openRecording, push])

  useEffect(() => {
    if (page === 'editor' && !editorMacro) goTo('library')
  }, [page, editorMacro, goTo])

  return (
    <AppShell>
      {page === 'dashboard' && <Dashboard />}
      {page === 'library' && <MacroLibrary />}
      {page === 'editor' && <MacroEditor />}
      {page === 'recording' && <Recording />}
      {page === 'settings' && <Settings />}
    </AppShell>
  )
}

export default App
