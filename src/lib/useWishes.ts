/**
 * Wish wall state. The wall is exactly what Google Sheets returns (see rsvpApi.ts), plus the notes this guest sends
 * during the current visit so they appear instantly. Nothing is cached in the browser and there are no sample notes.
 */
import { useCallback, useEffect, useState } from 'react'
import type { PaperColor, Wish } from '../data/weddingData'
import { fetchWishes } from './rsvpApi'

const COLORS: PaperColor[] = ['sunshine', 'mint', 'sky', 'coral', 'lilac']

/** Older versions kept a guest's notes in the browser; that copy (test notes included) must never come back. */
const LEGACY_KEY = 'sz-wishes-v1'
try {
  localStorage.removeItem(LEGACY_KEY)
} catch {
  /* storage unavailable */
}

export type WallStatus = 'loading' | 'ok' | 'error'

const keyOf = (w: Wish) => `${w.name.trim().toLowerCase()}|${w.message.trim()}`

export function useWishes() {
  // Notes sent during this visit, shown at once; they are never stored in the browser
  const [mine, setMine] = useState<Wish[]>([])
  const [remote, setRemote] = useState<Wish[]>([])
  const [status, setStatus] = useState<WallStatus>('loading')

  const refresh = useCallback(async () => {
    setStatus('loading')
    const res = await fetchWishes()
    if (res.ok) setRemote(res.data)
    setStatus(res.ok ? 'ok' : 'error')
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch from the spreadsheet
    refresh()
  }, [refresh])

  const add = useCallback((w: Pick<Wish, 'name' | 'message' | 'attending'>): Wish => {
    const wish: Wish = {
      ...w,
      id: `g-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      createdAt: Date.now(),
    }
    setMine((list) => [wish, ...list])
    return wish
  }, [])

  // This guest's own notes first, then the spreadsheet's. The same note can be in both once it has been saved.
  const seen = new Set<string>()
  const merged = [...mine, ...remote].filter((w) => {
    const k = keyOf(w)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
  // Empty sheet → empty wall (the page shows an empty state); nothing is invented
  return { wishes: merged, add, status, refresh }
}
