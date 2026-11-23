/**
 * Draws the English "Guest Pass" onto a canvas — one drawing code path for both the on-screen preview and the
 * downloaded PNG, so what the guest sees is exactly what they save. Two layouts: a wide boarding pass for desktop and a
 * tall one for phones (so the text stays readable).
 */
import { encode } from 'uqr'
import { couple, guestPass } from '../../../data/weddingData'
import { PLANE_D } from '../../story/ldr/LdrArt'
import { passFacts, qrPayload, type PassGuest } from './passData'
import { WORLD_MAP_BOUNDS, WORLD_MAP_D } from './worldMap'

export type PassLayout = 'landscape' | 'portrait'
export interface Rect { x: number; y: number; w: number; h: number }

export const PASS_SIZE: Record<PassLayout, { w: number; h: number }> = {
  landscape: { w: 2200, h: 1300 },
  portrait: { w: 1100, h: 2200 },
}
/** Where the "Download Ticket" button sits (canvas px). The preview paints it and an HTML <button> covers it. */
export const PASS_BUTTON: Record<PassLayout, Rect> = {
  landscape: { x: 1650, y: 960, w: 404, h: 100 },
  portrait: { x: 140, y: 1955, w: 820, h: 85 },
}

export const PASS_FONTS = [
  { font: '400 60px "Pinyon Script"', text: 'Syarif Zhasy &SZ' },
  { font: '500 40px "Cormorant Garamond"', text: 'Guest Name 0123456789 WEDNESDAY APRIL' },
  { font: '700 40px "Cormorant Garamond"', text: 'Jl. Bukit Pakar 0123456789 RSVP' },
  { font: '600 30px "Cormorant Garamond"', text: 'Guest Name SZ-070427 0123456789' },
  { font: '500 24px "Jost"', text: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 ·&,.' },
  { font: '600 24px "Jost"', text: 'DOWNLOAD TICKET 07 APR 27' },
]

const C = {
  night: '#10161c',
  emerald: '#0F4337',
  emeraldDark: '#08291f',
  goldLight: '#EBCF82',
  gold: '#C19A43',
  goldDeep: '#8C6A1F',
  cream: '#FCF7E9',
  cream2: '#F5ECD3',
  green: '#0E4A3A',
  body: '#27322E',
}
const SERIF = '"Cormorant Garamond", "Times New Roman", serif'
const SANS = '"Jost", "Helvetica Neue", Arial, sans-serif'
const SCRIPT = '"Pinyon Script", "Brush Script MT", cursive'

type Ctx = CanvasRenderingContext2D
type Align = 'left' | 'center' | 'right'

// ------------------------------------------------------------------ text helpers
/** Width of `s` with manual letter-spacing (works in every browser; `ctx.letterSpacing` does not). */
function width(ctx: Ctx, s: string, ls: number) {
  if (!ls) return ctx.measureText(s).width
  let w = 0
  for (const ch of s) w += ctx.measureText(ch).width + ls
  return w - ls
}

interface TextOpts { font: string; color: string; ls?: number; align?: Align; upper?: boolean }

function text(ctx: Ctx, s: string, x: number, y: number, o: TextOpts) {
  const str = o.upper ? s.toUpperCase() : s
  const ls = o.ls ?? 0
  ctx.font = o.font
  ctx.fillStyle = o.color
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  const w = width(ctx, str, ls)
  let cx = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x
  if (!ls) {
    ctx.fillText(str, cx, y)
    return w
  }
  for (const ch of str) {
    ctx.fillText(ch, cx, y)
    cx += ctx.measureText(ch).width + ls
  }
  return w
}

/** Largest font size (≤ `size`) at which `s` fits `maxW`. `mk` builds the CSS font string for a size. */
function fit(ctx: Ctx, s: string, mk: (size: number) => string, size: number, maxW: number, ls = 0) {
  let sz = size
  ctx.font = mk(sz)
  while (sz > 12 && width(ctx, s, ls) > maxW) {
    sz -= 1
    ctx.font = mk(sz)
  }
  return sz
}

function wrap(ctx: Ctx, s: string, maxW: number, ls: number) {
  const lines: string[] = []
  let line = ''
  for (const word of s.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word
    if (line && width(ctx, next, ls) > maxW) {
      lines.push(line)
      line = word
    } else line = next
  }
  if (line) lines.push(line)
  return lines
}

// ------------------------------------------------------------------ shape helpers
function rr(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function goldGradient(ctx: Ctx, x: number, y: number, w: number, h: number) {
  const g = ctx.createLinearGradient(x, y, x + w, y + h)
  g.addColorStop(0, C.goldLight)
  g.addColorStop(0.5, C.gold)
  g.addColorStop(1, C.goldDeep)
  return g
}

function line(ctx: Ctx, x1: number, y1: number, x2: number, y2: number, color = C.gold, w = 2) {
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.strokeStyle = color
  ctx.lineWidth = w
  ctx.stroke()
}

/** Two thin parallel gold rules, like a printed ticket. */
function doubleRule(ctx: Ctx, x1: number, x2: number, y: number) {
  line(ctx, x1, y, x2, y, C.gold, 3)
  line(ctx, x1, y + 7, x2, y + 7, C.gold, 1.5)
}

function dotted(ctx: Ctx, x1: number, y1: number, x2: number, y2: number) {
  ctx.save()
  ctx.setLineDash([2, 12])
  ctx.lineCap = 'round'
  line(ctx, x1, y1, x2, y2, C.gold, 4)
  ctx.restore()
}

let tile: HTMLCanvasElement | null = null
/** Seamless art-deco "fan" pattern tile in faint gold. */
function patternTile() {
  if (tile) return tile
  const t = document.createElement('canvas')
  t.width = t.height = 96
  const c = t.getContext('2d')!
  c.strokeStyle = 'rgba(193,154,67,0.2)'
  c.lineWidth = 1.6
  const centers: [number, number][] = [[0, 0], [96, 0], [0, 96], [96, 96], [48, 48]]
  for (const [cx, cy] of centers) for (const r of [14, 26, 38, 50]) {
    c.beginPath()
    c.arc(cx, cy, r, 0, Math.PI * 2)
    c.stroke()
  }
  tile = t
  return t
}

/** A cream paper panel: soft gradient, art-deco pattern, faint world map and a hairline gold keyline. */
function paper(ctx: Ctx, r: Rect, radius: number, map?: Rect) {
  ctx.save()
  rr(ctx, r.x, r.y, r.w, r.h, radius)
  const g = ctx.createLinearGradient(r.x, r.y, r.x + r.w, r.y + r.h)
  g.addColorStop(0, C.cream)
  g.addColorStop(1, C.cream2)
  ctx.fillStyle = g
  ctx.fill()
  ctx.clip()
  ctx.fillStyle = ctx.createPattern(patternTile(), 'repeat')!
  ctx.fillRect(r.x, r.y, r.w, r.h)
  if (map) {
    const b = WORLD_MAP_BOUNDS
    const s = Math.min(map.w / b.w, map.h / b.h)
    ctx.translate(map.x + (map.w - b.w * s) / 2 - b.x * s, map.y + (map.h - b.h * s) / 2 - b.y * s)
    ctx.scale(s, s)
    ctx.fillStyle = 'rgba(176,138,58,0.2)'
    ctx.fill(new Path2D(WORLD_MAP_D))
  }
  ctx.restore()
  rr(ctx, r.x + 14, r.y + 14, r.w - 28, r.h - 28, Math.max(radius - 10, 6))
  ctx.strokeStyle = 'rgba(193,154,67,0.75)'
  ctx.lineWidth = 2
  ctx.stroke()
}

function plane(ctx: Ctx, x: number, y: number, scale: number, angle: number, color = C.goldDeep) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.scale(scale, scale)
  ctx.fillStyle = color
  ctx.fill(new Path2D(PLANE_D))
  ctx.restore()
}

function diamond(ctx: Ctx, x: number, y: number, r: number, color = C.gold) {
  ctx.beginPath()
  ctx.moveTo(x, y - r)
  ctx.lineTo(x + r, y)
  ctx.lineTo(x, y + r)
  ctx.lineTo(x - r, y)
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
}

/** Round postmark: text running around a ring, with the date in the middle. */
function stamp(ctx: Ctx, cx: number, cy: number, r: number, tilt: number, small: string, big: string) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(tilt)
  ctx.globalAlpha = 0.8
  ctx.strokeStyle = C.goldDeep
  ctx.fillStyle = C.goldDeep
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.stroke()
  ctx.lineWidth = 2
  ctx.setLineDash([2, 6])
  ctx.beginPath()
  ctx.arc(0, 0, r + 12, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.beginPath()
  ctx.arc(0, 0, r - 52, 0, Math.PI * 2)
  ctx.stroke()

  const ring = `${small.toUpperCase()} · `
  ctx.font = `600 ${Math.round(r * 0.2)}px ${SANS}`
  const widths = [...ring].map((ch) => ctx.measureText(ch).width)
  const circ = 2 * Math.PI * (r - 22)
  const extra = (circ - widths.reduce((a, b) => a + b, 0)) / widths.length
  let a = -Math.PI / 2
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ;[...ring].forEach((ch, i) => {
    const step = (widths[i] + extra) / (r - 22)
    ctx.save()
    ctx.rotate(a + step / 2)
    ctx.fillText(ch, 0, -(r - 22))
    ctx.restore()
    a += step
  })
  ctx.textAlign = 'center'
  ctx.font = `700 ${Math.round(r * 0.3)}px ${SERIF}`
  ctx.fillText(big.split(' ')[0], 0, -r * 0.08)
  ctx.font = `700 ${Math.round(r * 0.24)}px ${SERIF}`
  ctx.fillText(big.split(' ')[1] ?? '', 0, r * 0.2)
  ctx.restore()
}

function barcode(ctx: Ctx, x: number, y: number, w: number, h: number, seed: string) {
  let s = 0
  for (const ch of seed) s = (s * 31 + ch.charCodeAt(0)) >>> 0
  const rnd = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 2 ** 32)
  ctx.fillStyle = C.green
  let cy = y
  while (cy < y + h - 8) {
    const t = 3 + Math.floor(rnd() * 3) * 3
    ctx.fillRect(x, cy, w, Math.min(t, y + h - cy))
    cy += t + 3 + Math.floor(rnd() * 2) * 3
  }
}

