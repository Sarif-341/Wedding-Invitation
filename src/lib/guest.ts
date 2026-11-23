import { invitation } from '../data/weddingData'
import { guestList, guestQueryParams } from '../data/guestList'

/** "Budi  Santoso" / "budi_santoso" / "BUDI-SANTOSO" → "budi-santoso" */
export const toGuestCode = (raw: string) =>
  raw
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')

/** Looks the link's `?tamu=` (or `?to=`) code up in the guest list; anything unknown gives the default name. */
export function getGuestName(): string {
  if (typeof window === 'undefined') return invitation.defaultGuestName
  const params = new URLSearchParams(window.location.search)
  for (const key of guestQueryParams) {
    const raw = params.get(key)
    if (!raw) continue
    const name = guestList[toGuestCode(raw.slice(0, 80))]
    if (name) return name
  }
  return invitation.defaultGuestName
}
