/** SVG artwork for the LDR ornament: plane, location pins, passport stamps, torn boarding pass. */
import { useId } from 'react'
import { lightTints, palette } from '../../../lib/palette'

const INK = palette.ink

// ------------------------------------------------------------------ plane
// Top-down airplane facing +x (nose at x=20), centred on the origin so it can be rotated freely.
const PLANE_UP: [number, number][] = [
  [20, 0], [17.5, -2.4], [10, -3.7], [3.5, -3.9], [-6, -17.5], [-11, -17.5],
  [-8.5, -3.8], [-14.5, -3.4], [-19.5, -8.8], [-22.5, -8.8], [-21.8, -1.6], [-21.8, 0],
]
const PLANE_DOWN = PLANE_UP.slice(1, -1).reverse().map(([x, y]) => [x, -y] as [number, number])
export const PLANE_D =
  'M' + [...PLANE_UP, ...PLANE_DOWN].map(([x, y]) => `${x} ${y}`).join(' L') + ' Z'

export function PlaneGlyph({ stroke = INK }: { stroke?: string }) {
  return (
    <>
      <path d={PLANE_D} fill={palette.paper} stroke={stroke} strokeWidth={1.7} strokeLinejoin="round" />
      <rect x={-15} y={-3.3} width={5.5} height={6.6} fill={palette.coral} />
    </>
  )
}

// ------------------------------------------------------------------ location pin
function Flag({ code }: { code: 'DE' | 'ID' }) {
  if (code === 'DE') {
    return (
      <>
        <rect x={12} y={11} width={40} height={12} fill={INK} />
        <rect x={12} y={23} width={40} height={12} fill="#C4513F" />
        <rect x={12} y={35} width={40} height={12} fill="#E0B54A" />
      </>
    )
  }
  return (
    <>
      <rect x={12} y={11} width={40} height={19} fill="#C4513F" />
      <rect x={12} y={30} width={40} height={19} fill={palette.paper} />
    </>
  )
}

export function LocationPin({ color, flag, className = '' }: { color: string; flag: 'DE' | 'ID'; className?: string }) {
  const clip = `pin-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  return (
    <svg viewBox="0 0 64 84" aria-hidden className={`block overflow-visible [filter:drop-shadow(3px_3px_0_#2B2D42)] ${className}`}>
      <defs>
        <clipPath id={clip}>
          <circle cx={32} cy={30} r={17} />
        </clipPath>
      </defs>
      <path
        d="M32 78 C 32 78 5 49 5 30 A 27 27 0 0 1 59 30 C 59 49 32 78 32 78 Z"
        fill={color}
        stroke={INK}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <path d="M12 22 A 21 21 0 0 1 24 9" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" opacity={0.55} />
      <circle cx={32} cy={30} r={19} fill={palette.paper} stroke={INK} strokeWidth={2.5} />
      <g clipPath={`url(#${clip})`}>
        <Flag code={flag} />
      </g>
      <circle cx={32} cy={30} r={17} fill="none" stroke={INK} strokeWidth={1.2} />
    </svg>
  )
}

// ------------------------------------------------------------------ passport stamp
interface StampProps {
  color: string
  /** ALL-CAPS text running along the top of the ring */
  ring: string
  word: string
  date: string
  /** heading of the little plane in the middle, in degrees (0 = pointing right) */
  planeAngle: number
  className?: string
}

export function PassportStamp({ color, ring, word, date, planeAngle, className = '' }: StampProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const topId = `st-top-${uid}`
  const botId = `st-bot-${uid}`
  const inkId = `st-ink-${uid}`
  const wordSize = Math.min(15, 70 / (word.length * 0.66 + 0.6))
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={`block mix-blend-multiply ${className}`}>
      <defs>
        <path id={topId} d="M 21 60 a 39 39 0 1 1 78 0 a 39 39 0 1 1 -78 0" />
        <path id={botId} d="M 14 60 a 46 46 0 0 0 92 0" />
        {/* rough edges + small ink dropouts, like a real rubber stamp */}
        <filter id={inkId} x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" result="n1" />
          <feDisplacementMap in="SourceGraphic" in2="n1" scale="2.2" xChannelSelector="R" yChannelSelector="G" result="rough" />
          <feTurbulence type="fractalNoise" baseFrequency="0.45" numOctaves="3" seed="11" result="n2" />
          <feColorMatrix in="n2" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -7 4.6" result="holes" />
          <feComposite in="rough" in2="holes" operator="in" />
        </filter>
      </defs>
      <g filter={`url(#${inkId})`} fill={color} stroke={color} opacity={0.92}>
        <circle cx={60} cy={60} r={56} fill="none" strokeWidth={3.4} />
        <circle cx={60} cy={60} r={49} fill="none" strokeWidth={1.4} />
        <text
          fontSize={9.5}
          fontWeight={800}
          letterSpacing={1.5}
          textAnchor="middle"
          stroke="none"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          <textPath href={`#${topId}`} startOffset="25%">
            {ring}
          </textPath>
        </text>
        <text
          fontSize={9.5}
          fontWeight={800}
          letterSpacing={1.8}
          textAnchor="middle"
          stroke="none"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          <textPath href={`#${botId}`} startOffset="50%">
            {date}
          </textPath>
        </text>
        <g transform={`translate(60 38) rotate(${planeAngle}) scale(0.55)`} stroke="none">
          <path d={PLANE_D} fill={color} />
        </g>
        <path d="M 30 48 H 90 M 30 72 H 90" strokeWidth={1.3} fill="none" />
        <text
          x={60}
          y={66}
          fontSize={wordSize}
          fontWeight={800}
          letterSpacing={0.8}
          textAnchor="middle"
          stroke="none"
          transform="rotate(-6 60 62)"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {word}
        </text>
      </g>
    </svg>
  )
}