function qr(ctx: Ctx, data: string, x: number, y: number, size: number) {
  const { size: n, data: m } = encode(data, { ecc: 'M', border: 0 })
  const cell = size / n
  ctx.fillStyle = C.green
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (m[r][c]) ctx.fillRect(x + c * cell - 0.4, y + r * cell - 0.4, cell + 0.8, cell + 0.8)
  }
}

function qrFrame(ctx: Ctx, data: string, x: number, y: number, size: number) {
  rr(ctx, x, y, size, size, 18)
  ctx.fillStyle = '#FFFDF6'
  ctx.fill()
  ctx.strokeStyle = C.gold
  ctx.lineWidth = 3
  ctx.stroke()
  const pad = size * 0.1
  qr(ctx, data, x + pad, y + pad, size - pad * 2)
}

function downloadButton(ctx: Ctx, r: Rect, preview: boolean) {
  if (!preview) {
    ctx.save()
    const cx = r.x + r.w / 2
    const cy = r.y + r.h / 2
    diamond(ctx, cx, cy - 30, 7)
    const as = fit(ctx, guestPass.admit.toUpperCase(), (s) => `500 ${s}px ${SANS}`, r.w > 600 ? 26 : 22, r.w - 10, 4)
    text(ctx, guestPass.admit, cx, cy + 12, { font: `500 ${as}px ${SANS}`, color: C.goldDeep, ls: 4, align: 'center', upper: true })
    line(ctx, r.x, cy + 38, r.x + r.w, cy + 38, 'rgba(193,154,67,0.5)', 1.5)
    ctx.restore()
    return
  }
  ctx.save()
  ctx.shadowColor = 'rgba(16,59,49,0.35)'
  ctx.shadowBlur = 24
  ctx.shadowOffsetY = 8
  rr(ctx, r.x, r.y, r.w, r.h, 22)
  const g = ctx.createLinearGradient(0, r.y, 0, r.y + r.h)
  g.addColorStop(0, '#16604E')
  g.addColorStop(1, '#0B3A2F')
  ctx.fillStyle = g
  ctx.fill()
  ctx.restore()
  rr(ctx, r.x, r.y, r.w, r.h, 22)
  ctx.strokeStyle = goldGradient(ctx, r.x, r.y, r.w, r.h)
  ctx.lineWidth = 4
  ctx.stroke()
  // download icon
  const ix = r.x + 52
  const iy = r.y + r.h / 2
  ctx.strokeStyle = C.goldLight
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(ix, iy - 16)
  ctx.lineTo(ix, iy + 8)
  ctx.moveTo(ix - 12, iy - 4)
  ctx.lineTo(ix, iy + 8)
  ctx.lineTo(ix + 12, iy - 4)
  ctx.moveTo(ix - 16, iy + 18)
  ctx.lineTo(ix + 16, iy + 18)
  ctx.stroke()
  const label = guestPass.downloadLabel
  const sz = fit(ctx, label.toUpperCase(), (s) => `600 ${s}px ${SANS}`, 30, r.w - 150, 6)
  text(ctx, label, r.x + r.w / 2 + 28, iy + sz * 0.35, { font: `600 ${sz}px ${SANS}`, color: C.goldLight, ls: 6, align: 'center', upper: true })
}

