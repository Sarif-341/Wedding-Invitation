/**
 * Wish wall state. The shared wall comes from Google Sheets (see rsvpApi.ts); a guest's own notes are also kept in
 * their browser (localStorage) so their note shows instantly and survives a slow or failed sync.
 */
import { useCallback, useEffect, useState } from 'react'
import { initialWishes, rsvpSection, type PaperColor, type Wish } from '../data/weddingData'
import { fetchWishes } from './rsvpApi'

const KEY = 'sz-wishes-v1'
const COLORS: PaperColor[] = ['sunshine', 'mint', 'sky', 'coral', 'lilac']

function load(): Wish[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    if (!Array.isArray(raw)) return []
    return raw
      .filter((w) => w && typeof w.name === 'string' && typeof w.message === 'string' && typeof w.id === 'string')
      .map((w) => ({
        id: w.id,
        name: w.name.slice(0, rsvpSection.nameMax),
        message: w.message.slice(0, rsvpSection.messageMax),
        attending: Boolean(w.attending),
        color: COLORS.includes(w.color) ? w.color : 'sunshine',
        createdAt: typeof w.createdAt === 'number' ? w.createdAt : undefined,
      }))
  } catch {
    return []
  }
}

function persist(list: Wish[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* private mode / storage full — the wall still works for this visit */
  }
}

export type WallStatus = 'loading' | 'ok' | 'error'

const keyOf = (w: Wish) => `${w.name.trim().toLowerCase()}|${w.message.trim()}`

export function useWishes() {
  const [mine, setMine] = useState<Wish[]>(load)
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
    setMine((list) => {
      const next = [wish, ...list].slice(0, 50)
      persist(next)
      return next
    })
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
  // Sample note only while the wall would otherwise be empty
  const wishes = merged.length ? merged : initialWishes

  return { wishes, add, status, refresh }
}
