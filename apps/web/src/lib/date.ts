const KST_OFFSET_MS = 9 * 60 * 60 * 1000

export function formatDate(sqlite: string): string {
  const utc = new Date(sqlite.replace(' ', 'T') + 'Z').getTime()
  const d = new Date(utc + KST_OFFSET_MS)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}.${pad(d.getUTCMonth() + 1)}.${pad(d.getUTCDate())}`
}
