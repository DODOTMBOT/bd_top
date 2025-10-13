export function formatShortRU(iso: string | Date) {
  const d = typeof iso === 'string' ? new Date(iso) : iso
  const pad = (n: number) => String(n).padStart(2, '0')
  const dd = pad(d.getDate())
  const mm = pad(d.getMonth() + 1)
  const yy = String(d.getFullYear()).slice(-2)
  const hh = pad(d.getHours())
  const min = pad(d.getMinutes())
  return `${dd}.${mm}.${yy} ${hh}:${min}`
}
