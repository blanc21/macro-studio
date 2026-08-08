import type { ReactNode } from 'react'
import { Titlebar } from './Titlebar'
import { Sidebar } from './Sidebar'
import { StatusBar } from './StatusBar'
import { RunOverlay } from './RunOverlay'
import { ToastContainer } from '@renderer/components/ui/ToastContainer'

export function AppShell({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <div className="flex h-screen flex-col overflow-hidden rounded-xl">
      <Titlebar />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
      <StatusBar />
      <RunOverlay />
      <ToastContainer />
    </div>
  )
}
