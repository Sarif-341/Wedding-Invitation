import { events, guestPass, weddingDate, weddingVenue } from '../../../data/weddingData'
import { formatRange } from '../../../lib/format'

export interface PassGuest {
  name: string
  ticketNo: string
}

/** Small stable hash → 3-digit sequence, so the same guest always gets the same ticket number. */
function hash(str: string) {
  let h = 2166136261
  for (const ch of str.toLowerCase().trim()) {
    h ^= ch.codePointAt(0)!
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) % 900 + 100
}

export function makeTicketNo(name: string) {
  const d = new Date(weddingDate)
  const stamp = `${String(d.getDate()).padStart(2, '0')}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getFullYear()).slice(2)}`
  return `${guestPass.ticketPrefix}-${stamp}-${hash(name)}`
}

/** Everything the canvas prints that comes from the shared wedding data (all in English). */
export function passFacts() {
  const d = new Date(weddingDate)
  const en = (o: Intl.DateTimeFormatOptions) => d.toLocaleDateString('en-GB', { timeZone: 'Asia/Jakarta', ...o })
  const parts = weddingVenue.address.split(',').map((p) => p.trim())
  return {
    weekday: en({ weekday: 'long' }),
    day: String(Number(en({ day: 'numeric' }))),
    month: en({ month: 'long' }),
    year: en({ year: 'numeric' }),
    shortDate: `${en({ day: '2-digit' })} ${en({ month: 'short' })} ${en({ year: '2-digit' })}`.toUpperCase(),
    times: events.map((e) => ({ code: e.code, time: `${formatRange(e)} WIB` })),
    // headline = venue name when there is one, otherwise the street; the full address always follows
    venueHead: weddingVenue.name ?? parts[0] + (parts.length > 1 ? ',' : ''),
    venueRest: weddingVenue.name ? weddingVenue.address : parts.slice(1).join(', '),
    mapsText: weddingVenue.mapsUrl.replace(/^https?:\/\//, ''),
  }
}

export function qrPayload(g: PassGuest) {
  return `${g.ticketNo}|${g.name}|${weddingVenue.mapsUrl}`
}

export function passFileName(g: PassGuest) {
  const slug = g.name
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 30)
  return `${guestPass.fileName}-${slug || 'guest'}-${g.ticketNo}.png`
}
