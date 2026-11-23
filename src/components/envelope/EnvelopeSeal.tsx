/** Scalloped gold seal with the couple's monogram. Pure SVG, no motion of its own. */
import { palette } from '../../lib/palette'

function scallopPath(cx: number, cy: number, r: number, bumps: number) {
  const step = (Math.PI * 2) / bumps
  const bumpR = r * Math.sin(step / 2) * 1.15
  const pt = (a: number) => `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`
  let d = `M ${pt(0)}`
  for (let i = 1; i <= bumps; i++) d += ` A ${bumpR.toFixed(2)} ${bumpR.toFixed(2)} 0 0 1 ${pt(i * step)}`
  return d + ' Z'
}

const SCALLOP = scallopPath(50, 50, 42, 14)

export function EnvelopeSeal({ groomInitial, brideInitial }: { groomInitial: string; brideInitial: string }) {
  return (
    <svg viewBox="0 0 100 100" className="block size-full drop-shadow-[3px_3px_0_#2B2D42]">
      <path d={SCALLOP} fill={palette.sunshine} stroke={palette.ink} strokeWidth={3} strokeLinejoin="round" />
      {/* soft sheen on the upper-left edge */}
      <path d="M22 34 A 30 30 0 0 1 40 20" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" opacity={0.55} />
      <circle cx="50" cy="50" r="31" fill="none" stroke={palette.ink} strokeWidth={1.4} strokeDasharray="2.5 3.2" />
      {/* tiny heart */}
      <path
        d="M50 37 C 46 33.5, 42.5 31.5, 42.5 28.6 C 42.5 26.6, 44 25.3, 45.8 25.3 C 47.4 25.3, 48.5 26.3, 50 28 C 51.5 26.3, 52.6 25.3, 54.2 25.3 C 56 25.3, 57.5 26.6, 57.5 28.6 C 57.5 31.5, 54 33.5, 50 37 Z"
        fill={palette.coral}
        stroke={palette.ink}
        strokeWidth={1.4}
      />
      <text
        x="50"
        y="64"
        textAnchor="middle"
        fontFamily="Fraunces, Georgia, serif"
        fontWeight={700}
        fontSize="20"
        fill={palette.ink}
      >
        {groomInitial}
        <tspan fill={palette.coral} fontStyle="italic">
          &amp;
        </tspan>
        {brideInitial}
      </text>
    </svg>
  )
}