// ------------------------------------------------------------------ boarding pass
export interface TicketCopy {
  header: string
  fromCode: string
  toCode: string
  passengerLabel: string
  passenger: string
  seatLabel: string
  seat: string
  gateLabel: string
  gate: string
  flight: string
}

/** ragged left edge, like the ticket was ripped from a longer strip */
const TORN_LEFT = Array.from({ length: 18 }, (_, i) => {
  const n = i + 1
  return `L${n % 2 ? 3 : 8} ${(78 - n * (76 / 18)).toFixed(2)}`
}).join(' ')
const TICKET_BODY = `M8 2 H142 V78 H8 ${TORN_LEFT} Z`
/** barcode bars (x, width) on the stub — computed once, not on every render */
const BAR_RECTS = (() => {
  const widths = [2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 2, 1, 3, 1]
  const out: { x: number; w: number }[] = []
  let x = 150
  widths.forEach((w, i) => {
    if (i % 2 === 0) out.push({ x, w })
    x += w + 1.3
  })
  return out
})()

export function BoardingPass({ t, className = '' }: { t: TicketCopy; className?: string }) {
  const clip = `tk-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const font = { fontFamily: 'var(--font-body)' } as const
  const display = { fontFamily: 'var(--font-display)' } as const
  return (
    <svg viewBox="0 0 200 80" aria-hidden className={`block overflow-visible [filter:drop-shadow(3px_3px_0_#2B2D42)] ${className}`}>
      <defs>
        <clipPath id={clip}>
          <path d={TICKET_BODY} />
        </clipPath>
      </defs>
      {/* main part */}
      <path d={TICKET_BODY} fill="#FFFFFF" />
      <g clipPath={`url(#${clip})`}>
        <rect x={0} y={0} width={150} height={19} fill={palette.coral} />
      </g>
      <path d={TICKET_BODY} fill="none" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      <text x={18} y={13.4} fontSize={8.6} fontWeight={800} letterSpacing={1.6} fill={palette.paper} style={font}>
        {t.header}
      </text>
      {/* route */}
      <text x={14} y={45} fontSize={21} fontWeight={800} fill={INK} style={display}>
        {t.fromCode}
      </text>
      <text x={136} y={45} fontSize={21} fontWeight={800} textAnchor="end" fill={INK} style={display}>
        {t.toCode}
      </text>
      <g transform="translate(75 38.5) scale(0.42)">
        <PlaneGlyph />
      </g>
      {/* details */}
      {[
        [16, t.passengerLabel, t.passenger],
        [66, t.seatLabel, t.seat],
        [100, t.gateLabel, t.gate],
      ].map(([x, label, value]) => (
        <g key={label as string}>
          <text x={x as number} y={58.5} fontSize={6.2} fontWeight={700} letterSpacing={0.9} fill={INK} opacity={0.6} style={font}>
            {label}
          </text>
          <text x={x as number} y={70} fontSize={9.6} fontWeight={800} fill={INK} style={display}>
            {value}
          </text>
        </g>
      ))}
      {/* tear-off stub */}
      <rect x={142} y={2} width={50} height={76} fill={lightTints.sky} stroke={INK} strokeWidth={2} />
      {BAR_RECTS.map((b) => (
        <rect key={b.x} x={b.x} y={12} width={b.w} height={40} fill={INK} />
      ))}
      <text x={167} y={68} fontSize={7.6} fontWeight={800} letterSpacing={1} textAnchor="middle" fill={INK} style={font}>
        {t.flight}
      </text>
      {/* perforation with punched notches */}
      <path d="M142 6 V74" stroke={INK} strokeWidth={1.5} strokeDasharray="2.6 2.6" />
      <circle cx={142} cy={2} r={4.6} fill={palette.paper} stroke={INK} strokeWidth={1.6} />
      <circle cx={142} cy={78} r={4.6} fill={palette.paper} stroke={INK} strokeWidth={1.6} />
    </svg>
  )
}
