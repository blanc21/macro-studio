export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  const pad = (n: number): string => n.toString().padStart(2, '0')
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

export function formatRelativeTime(timestamp: number | null): string {
  if (timestamp == null) return 'Jamais'
  const diffMs = Date.now() - timestamp
  const minute = 60_000
  const hour = 3_600_000
  const day = 86_400_000

  if (diffMs < minute) return "à l'instant"
  if (diffMs < hour) return `il y a ${Math.floor(diffMs / minute)} min`
  if (diffMs < day) return `il y a ${Math.floor(diffMs / hour)} h`
  if (diffMs < day * 2) return 'hier'
  if (diffMs < day * 7) return `il y a ${Math.floor(diffMs / day)} j`
  return new Date(timestamp).toLocaleDateString('fr-FR')
}

export function formatMs(ms: number): string {
  if (ms < 1000) return `${ms} ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(ms % 1000 === 0 ? 0 : 1)} s`
  return formatDuration(ms)
}
