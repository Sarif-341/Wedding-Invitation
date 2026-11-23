/**
 * Hand-drawn scrapbook illustrations that stand in for photos on the story timeline (the couple has no photos of
 * these moments). Each one is a 4:3 SVG in the vintage palette with the same thick ink outline as the cards.
 */
import { palette } from '../../lib/palette'
import { DOODLE_SHAPES } from '../doodles/doodles'
import { PLANE_D } from './ldr/LdrArt'

export type StoryArtId = 'cafe' | 'poem' | 'carnival' | 'journey'

const INK = palette.ink
const common = { stroke: INK, strokeWidth: 3, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }
const HEART = 'M50 85 C 10 55, 0 30, 15 14 C 28 0, 46 6, 50 22 C 54 6, 72 0, 85 14 C 100 30, 90 55, 50 85 Z'

/** Aug 2016 — introduced by a mutual friend at a café near home: striped awning, warm window, two cups. */
function Cafe() {
  const stripes = Array.from({ length: 8 }, (_, i) => i)
  return (
    <g {...common}>
      <rect width="400" height="300" fill="#EBDDBE" stroke="none" />
      <rect x="0" y="252" width="400" height="48" fill="#C9A47A" stroke="none" />
      <rect x="34" y="34" width="332" height="222" fill="#F2D2C7" />
      {/* string lights */}
      <path d="M10 22 Q 100 52 200 24 T 390 22" fill="none" strokeWidth={2} />
      {[40, 100, 160, 230, 290, 350].map((x, i) => (
        <circle key={x} cx={x} cy={[40, 44, 36, 38, 46, 36][i]} r="6" fill={palette.sunshine} strokeWidth={2} />
      ))}
      {/* sign */}
      <rect x="140" y="58" width="120" height="30" rx="4" fill={INK} />
      <text x="200" y="81" textAnchor="middle" fontSize="24" fontWeight="700" fill={palette.sunshine} stroke="none" style={{ fontFamily: 'Fraunces, serif' }}>
        CAFÉ
      </text>
      {/* awning */}
      {stripes.map((i) => (
        <path
          key={i}
          d={`M${34 + i * 41.5} 98 h41.5 v18 a20.75 20.75 0 0 1 -41.5 0 Z`}
          fill={i % 2 ? palette.paper : palette.coral}
        />
      ))}
      {/* window + door */}
      <rect x="62" y="150" width="170" height="102" fill="#FFE7A8" />
      <path d="M147 150 V252 M62 200 H232" fill="none" strokeWidth={2.5} />
      <path d="M92 150 v24 M118 150 v18" fill="none" stroke={palette.coral} strokeWidth={5} />
      <rect x="262" y="146" width="80" height="106" rx="3" fill={palette.sageDeep} />
      <rect x="274" y="158" width="56" height="40" fill="#FFE7A8" strokeWidth={2.5} />
      <circle cx="274" cy="226" r="4.5" fill={palette.sunshine} strokeWidth={2} />
      {/* table, two cups, a heart of steam */}
      <rect x="86" y="236" width="130" height="10" rx="4" fill="#8A6A44" />
      <path d="M110 246 v14 M192 246 v14" fill="none" strokeWidth={4} />
      {[118, 178].map((x, i) => (
        <g key={x}>
          <ellipse cx={x} cy="234" rx="21" ry="5" fill={palette.paper} strokeWidth={2.5} />
          <path d={`M${x - 14} 212 h28 l-4 20 h-20 Z`} fill={i ? palette.sky : palette.mint} strokeWidth={2.5} />
          <path d={`M${x + 14} 218 c10 0 10 12 0 12`} fill="none" strokeWidth={2.5} />
          <path d={`M${x - 5} 204 c-6 -8 6 -10 0 -18 M${x + 5} 204 c-6 -8 6 -10 0 -18`} fill="none" strokeWidth={2} opacity={0.5} />
        </g>
      ))}
      <path d={HEART} transform="translate(137 170) scale(0.22)" fill={palette.rose} strokeWidth={9} />
    </g>
  )
}

