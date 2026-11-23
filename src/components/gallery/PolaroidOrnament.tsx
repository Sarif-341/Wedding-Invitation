/**
 * Small hand-drawn scrapbook trim for the empty strip under a polaroid photo (no text):
 * a doodle at each end joined by a squiggly or dotted line. Four variations so the photos don't look cloned.
 * One SVG, so it scales with the polaroid and stays crisp; strokes keep a constant thin ink width.
 */
import { DOODLE_SHAPES } from '../doodles/doodles'
import { palette } from '../../lib/palette'

const INK = palette.ink
const STROKE = { stroke: INK, strokeWidth: 1.6, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const, vectorEffect: 'non-scaling-stroke' as const }

/** 24-unit doodle shape, shrunk to ~17 units and centred on (x, 15) */
function Shape({ d, x, fill, rotate = 0 }: { d: string; x: number; fill: string; rotate?: number }) {
  return (
    <g transform={`translate(${x} 15) rotate(${rotate}) scale(0.72) translate(-12 -12)`}>
      <path d={d} fill={fill} {...STROKE} />
    </g>
  )
}

function Flower({ x, petal }: { x: number; petal: string }) {
  return (
    <g>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx={x} cy={9.6} rx={3.3} ry={4.5} fill={petal} transform={`rotate(${a} ${x} 15)`} {...STROKE} strokeWidth={1.3} />
      ))}
      <circle cx={x} cy={15} r={3} fill={palette.sunshine} {...STROKE} strokeWidth={1.3} />
    </g>
  )
}

/** a tiny "love stamp": dashed round cancel mark with a heart inside */
function LoveStamp({ x, color }: { x: number; color: string }) {
  return (
    <g transform={`rotate(-10 ${x} 15)`}>
      <circle cx={x} cy={15} r={11} fill={palette.paper} stroke={INK} strokeWidth={1.5} strokeDasharray="3.2 2.4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <g transform={`translate(${x} 15) scale(0.46) translate(-12 -12)`}>
        <path d={DOODLE_SHAPES.heart} fill={color} {...STROKE} strokeWidth={2.4} />
      </g>
    </g>
  )
}

function Squiggle({ x1, x2 }: { x1: number; x2: number }) {
  const waves = Math.max(2, Math.floor((x2 - x1) / 6) - 1)
  const d = `M${x1} 15 q3 -6 6 0${' t6 0'.repeat(waves)}`
  return <path d={d} fill="none" {...STROKE} strokeWidth={1.7} />
}

function Dots({ x1, x2 }: { x1: number; x2: number }) {
  return <line x1={x1} y1={15} x2={x2} y2={15} stroke={INK} strokeOpacity={0.7} strokeWidth={2.6} strokeLinecap="round" strokeDasharray="0.1 5.6" vectorEffect="non-scaling-stroke" />
}

export function PolaroidOrnament({ variant, className = '' }: { variant: number; className?: string }) {
  const v = ((variant % 4) + 4) % 4
  return (
    <svg viewBox="0 0 120 30" aria-hidden className={`block overflow-visible ${className}`}>
      {v === 0 && (
        <>
          <Shape d={DOODLE_SHAPES.heart} x={14} fill={palette.coral} rotate={-8} />
          <Squiggle x1={32} x2={88} />
          <Shape d={DOODLE_SHAPES.star} x={106} fill={palette.sunshine} rotate={10} />
        </>
      )}
      {v === 1 && (
        <>
          <Flower x={14} petal={palette.rose} />
          <Dots x1={32} x2={88} />
          <Shape d={DOODLE_SHAPES.heart} x={106} fill={palette.lilac} rotate={8} />
        </>
      )}
      {v === 2 && (
        <>
          <LoveStamp x={14} color={palette.coral} />
          <Squiggle x1={32} x2={88} />
          <Shape d={DOODLE_SHAPES.sparkle} x={106} fill={palette.sky} />
        </>
      )}
      {v === 3 && (
        <>
          <Shape d={DOODLE_SHAPES.star} x={14} fill={palette.mint} rotate={-10} />
          <Dots x1={32} x2={88} />
          <LoveStamp x={106} color={palette.lilac} />
        </>
      )}
    </svg>
  )
}
