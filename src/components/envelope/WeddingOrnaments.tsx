/**
 * Wedding iconography for the envelope — pure SVG, no motion:
 *  - OliveWreath: two olive branches framing the seal
 *  - GoldRings:   two interlocked gold wedding bands with a gem
 *  - DovePair:    a pair of doves facing each other with a small heart
 */
import { palette } from '../../lib/palette'

const ink = palette.ink

// ---------------------------------------------------------------- olive wreath
interface Leaf {
  cx: number
  cy: number
  rx: number
  ry: number
  rot: number
  fill: string
}

function buildWreath() {
  const C = 50
  const R = 42
  const STEPS = 8
  const SWEEP = 142 // degrees each branch climbs from the bottom (leaves a gap at the top)
  const leaves: Leaf[] = []
  const berries: { x: number; y: number }[] = []

  for (const side of [1, -1] as const) {
    for (let i = 0; i < STEPS; i++) {
      const t = i / (STEPS - 1)
      const theta = ((90 + side * (16 + t * SWEEP)) * Math.PI) / 180
      const px = C + R * Math.cos(theta)
      const py = C + R * Math.sin(theta)
      // growth direction along the branch, and outward normal
      const tx = -Math.sin(theta) * side
      const ty = Math.cos(theta) * side
      const nx = Math.cos(theta)
      const ny = Math.sin(theta)
      const len = 10.5 - t * 2.5
      for (const out of [1, -1] as const) {
        let dx = tx + nx * 0.75 * out
        let dy = ty + ny * 0.75 * out
        const m = Math.hypot(dx, dy)
        dx /= m
        dy /= m
        leaves.push({
          cx: px + (dx * len) / 2,
          cy: py + (dy * len) / 2,
          rx: len / 2,
          ry: 2.5 - t * 0.5,
          rot: (Math.atan2(dy, dx) * 180) / Math.PI,
          fill: out === 1 ? palette.mint : palette.sageDeep,
        })
      }
      if (i % 3 === 1) berries.push({ x: px + nx * 3.2, y: py + ny * 3.2 })
    }
  }
  return { leaves, berries, R }
}

const WREATH = buildWreath()

export function OliveWreath({ className = '' }: { className?: string }) {
  const { leaves, berries, R } = WREATH
  const arc = (side: 1 | -1) => {
    const a0 = ((90 + side * 16) * Math.PI) / 180
    const a1 = ((90 + side * (16 + 142)) * Math.PI) / 180
    const p = (a: number) => `${(50 + R * Math.cos(a)).toFixed(2)} ${(50 + R * Math.sin(a)).toFixed(2)}`
    return `M${p(a0)} A${R} ${R} 0 0 ${side === 1 ? 1 : 0} ${p(a1)}`
  }
  return (
    <svg viewBox="0 0 100 100" aria-hidden className={`overflow-visible ${className}`}>
      <g stroke={ink} strokeLinecap="round">
        <path d={arc(1)} fill="none" strokeWidth={1.3} />
        <path d={arc(-1)} fill="none" strokeWidth={1.3} />
      </g>
      {leaves.map((l, i) => (
        <ellipse
          key={i}
          cx={l.cx}
          cy={l.cy}
          rx={l.rx}
          ry={l.ry}
          fill={l.fill}
          stroke={ink}
          strokeWidth={0.8}
          transform={`rotate(${l.rot.toFixed(1)} ${l.cx.toFixed(2)} ${l.cy.toFixed(2)})`}
        />
      ))}
      {berries.map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y} r={1.9} fill={palette.sunshine} stroke={ink} strokeWidth={0.8} />
      ))}
    </svg>
  )
}

// ---------------------------------------------------------------- gold rings
const Band = ({ cx }: { cx: number }) => (
  <>
    <circle cx={cx} cy="40" r="20" fill="none" stroke={ink} strokeWidth={9.5} />
    <circle cx={cx} cy="40" r="20" fill="none" stroke={palette.sunshine} strokeWidth={5.5} />
    {/* soft highlight on the upper-left of the band */}
    <path
      d={`M${cx - 16} 30 A 18 18 0 0 1 ${cx - 5} 22`}
      fill="none"
      stroke="#fff"
      strokeWidth={1.6}
      strokeLinecap="round"
      opacity={0.75}
    />
  </>
)

export function GoldRings({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 72" aria-hidden className={`overflow-visible ${className}`}>
      <defs>
        <clipPath id="rings-weave">
          {/* lower crossing: the left band passes over the right one */}
          <rect x="52" y="46" width="16" height="26" />
        </clipPath>
      </defs>
      <Band cx={46} />
      <Band cx={74} />
      <g clipPath="url(#rings-weave)">
        <Band cx={46} />
      </g>
      {/* gem on the left band */}
      <g stroke={ink} strokeLinejoin="round" strokeWidth={1.6}>
        <polygon points="39,11 42.5,5 49.5,5 53,11 46,20" fill="#E9F2FA" />
        <path d="M39 11 H53 M42.5 5 L46 11 L49.5 5 M46 11 V20" fill="none" strokeWidth={1.1} />
      </g>
      {/* sparkle */}
      <path
        d="M60 5 l1.6 3.8 3.8 1.6 -3.8 1.6 -1.6 3.8 -1.6 -3.8 -3.8 -1.6 3.8 -1.6 Z"
        fill="#fff"
        stroke={ink}
        strokeWidth={1.1}
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ---------------------------------------------------------------- doves
const DOVE_BODY =
  'M4 30 C 10 28, 16 29, 22 28 C 28 27, 33 22, 38 19 C 41 16, 43 12, 47 11 C 51 10, 54 13, 55 16 L61 18.5 L55.5 19.5 C 54 22, 52 25, 48 28 C 42 35, 33 38, 24 36 C 16 35, 9 34, 4 30 Z'
const DOVE_WING = 'M24 27 C 19 15, 26 5, 41 2 C 38 9, 38 17, 34 24 C 31 28, 27 29, 24 27 Z'

function Dove({ transform }: { transform: string }) {
  return (
    <g transform={transform} stroke={ink} strokeWidth={1.7} strokeLinejoin="round" strokeLinecap="round">
      <path d={DOVE_BODY} fill="#FFFDF7" />
      <path d={DOVE_WING} fill="#F1E7D3" />
      <path d="M27 22 C 29 14, 33 9, 38 5 M30 25 C 32 18, 35 13, 39 9" fill="none" strokeWidth={1.1} />
      <path d="M4 30 L13 32 M6 32.5 L14 34.5" fill="none" strokeWidth={1.1} />
      <circle cx="50" cy="14.2" r="1.15" fill={ink} stroke="none" />
      <path d="M55.5 17.4 L60 18.4" fill="none" stroke={palette.sunshine} strokeWidth={1.4} />
    </g>
  )
}

export function DovePair({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 52" aria-hidden className={`overflow-visible ${className}`}>
      <Dove transform="translate(0 12)" />
      <Dove transform="translate(140 5) scale(-0.88 0.88)" />
      <path
        d="M70 20 C 66 16.5, 64 14.5, 64 12.2 C 64 10.4, 65.4 9.2, 67 9.2 C 68.4 9.2, 69.4 10, 70 11.2 C 70.6 10, 71.6 9.2, 73 9.2 C 74.6 9.2, 76 10.4, 76 12.2 C 76 14.5, 74 16.5, 70 20 Z"
        fill={palette.coral}
        stroke={ink}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  )
}