/** ~2018 — warm greetings from far away and poems sent by message: a letter flying between two little houses. */
function Poem() {
  const house = (x: number, roof: string) => (
    <g>
      <rect x={x} y="212" width="52" height="42" fill={palette.paper} />
      <path d={`M${x - 6} 214 L${x + 26} 184 L${x + 58} 214 Z`} fill={roof} />
      <rect x={x + 19} y="228" width="14" height="26" fill={palette.sunshine} strokeWidth={2.5} />
    </g>
  )
  return (
    <g {...common}>
      <rect width="400" height="300" fill="#D6E2EE" stroke="none" />
      {/* clouds */}
      <path d="M40 70 q0 -18 20 -18 q8 -14 26 -4 q18 -2 18 16 z" fill={palette.paper} strokeWidth={2.5} />
      <path d="M290 100 q0 -16 18 -16 q8 -12 24 -3 q16 -1 16 15 z" fill={palette.paper} strokeWidth={2.5} />
      <rect x="0" y="252" width="400" height="48" fill={palette.mint} stroke="none" />
      <path d="M0 252 Q 100 236 200 252 T 400 252" fill={palette.mint} strokeWidth={3} />
      {house(32, palette.coral)}
      {house(316, palette.skyDeep)}
      {/* flight path of the letter */}
      <path d="M62 178 Q 200 4 338 178" fill="none" strokeWidth={3} strokeDasharray="2 10" />
      {/* the letter, poem peeking out */}
      <g transform="rotate(-4 200 112)">
        <rect x="166" y="60" width="68" height="62" fill={palette.paper} strokeWidth={2.5} />
        <path d="M178 76 h44 M178 88 h44 M178 100 h30" fill="none" strokeWidth={2.5} stroke={palette.terraDeep} />
        <rect x="148" y="92" width="104" height="70" fill={palette.sunshine} />
        <path d="M148 92 L200 136 L252 92" fill="none" />
        <path d="M148 162 L192 124 M252 162 L208 124" fill="none" strokeWidth={2.5} />
        <path d={HEART} transform="translate(188 110) scale(0.24)" fill={palette.coral} strokeWidth={9} />
      </g>
      {/* hearts and sparkles drifting along */}
      {[
        [90, 130, 0.2, -12],
        [118, 84, 0.15, 10],
        [292, 86, 0.17, -8],
        [318, 138, 0.22, 14],
      ].map(([x, y, s, r]) => (
        <path key={`${x}${y}`} d={HEART} transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} fill={palette.rose} strokeWidth={10} />
      ))}
      <g transform="translate(250 38) scale(1.1)" fill={palette.sunshine} strokeWidth={2.2}>
        <path d={DOODLE_SHAPES.sparkle} />
      </g>
      <g transform="translate(96 30) scale(0.9)" fill={palette.paper} strokeWidth={2.2}>
        <path d={DOODLE_SHAPES.star} />
      </g>
    </g>
  )
}

/** Jun 2019 — first outing together: a night carnival and a ride up the Ferris wheel. */
function Carnival() {
  const cabinColors = [palette.coral, palette.sky, palette.mint, palette.rose, palette.lilac, palette.sunshine]
  const cx = 200
  const cy = 142
  const R = 92
  const at = (deg: number, r = R) => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)] as const
  const spokes = Array.from({ length: 12 }, (_, i) => i * 30)
  return (
    <g {...common}>
      <rect width="400" height="300" fill="#25294A" stroke="none" />
      {[[30, 30], [80, 70], [130, 24], [300, 36], [350, 80], [372, 28], [262, 70], [52, 120], [352, 140]].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r="2.2" fill={palette.paper} stroke="none" />
      ))}
      <circle cx="338" cy="52" r="20" fill={palette.sunshine} strokeWidth={2.5} />
      <circle cx="347" cy="46" r="18" fill="#25294A" stroke="none" />
      {/* ground, tents with bunting */}
      <rect x="0" y="262" width="400" height="38" fill="#171A33" stroke="none" />
      <path d="M-10 262 L40 210 L90 262 Z M310 262 L360 212 L410 262 Z" fill="#3A3F6B" strokeWidth={2.5} />
      <path d="M0 218 Q 50 238 100 218 T 200 218" fill="none" strokeWidth={0} />
      {/* support legs */}
      <path d={`M${cx} ${cy} L146 262 M${cx} ${cy} L254 262`} fill="none" stroke="#8D93BD" strokeWidth={6} />
      <path d="M128 262 h144" stroke="#8D93BD" strokeWidth={8} />
      {/* wheel */}
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={palette.sunshine} strokeWidth={4} />
      <circle cx={cx} cy={cy} r={R * 0.62} fill="none" stroke={palette.sunshine} strokeWidth={2.5} opacity={0.8} />
      {spokes.map((d) => {
        const [x, y] = at(d)
        return <path key={d} d={`M${cx} ${cy} L${x} ${y}`} stroke={palette.sunshine} strokeWidth={2.5} fill="none" />
      })}
      {Array.from({ length: 24 }, (_, i) => {
        const [x, y] = at(i * 15 + 7.5, R + 8)
        return <circle key={i} cx={x} cy={y} r="3.2" fill={palette.paper} stroke="none" />
      })}
      {spokes.map((d, i) => {
        const [x, y] = at(d)
        const hero = d === 330
        return (
          <g key={d}>
            <path d={`M${x} ${y} v6`} stroke={palette.sunshine} strokeWidth={2.5} />
            <rect x={x - 11} y={y + 5} width="22" height="17" rx="5" fill={cabinColors[i % 6]} strokeWidth={2.5} />
            {hero && <path d={HEART} transform={`translate(${x - 6} ${y + 8}) scale(0.12)`} fill={palette.paper} strokeWidth={0} />}
          </g>
        )
      })}
      <circle cx={cx} cy={cy} r="11" fill={palette.coral} strokeWidth={3} />
      {/* ground lights */}
      {[20, 70, 120, 280, 330, 380].map((x) => (
        <circle key={x} cx={x} cy="282" r="4" fill={palette.sunshine} stroke="none" />
      ))}
    </g>
  )
}