// ------------------------------------------------------------------ shared ticket chrome
function backdrop(ctx: Ctx, w: number, h: number) {
  ctx.fillStyle = C.night
  ctx.fillRect(0, 0, w, h)
  const g = ctx.createRadialGradient(w / 2, 0, 0, w / 2, 0, w * 0.7)
  g.addColorStop(0, 'rgba(120,98,50,0.45)')
  g.addColorStop(1, 'rgba(120,98,50,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

function ticketBody(ctx: Ctx, r: Rect, radius: number) {
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.55)'
  ctx.shadowBlur = 70
  ctx.shadowOffsetY = 24
  rr(ctx, r.x, r.y, r.w, r.h, radius)
  const g = ctx.createLinearGradient(r.x, r.y, r.x + r.w, r.y + r.h)
  g.addColorStop(0, '#12493C')
  g.addColorStop(0.5, '#0B3027')
  g.addColorStop(1, '#10463A')
  ctx.fillStyle = g
  ctx.fill()
  ctx.restore()
  rr(ctx, r.x, r.y, r.w, r.h, radius)
  ctx.strokeStyle = goldGradient(ctx, r.x, r.y, r.w, r.h)
  ctx.lineWidth = 7
  ctx.stroke()
}

function monogram(ctx: Ctx, cx: number, cy: number, r: number) {
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.strokeStyle = C.goldLight
  ctx.lineWidth = 2.5
  ctx.stroke()
  text(ctx, couple.monogram.replace(/\s/g, ''), cx, cy + r * 0.28, { font: `400 ${Math.round(r * 0.9)}px ${SCRIPT}`, color: C.goldLight, align: 'center' })
}

/** "Syarif & Zhasy" in script. Returns the horizontal positions so a stamp can sit behind it. */
function names(ctx: Ctx, cx: number, maxW: number, y: number, size: number, stacked: boolean) {
  const a = couple.groom.nickname
  const b = couple.bride.nickname
  if (stacked) {
    text(ctx, a, cx, y, { font: `400 ${size}px ${SCRIPT}`, color: C.green, align: 'center' })
    text(ctx, '&', cx, y + size * 0.5, { font: `400 ${size * 0.62}px ${SCRIPT}`, color: C.goldDeep, align: 'center' })
    text(ctx, b, cx, y + size * 1.4, { font: `400 ${size}px ${SCRIPT}`, color: C.green, align: 'center' })
    return
  }
  const sz = (() => {
    let s = size
    for (;;) {
      ctx.font = `400 ${s}px ${SCRIPT}`
      const wa = ctx.measureText(a).width
      const wb = ctx.measureText(b).width
      ctx.font = `400 ${s * 0.55}px ${SCRIPT}`
      const wm = ctx.measureText('&').width
      if (wa + wb + wm + s * 0.5 <= maxW || s < 60) return s
      s -= 4
    }
  })()
  const gap = sz * 0.22
  let x = cx
  x += text(ctx, a, x, y, { font: `400 ${sz}px ${SCRIPT}`, color: C.green }) + gap
  x += text(ctx, '&', x, y - sz * 0.05, { font: `400 ${sz * 0.55}px ${SCRIPT}`, color: C.goldDeep }) + gap
  text(ctx, b, x, y, { font: `400 ${sz}px ${SCRIPT}`, color: C.green })
}

// ------------------------------------------------------------------ landscape
function landscape(ctx: Ctx, g: PassGuest, preview: boolean) {
  const f = passFacts()
  const T: Rect = { x: 60, y: 60, w: 2080, h: 1180 }
  if (!preview) backdrop(ctx, 2200, 1300)
  ticketBody(ctx, T, 76)

  // spine
  rr(ctx, 96, 96, 160, 1108, 42)
  ctx.fillStyle = 'rgba(255,255,255,0.07)'
  ctx.fill()
  rr(ctx, 110, 110, 132, 1080, 32)
  ctx.strokeStyle = 'rgba(193,154,67,0.55)'
  ctx.lineWidth = 2
  ctx.stroke()
  monogram(ctx, 176, 232, 48)
  ctx.save()
  ctx.translate(188, 560)
  ctx.rotate(-Math.PI / 2)
  text(ctx, guestPass.spineTitle, 0, 0, { font: `500 42px ${SANS}`, color: 'rgba(235,207,130,0.85)', ls: 15, align: 'center', upper: true })
  ctx.restore()
  ctx.save()
  ctx.translate(184, 1015)
  ctx.rotate(-Math.PI / 2)
  text(ctx, guestPass.spineStatus, 0, 0, { font: `500 20px ${SANS}`, color: C.gold, ls: 4, align: 'center', upper: true })
  ctx.restore()
  dotted(ctx, 275, 150, 275, 1150)
  dotted(ctx, 1580, 150, 1580, 1150)

  // main panel
  const M: Rect = { x: 290, y: 96, w: 1270, h: 1108 }
  paper(ctx, M, 44, { x: 700, y: 330, w: 800, h: 620 })
  const L = 346
  const R = 1504
  text(ctx, guestPass.eyebrow, L, 170, { font: `500 23px ${SANS}`, color: C.goldDeep, ls: 5, upper: true })
  doubleRule(ctx, L, R, 192)
  text(ctx, guestPass.inviteLine, L, 252, { font: `500 28px ${SANS}`, color: C.green, ls: 7, upper: true })

  stamp(ctx, 1405, 300, 84, -0.2, guestPass.stamp, `${f.day} ${f.shortDate.split(' ')[1]}`)
  names(ctx, L, 1090, 410, 175, false)

  text(ctx, guestPass.guestLabel, L, 530, { font: `500 23px ${SANS}`, color: C.body, ls: 6, upper: true })
  const gs = fit(ctx, g.name, (s) => `600 ${s}px ${SERIF}`, 82, 1030)
  text(ctx, g.name, L, 602, { font: `600 ${gs}px ${SERIF}`, color: C.green })
  doubleRule(ctx, L, 1380, 622)
  barcode(ctx, 1426, 470, 78, 440, g.ticketNo)

  // date + boarding grid
  const gx = [L, 740, 880, 1380]
  line(ctx, L, 660, 1380, 660)
  line(ctx, L, 820, 1380, 820)
  line(ctx, L, 940, 1380, 940)
  line(ctx, gx[1], 660, gx[1], 820)
  line(ctx, gx[2], 660, gx[2], 820)
  line(ctx, 863, 820, 863, 940)
  const lab = (s: string, x: number, y: number) => text(ctx, s, x, y, { font: `500 20px ${SANS}`, color: C.body, ls: 5, upper: true })
  lab(guestPass.dateLabel, L + 26, 706)
  const ws = fit(ctx, f.weekday.toUpperCase(), (s) => `500 ${s}px ${SERIF}`, 58, 360, 3)
  text(ctx, f.weekday, L + 26, 782, { font: `500 ${ws}px ${SERIF}`, color: C.green, ls: 3, upper: true })
  text(ctx, f.day, 810, 790, { font: `700 190px ${SERIF}`, color: C.green, align: 'center' })
  text(ctx, f.month, 912, 738, { font: `500 66px ${SERIF}`, color: C.green, ls: 7, upper: true })
  text(ctx, f.year, 912, 802, { font: `500 54px ${SERIF}`, color: C.green, ls: 3 })
  f.times.forEach((t, i) => {
    const x = i ? 863 + 26 : L + 26
    lab(`${guestPass.boardingLabel} · ${t.code}`, x, 864)
    const ts = fit(ctx, t.time, (s) => `600 ${s}px ${SERIF}`, 54, 480)
    text(ctx, t.time, x, 920, { font: `600 ${ts}px ${SERIF}`, color: C.green })
  })

  // destination
  text(ctx, guestPass.destinationLabel, L, 1005, { font: `500 21px ${SANS}`, color: C.body, ls: 6, upper: true })
  const hs = fit(ctx, f.venueHead, (s) => `700 ${s}px ${SERIF}`, 66, R - L)
  text(ctx, f.venueHead, L, 1070, { font: `700 ${hs}px ${SERIF}`, color: C.goldDeep })
  ctx.font = `500 24px ${SANS}`
  wrap(ctx, f.venueRest.toUpperCase(), R - L, 3).forEach((ln, i) =>
    text(ctx, ln, L, 1118 + i * 38, { font: `500 24px ${SANS}`, color: C.body, ls: 3 }),
  )

  // stub
  const S: Rect = { x: 1600, y: 96, w: 504, h: 1108 }
  paper(ctx, S, 44)
  const sl = 1650
  const sr = 2054
  dotted(ctx, sl, 222, 1765, 196)
  plane(ctx, 1795, 193, 1.5, -0.1)
  text(ctx, f.shortDate, sr, 208, { font: `600 27px ${SANS}`, color: C.goldDeep, ls: 6, align: 'right' })
  line(ctx, sl, 262, 1830, 262, 'rgba(193,154,67,0.6)', 1.5)
  line(ctx, 1870, 262, sr, 262, 'rgba(193,154,67,0.6)', 1.5)
  diamond(ctx, 1850, 262, 8)
  text(ctx, guestPass.rsvpTitle, sl, 382, { font: `700 100px ${SERIF}`, color: C.green, ls: 3 })
  ctx.font = `500 21px ${SANS}`
  const stat = wrap(ctx, guestPass.rsvpStatus.toUpperCase(), 404, 4)
  stat.forEach((ln, i) => text(ctx, ln, sl, 424 + i * 34, { font: `500 21px ${SANS}`, color: C.body, ls: 4 }))
  text(ctx, guestPass.passengerLabel, sl, 524, { font: `500 21px ${SANS}`, color: C.body, ls: 5, upper: true })
  const ps = fit(ctx, g.name, (s) => `600 ${s}px ${SERIF}`, 54, 404)
  text(ctx, g.name, sl, 580, { font: `600 ${ps}px ${SERIF}`, color: C.green })
  doubleRule(ctx, sl, sr, 606)
  qrFrame(ctx, qrPayload(g), sl, 640, 190)
  ctx.font = `400 23px ${SANS}`
  wrap(ctx, guestPass.qrNote, 190, 0).forEach((ln, i) =>
    text(ctx, ln, 1868, 690 + i * 34, { font: `400 23px ${SANS}`, color: C.body }),
  )
  text(ctx, guestPass.ticketLabel, sl, 880, { font: `500 21px ${SANS}`, color: C.body, ls: 5, upper: true })
  const ts = fit(ctx, g.ticketNo, (s) => `600 ${s}px ${SERIF}`, 58, 404, 3)
  text(ctx, g.ticketNo, sl, 934, { font: `600 ${ts}px ${SERIF}`, color: C.green, ls: 3 })
  downloadButton(ctx, PASS_BUTTON.landscape, preview)
  text(ctx, guestPass.mapLabel, sl, 1112, { font: `500 20px ${SANS}`, color: C.body, ls: 5, upper: true })
  const ms = fit(ctx, f.mapsText, (s) => `500 ${s}px ${SANS}`, 24, 404)
  text(ctx, f.mapsText, sl, 1150, { font: `500 ${ms}px ${SANS}`, color: C.goldDeep })
}

// ------------------------------------------------------------------ portrait (phones)
function portrait(ctx: Ctx, g: PassGuest, preview: boolean) {
  const f = passFacts()
  const T: Rect = { x: 50, y: 50, w: 1000, h: 2100 }
  const cx = 550
  const L = 140
  const R = 960
  if (!preview) backdrop(ctx, 1100, 2200)
  ticketBody(ctx, T, 70)

  // header band
  monogram(ctx, 160, 125, 42)
  text(ctx, guestPass.spineTitle, 232, 124, { font: `500 32px ${SANS}`, color: 'rgba(235,207,130,0.9)', ls: 12, upper: true })
  text(ctx, guestPass.spineStatus, 232, 160, { font: `500 19px ${SANS}`, color: C.gold, ls: 5, upper: true })

  const M: Rect = { x: 86, y: 200, w: 928, h: 1250 }
  paper(ctx, M, 40, { x: 120, y: 600, w: 860, h: 560 })
  const eb = fit(ctx, guestPass.eyebrow.toUpperCase(), (s) => `500 ${s}px ${SANS}`, 19, 820, 4)
  text(ctx, guestPass.eyebrow, cx, 268, { font: `500 ${eb}px ${SANS}`, color: C.goldDeep, ls: 4, align: 'center', upper: true })
  doubleRule(ctx, L, R, 290)
  const il = fit(ctx, guestPass.inviteLine.toUpperCase(), (s) => `500 ${s}px ${SANS}`, 25, 820, 6)
  text(ctx, guestPass.inviteLine, cx, 356, { font: `500 ${il}px ${SANS}`, color: C.green, ls: 6, align: 'center', upper: true })

  stamp(ctx, 850, 560, 92, -0.2, guestPass.stamp, `${f.day} ${f.shortDate.split(' ')[1]}`)
  names(ctx, cx, 820, 490, 160, true)

  text(ctx, guestPass.guestLabel, cx, 818, { font: `500 21px ${SANS}`, color: C.body, ls: 6, align: 'center', upper: true })
  const gs = fit(ctx, g.name, (s) => `600 ${s}px ${SERIF}`, 70, 820)
  text(ctx, g.name, cx, 888, { font: `600 ${gs}px ${SERIF}`, color: C.green, align: 'center' })
  doubleRule(ctx, L, R, 916)

  line(ctx, L, 952, R, 952)
  line(ctx, L, 1102, R, 1102)
  line(ctx, L, 1212, R, 1212)
  line(ctx, 440, 952, 440, 1102)
  line(ctx, 560, 952, 560, 1102)
  line(ctx, 550, 1102, 550, 1212)
  const lab = (s: string, x: number, y: number) => text(ctx, s, x, y, { font: `500 19px ${SANS}`, color: C.body, ls: 5, upper: true })
  lab(guestPass.dateLabel, L + 18, 994)
  const ws = fit(ctx, f.weekday.toUpperCase(), (s) => `500 ${s}px ${SERIF}`, 46, 262, 2)
  text(ctx, f.weekday, L + 18, 1060, { font: `500 ${ws}px ${SERIF}`, color: C.green, ls: 2, upper: true })
  text(ctx, f.day, 500, 1064, { font: `700 150px ${SERIF}`, color: C.green, align: 'center' })
  text(ctx, f.month, 590, 1022, { font: `500 54px ${SERIF}`, color: C.green, ls: 5, upper: true })
  text(ctx, f.year, 590, 1076, { font: `500 46px ${SERIF}`, color: C.green, ls: 3 })
  f.times.forEach((t, i) => {
    const x = i ? 550 + 18 : L + 18
    lab(`${guestPass.boardingLabel} · ${t.code}`, x, 1144)
    const ts = fit(ctx, t.time, (s) => `600 ${s}px ${SERIF}`, 46, 370)
    text(ctx, t.time, x, 1192, { font: `600 ${ts}px ${SERIF}`, color: C.green })
  })

  text(ctx, guestPass.destinationLabel, cx, 1268, { font: `500 19px ${SANS}`, color: C.body, ls: 6, align: 'center', upper: true })
  const hs = fit(ctx, f.venueHead, (s) => `700 ${s}px ${SERIF}`, 54, 820)
  text(ctx, f.venueHead, cx, 1330, { font: `700 ${hs}px ${SERIF}`, color: C.goldDeep, align: 'center' })
  ctx.font = `500 20px ${SANS}`
  wrap(ctx, f.venueRest.toUpperCase(), 820, 2).forEach((ln, i) =>
    text(ctx, ln, cx, 1372 + i * 30, { font: `500 20px ${SANS}`, color: C.body, ls: 2, align: 'center' }),
  )

  // stub
  dotted(ctx, 120, 1470, 980, 1470)
  const S: Rect = { x: 86, y: 1490, w: 928, h: 620 }
  paper(ctx, S, 40)
  dotted(ctx, L, 1556, 340, 1536)
  plane(ctx, 372, 1534, 1.4, -0.1)
  text(ctx, f.shortDate, R, 1546, { font: `600 26px ${SANS}`, color: C.goldDeep, ls: 6, align: 'right' })
  qrFrame(ctx, qrPayload(g), L, 1600, 230)
  ctx.font = `400 21px ${SANS}`
  wrap(ctx, guestPass.qrNote, 230, 0).forEach((ln, i) =>
    text(ctx, ln, L, 1870 + i * 30, { font: `400 21px ${SANS}`, color: C.body }),
  )
  const cl = 410
  text(ctx, guestPass.rsvpTitle, cl, 1672, { font: `700 88px ${SERIF}`, color: C.green, ls: 3 })
  const st = fit(ctx, guestPass.rsvpStatus.toUpperCase(), (s) => `500 ${s}px ${SANS}`, 19, R - cl, 3)
  text(ctx, guestPass.rsvpStatus, cl, 1714, { font: `500 ${st}px ${SANS}`, color: C.body, ls: 3, upper: true })
  text(ctx, guestPass.passengerLabel, cl, 1782, { font: `500 19px ${SANS}`, color: C.body, ls: 5, upper: true })
  const ps = fit(ctx, g.name, (s) => `600 ${s}px ${SERIF}`, 48, R - cl)
  text(ctx, g.name, cl, 1834, { font: `600 ${ps}px ${SERIF}`, color: C.green })
  text(ctx, guestPass.ticketLabel, cl, 1896, { font: `500 19px ${SANS}`, color: C.body, ls: 5, upper: true })
  const ts = fit(ctx, g.ticketNo, (s) => `600 ${s}px ${SERIF}`, 52, R - cl, 3)
  text(ctx, g.ticketNo, cl, 1942, { font: `600 ${ts}px ${SERIF}`, color: C.green, ls: 3 })
  downloadButton(ctx, PASS_BUTTON.portrait, false)
  const mp = `${guestPass.mapLabel} · ${f.mapsText}`
  const ms = fit(ctx, mp, (s) => `500 ${s}px ${SANS}`, 20, 820)
  text(ctx, mp, cx, 2078, { font: `500 ${ms}px ${SANS}`, color: C.goldDeep, align: 'center' })
}

/**
 * Draws the whole pass onto `canvas` (resized to the layout). `preview` = the on-screen copy: transparent backdrop (the
 * page supplies it) and, on the wide layout, a painted download button. The exported PNG gets the full dark backdrop.
 */
export function drawPass(canvas: HTMLCanvasElement, guest: PassGuest, layout: PassLayout, preview: boolean) {
  const { w, h } = PASS_SIZE[layout]
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, w, h)
  ;(layout === 'landscape' ? landscape : portrait)(ctx, guest, preview)
}

/** Loads the pass fonts (they are drawn on a canvas, so the browser would not fetch them on its own). */
export async function loadPassFonts() {
  try {
    await Promise.all(PASS_FONTS.map((f) => document.fonts.load(f.font, f.text)))
    await document.fonts.ready
  } catch {
    /* fall back to the system serif/sans */
  }
}

export function canvasToPng(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png'),
  )
}
