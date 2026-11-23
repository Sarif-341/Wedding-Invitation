/** Scrapbook paper airplane, seen from above, nose pointing DOWN (it glides down the story timeline). */
import { palette } from '../../lib/palette'

const INK = palette.ink

export function PaperPlane({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 58"
      aria-hidden
      className={`block overflow-visible [filter:drop-shadow(2px_3px_0_rgb(43_45_66/0.4))] ${className}`}
    >
      {/* left wing (lit) and right wing (shaded underside) */}
      <path d="M24 56 L4 14 L24 28 Z" fill={palette.paper} />
      <path d="M24 56 L44 14 L24 28 Z" fill="#E9DDC3" />
      {/* terracotta-dipped nose */}
      <path d="M24 56 L20.2 48 L27.8 48 Z" fill={palette.coral} />
      {/* outline + centre fold + a small fold on each wing */}
      <path d="M24 56 L4 14 L24 28 L44 14 Z" fill="none" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <path d="M24 28 V56" fill="none" stroke={INK} strokeWidth={2.1} strokeLinecap="round" />
      <path d="M14 21 L24 40 M34 21 L24 40" fill="none" stroke={INK} strokeWidth={1.1} strokeLinecap="round" opacity={0.5} />
    </svg>
  )
}