/** 2022 → 2 May 2025 — flight to Germany, a pause that nearly became goodbye, and a heart sewn back together. */
function Journey() {
  return (
    <g {...common}>
      <rect width="400" height="300" fill="#E4EBF2" stroke="none" />
      <rect y="156" width="400" height="144" fill="#F3E5B8" stroke="none" />
      {/* flight path ID → DE */}
      <path d="M58 120 Q 200 -10 342 112" fill="none" strokeWidth={3} strokeDasharray="2 10" />
      <g transform="translate(200 46) rotate(-4) scale(1.5)">
        <path d={PLANE_D} fill={palette.paper} strokeWidth={2} />
      </g>
      {[['ID', 44, palette.coral], ['DE', 356, palette.sky]].map(([t, x, c]) => (
        <g key={String(t)}>
          <circle cx={Number(x)} cy="132" r="22" fill={String(c)} strokeWidth={3} />
          <text x={Number(x)} y="139" textAnchor="middle" fontSize="19" fontWeight="700" fill={INK} stroke="none" style={{ fontFamily: 'Fraunces, serif' }}>
            {String(t)}
          </text>
        </g>
      ))}
      <path d="M72 28 q0 -12 14 -12 q6 -10 18 -3 q12 0 12 11 z" fill={palette.paper} strokeWidth={2.5} />
      <path d="M296 22 q0 -12 14 -12 q6 -10 18 -3 q12 0 12 11 z" fill={palette.paper} strokeWidth={2.5} />
      {/* a heart that broke and was sewn back together */}
      <defs>
        <clipPath id="story-heart-l"><path d="M-10 -10 H52 L44 20 L56 36 L46 54 L54 70 L48 100 H-10 Z" /></clipPath>
        <clipPath id="story-heart-r"><path d="M110 -10 H52 L44 20 L56 36 L46 54 L54 70 L48 100 H110 Z" /></clipPath>
      </defs>
      <g transform="translate(118 150) scale(1.52)">
        <g transform="translate(-4 0) rotate(-5 30 60)">
          <g clipPath="url(#story-heart-l)"><path d={HEART} fill={palette.coral} strokeWidth={2.4} /></g>
          <path d="M52 0 L44 20 L56 36 L46 54 L54 70 L48 90" fill="none" strokeWidth={2.4} />
        </g>
        <g transform="translate(4 0) rotate(5 70 60)">
          <g clipPath="url(#story-heart-r)"><path d={HEART} fill={palette.coral} strokeWidth={2.4} /></g>
          <path d="M52 0 L44 20 L56 36 L46 54 L54 70 L48 90" fill="none" strokeWidth={2.4} />
        </g>
        <path d="M40 18 h20 M38 38 h24 M40 56 h22 M44 74 h14" stroke={palette.sunshine} strokeWidth={3.4} fill="none" strokeDasharray="4 3" />
      </g>
      {/* date tag */}
      <g transform="translate(292 188) rotate(9)">
        <path d="M0 10 L10 0 H92 V40 H10 Z" fill={palette.paper} strokeWidth={2.5} />
        <circle cx="14" cy="21" r="3" fill={palette.sunshine} strokeWidth={2} />
        <text x="58" y="27" textAnchor="middle" fontSize="20" fontWeight="700" fill={palette.terraDeep} stroke="none" style={{ fontFamily: 'Caveat, cursive' }}>
          2 Mei 2025
        </text>
      </g>
    </g>
  )
}

const ART: Record<StoryArtId, () => React.JSX.Element> = { cafe: Cafe, poem: Poem, carnival: Carnival, journey: Journey }

export function StoryArt({ id }: { id: StoryArtId }) {
  const Art = ART[id]
  return (
    <svg viewBox="0 0 400 300" aria-hidden preserveAspectRatio="xMidYMid slice" className="block size-full">
      <Art />
    </svg>
  )
}
