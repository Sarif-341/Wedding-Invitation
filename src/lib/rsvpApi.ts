/**
 * Talks to the Google Apps Script Web App that writes to Google Sheets.
 *  - POST uses `Content-Type: text/plain` on purpose: it is a "simple" request, so the browser skips the CORS
 *    preflight that Apps Script cannot answer. The script still receives the JSON body as text.
 *  - Every call has a timeout and never throws: callers get `{ ok: false }` and decide what to show.
 */
import { rsvpSection, sheetsApi, type PaperColor, type Wish } from '../data/weddingData'

export interface RsvpPayload {
  /** Stable per form submission, reused on retries so the sheet can ignore a duplicate */
  submissionId: string
  name: string
  attending: boolean
  guestCount: number
  /** Only for guests who attend */
  ticketNo: string
  message: string
}

type Result<T = undefined> = { ok: true; data: T } | { ok: false }

async function request(init?: RequestInit): Promise<unknown> {
  const ctrl = new AbortController()
  const timer = window.setTimeout(() => ctrl.abort(), sheetsApi.timeoutMs)
  try {
    const res = await fetch(sheetsApi.endpoint, { ...init, signal: ctrl.signal, redirect: 'follow' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    if (json && typeof json === 'object' && 'status' in json && (json as { status: unknown }).status === 'error') {
      throw new Error('script reported an error')
    }
    return json
  } finally {
    window.clearTimeout(timer)
  }
}

async function post(body: Record<string, unknown>): Promise<Result> {
  try {
    await request({ method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) })
    return { ok: true, data: undefined }
  } catch {
    return { ok: false }
  }
}

export const submitRsvp = (p: RsvpPayload) =>
  post({
    action: 'submit_rsvp',
    ...p,
    status: p.attending ? 'Hadir' : 'Tidak Hadir',
    ticketNo: p.attending ? p.ticketNo : '',
    submittedAt: new Date().toISOString(),
  })

export const markDownloaded = (ticketNo: string) =>
  post({ action: 'mark_downloaded', ticketNo, downloadedAt: new Date().toISOString() })

// ------------------------------------------------------------------ wish wall
const COLORS: PaperColor[] = ['sunshine', 'mint', 'sky', 'coral', 'lilac']

const pick = (row: Record<string, unknown>, keys: string[]) => {
  for (const k of keys) if (row[k] !== undefined && row[k] !== null && row[k] !== '') return row[k]
  return undefined
}

const isAttending = (v: unknown) => {
  if (typeof v === 'boolean') return v
  const s = String(v ?? '').trim().toLowerCase()
  return s !== '' && !/^(tidak|berhalangan|no|false|0)/.test(s)
}

/** Rows come straight from a spreadsheet, so accept the obvious column names and ignore anything unusable. */
function toWish(row: unknown, i: number): Wish | null {
  if (!row || typeof row !== 'object') return null
  const r = row as Record<string, unknown>
  const name = String(pick(r, ['name', 'nama', 'Nama']) ?? '').trim()
  const message = String(pick(r, ['message', 'ucapan', 'pesan', 'Ucapan']) ?? '').trim()
  if (!name || !message) return null
  const when = pick(r, ['createdAt', 'timestamp', 'submittedAt', 'waktu', 'Timestamp'])
  const t = typeof when === 'number' ? when : when ? Date.parse(String(when)) : NaN
  const rawId = pick(r, ['id', 'submissionId'])
  return {
    id: `s-${rawId ?? i}`,
    name: name.slice(0, rsvpSection.nameMax),
    message: message.slice(0, rsvpSection.messageMax),
    attending: isAttending(pick(r, ['attending', 'status', 'kehadiran', 'Status'])),
    color: COLORS[i % COLORS.length],
    createdAt: Number.isFinite(t) ? t : undefined,
  }
}

/** Newest first: by timestamp when the rows have one, otherwise the sheet's own order reversed (rows are appended). */
export async function fetchWishes(): Promise<Result<Wish[]>> {
  try {
    const json = (await request()) as { messages?: unknown }
    const rows = Array.isArray(json?.messages) ? json.messages : []
    const wishes = rows.map(toWish).filter((w): w is Wish => w !== null)
    const dated = wishes.every((w) => w.createdAt !== undefined)
    return { ok: true, data: dated ? wishes.sort((a, b) => b.createdAt! - a.createdAt!) : wishes.reverse() }
  } catch {
    return { ok: false }
  }
}

// ------------------------------------------------------------------ "downloaded" signal with retry
const PENDING_KEY = 'sz-pending-v1'

const readPending = (): string[] => {
  try {
    const raw = JSON.parse(localStorage.getItem(PENDING_KEY) ?? '[]')
    return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

const writePending = (list: string[]) => {
  try {
    if (list.length) localStorage.setItem(PENDING_KEY, JSON.stringify(list))
    else localStorage.removeItem(PENDING_KEY)
  } catch {
    /* storage unavailable: the signal is simply not retried */
  }
}

/** Tell the sheet a ticket was downloaded. If the network fails, only the ticket number is kept to retry later. */
export async function reportDownloaded(ticketNo: string) {
  const res = await markDownloaded(ticketNo)
  if (!res.ok) writePending([...new Set([...readPending(), ticketNo])])
}

/** Re-send any "downloaded" signals that could not be delivered earlier. */
export async function flushPendingDownloads() {
  for (const ticketNo of readPending()) {
    const res = await markDownloaded(ticketNo)
    if (res.ok) writePending(readPending().filter((t) => t !== ticketNo))
  }
}
