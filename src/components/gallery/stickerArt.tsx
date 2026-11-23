/** Die-cut SVG sticker artwork (48×48). Pair with the `.sticker-die` class for the white outline + hard shadow. */
import type { ReactElement } from 'react'
import type { StickerId } from '../../data/weddingData'
import { palette } from '../../lib/palette'

const ink = { stroke: palette.ink, strokeWidth: 2.4, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }

const Face = ({ y = 22 }: { y?: number }) => (
  <g fill={palette.ink}>
    <circle cx="19.5" cy={y} r="1.8" />
    <circle cx="28.5" cy={y} r="1.8" />
    <path d={`M21 ${y + 4} q3 3 6 0`} fill="none" {...ink} strokeWidth={1.8} />
  </g>
)

const STICKER_ART: Record<StickerId, ReactElement> = {
  heart: (
    <>
      <path
        d="M24 42 C 11 32, 5 24, 5 16 C 5 10, 9.7 6, 15 6 C 19 6, 22.2 8.5, 24 12 C 25.8 8.5, 29 6, 33 6 C 38.3 6, 43 10, 43 16 C 43 24, 37 32, 24 42 Z"
        fill={palette.coral}
        {...ink}
      />
      <ellipse cx="13.5" cy="14" rx="3" ry="2" fill="#fff" opacity="0.7" transform="rotate(-30 13.5 14)" />
      <Face y={20} />
    </>
  ),
  ring: (
    <>
      <circle cx="24" cy="30" r="12" fill="none" stroke={palette.ink} strokeWidth={8} />
      <circle cx="24" cy="30" r="12" fill="none" stroke={palette.sunshine} strokeWidth={4} />
      <path d="M15 13 L19.5 6 H28.5 L33 13 L24 23 Z" fill={palette.sky} {...ink} />
      <path d="M15 13 H33 M19.5 6 L21.5 13 L24 23 M28.5 6 L26.5 13 L24 23" fill="none" {...ink} strokeWidth={1.3} />
      <path d="M36 5 l1.5 3 3 1.5 -3 1.5 -1.5 3 -1.5 -3 -3 -1.5 3 -1.5 Z" fill="#fff" {...ink} strokeWidth={1.2} />
    </>
  ),
  bow: (
    <>
      <path d="M22 26 L15 43 L19.5 41 L22.5 45 L25 27 Z" fill={palette.lilac} {...ink} />
      <path d="M26 26 L33 43 L28.5 41 L25.5 45 L23 27 Z" fill={palette.lilac} {...ink} />
      <path d="M24 22 C 15 9, 4 11, 5 21 C 6 31, 16 30, 24 25 Z" fill={palette.lilac} {...ink} />
      <path d="M24 22 C 33 9, 44 11, 43 21 C 42 31, 32 30, 24 25 Z" fill={palette.lilac} {...ink} />
      <path d="M11 18 q4 -2 7 3 M37 18 q-4 -2 -7 3" fill="none" stroke="#fff" strokeWidth={1.6} strokeLinecap="round" opacity="0.8" />
      <rect x="19.5" y="18.5" width="9" height="9" rx="3" fill={palette.coral} {...ink} />
    </>
  ),
  flower: (
    <>
      <path d="M24 30 C 24 36, 22 40, 18 44" fill="none" {...ink} />
      <path d="M21 39 C 15 38, 12 34, 12 31 C 17 31, 20 34, 21 39 Z" fill={palette.mint} {...ink} strokeWidth={1.8} />
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="24" cy="10.5" rx="6.5" ry="8" fill="#E8B4A5" {...ink} transform={`rotate(${a} 24 21)`} />
      ))}
      <circle cx="24" cy="21" r="6.5" fill={palette.sunshine} {...ink} />
      <circle cx="22" cy="19" r="1.6" fill="#fff" opacity="0.8" />
    </>
  ),
  star: (
    <>
      <path
        d="M24 3.5 L29.8 16 L43.5 17.4 L33.2 26.6 L36.2 40 L24 33 L11.8 40 L14.8 26.6 L4.5 17.4 L18.2 16 Z"
        fill={palette.sunshine}
        {...ink}
      />
      <Face y={23} />
      <circle cx="16.5" cy="27.5" r="1.8" fill={palette.coral} opacity="0.6" />
      <circle cx="31.5" cy="27.5" r="1.8" fill={palette.coral} opacity="0.6" />
    </>
  ),
  letter: (
    <>
      <rect x="5" y="11" width="38" height="27" rx="3" fill={palette.paper} {...ink} />
      <path d="M5.5 13 L24 27 L42.5 13" fill="none" {...ink} />
      <path d="M5.5 37 L18 24 M42.5 37 L30 24" fill="none" {...ink} strokeWidth={1.4} />
      <path
        d="M24 31 C 20.5 28.2, 18.5 26.4, 18.5 24.3 C 18.5 22.8, 19.7 21.7, 21.1 21.7 C 22.3 21.7, 23.3 22.4, 24 23.5 C 24.7 22.4, 25.7 21.7, 26.9 21.7 C 28.3 21.7, 29.5 22.8, 29.5 24.3 C 29.5 26.4, 27.5 28.2, 24 31 Z"
        fill={palette.coral}
        {...ink}
        strokeWidth={1.6}
      />
    </>
  ),
}

export function StickerArt({ id, className = '' }: { id: StickerId; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={`sticker-die block overflow-visible ${className}`} aria-hidden>
      {STICKER_ART[id]}
    </svg>
  )
}
