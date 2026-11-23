/** Hand-torn paper edge that sits on top of a page and overlaps the previous one. */
import { palette } from '../../lib/palette'

const VB_H = 14

function jaggedPoints(seed: number, n = 56): [number, number][] {
  let s = seed
  const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280)
  return Array.from({ length: n + 1 }, (_, i) => [(i * 100) / n, 2.5 + rand() * 8.5])
}

export function TornEdge({ fill, seed = 7, className = '' }: { fill: string; seed?: number; className?: string }) {
  const pts = jaggedPoints(seed)
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ')
  return (
    <svg
      aria-hidden
      viewBox={`0 0 100 ${VB_H}`}
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-x-0 bottom-full -mb-px block h-4 w-full sm:h-6 ${className}`}
    >
      <path d={`${line} L100 ${VB_H} L0 ${VB_H} Z`} fill={fill} />
      <path d={line} fill="none" stroke={palette.ink} strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  )
}
