/**
 * Geometry for the Germany ↔ Indonesia flight-path ornament.
 * Everything is expressed in "canvas units" of one viewBox, then converted to percentages, so the
 * illustration scales as a single piece and nothing can overflow or get clipped at any width.
 * Two compositions: a wide one (tablet/desktop) and a tall one (phones).
 */
export interface Box {
  /** centre, in canvas units */
  x: number
  y: number
  /** width, in canvas units */
  w: number
  /** resting tilt in degrees */
  rot: number
}

export interface LdrLayout {
  key: 'wide' | 'narrow'
  vw: number
  vh: number
  /** flight arc: a half-ellipse from `start` to `end`, bulging upward */
  start: { x: number; y: number }
  end: { x: number; y: number }
  rx: number
  ry: number
  /** base size of the plane (altitude scaling is applied on top) */
  planeScale: number
  pinW: number
  pinTipY: number
  pinFromX: number
  pinToX: number
  chip: { x: number; y: number }
  stampA: Box
  stampB: Box
  ticket: Box
}

export const WIDE: LdrLayout = {
  key: 'wide',
  vw: 720,
  vh: 300,
  start: { x: 110, y: 148 },
  end: { x: 610, y: 148 },
  rx: 250,
  ry: 104,
  planeScale: 1,
  pinW: 64,
  pinTipY: 236,
  pinFromX: 110,
  pinToX: 610,
  chip: { x: 360, y: 88 },
  stampA: { x: 56, y: 84, w: 104, rot: -12 },
  stampB: { x: 664, y: 84, w: 104, rot: 9 },
  ticket: { x: 360, y: 218, w: 210, rot: -3 },
}

export const NARROW: LdrLayout = {
  key: 'narrow',
  vw: 300,
  vh: 476,
  start: { x: 62, y: 146 },
  end: { x: 238, y: 146 },
  rx: 88,
  ry: 88,
  planeScale: 0.85,
  pinW: 56,
  pinTipY: 220,
  pinFromX: 62,
  pinToX: 238,
  chip: { x: 150, y: 104 },
  stampA: { x: 88, y: 326, w: 88, rot: -10 },
  stampB: { x: 212, y: 330, w: 88, rot: 8 },
  ticket: { x: 150, y: 418, w: 232, rot: -2 },
}

/** Intrinsic aspect ratios (height / width) of the art components */
export const PIN_ASPECT = 84 / 64
export const STAMP_ASPECT = 1
export const TICKET_ASPECT = 80 / 200
/** where the pin's tip sits inside its artwork (fraction of its height) */
export const PIN_TIP_FRAC = 78 / 84

/** Out-and-back flight paths. The return path is drawn in the opposite direction so that the
 *  plane's nose always points along its motion. */
export function arcPaths(l: LdrLayout) {
  const { start: s, end: e, rx, ry } = l
  return {
    forward: `M ${s.x} ${s.y} A ${rx} ${ry} 0 0 1 ${e.x} ${e.y}`,
    back: `M ${e.x} ${e.y} A ${rx} ${ry} 0 0 0 ${s.x} ${s.y}`,
  }
}

/** canvas units → CSS percentage of the canvas */
export const pct = (v: number, total: number) => `${((v / total) * 100).toFixed(3)}%`

/** absolute-position style for a box whose art has the given height/width aspect */
export function boxStyle(l: LdrLayout, b: Box, aspect: number) {
  return {
    left: pct(b.x - b.w / 2, l.vw),
    top: pct(b.y - (b.w * aspect) / 2, l.vh),
    width: pct(b.w, l.vw),
  }
}

/** position a pin so its tip lands exactly on (x, tipY) */
export function pinStyle(l: LdrLayout, x: number) {
  const h = l.pinW * PIN_ASPECT
  return {
    left: pct(x - l.pinW / 2, l.vw),
    top: pct(l.pinTipY - h * PIN_TIP_FRAC, l.vh),
    width: pct(l.pinW, l.vw),
  }
}
