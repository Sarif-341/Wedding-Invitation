import type { WeddingVenue } from '../data/weddingData'

const TZ = 'Asia/Jakarta'

export const formatDate = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(iso).toLocaleString('id-ID', { timeZone: TZ, ...opts })

/** "08.00" style time in WIB */
export const formatTime = (iso: string) => formatDate(iso, { hour: '2-digit', minute: '2-digit', hour12: false })

/** "09.00 – 10.00" for an event (WIB) */
export const formatRange = (e: { startsAt: string; endsAt: string }) => `${formatTime(e.startsAt)} – ${formatTime(e.endsAt)}`

/** "1 jam", "45 menit", "1 jam 30 menit" */
export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.round(ms / 60000))
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h && m) return `${h} jam ${m} menit`
  if (h) return `${h} jam`
  return `${m} menit`
}

/** Full line: "Venue, full address" (just the address when there is no name). */
export const formatVenue = (v: WeddingVenue) => [v.name, v.address].filter(Boolean).join(', ')

/** Cover-page line: "Venue, street, regency". */
export const formatVenueShort = (v: WeddingVenue) => [v.name, v.shortAddress ?? v.address].filter(Boolean).join(', ')
