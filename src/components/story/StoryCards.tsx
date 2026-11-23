/** Polaroid photo card + torn-paper note card for the story timeline. */
import type { StoryMoment } from '../../data/weddingData'
import { lightTints, palette } from '../../lib/palette'
import { PhotoFrame } from '../shared/PhotoFrame'
import { StoryArt } from './StoryArt'

const WASHI = ['bg-coral', 'bg-sky', 'bg-mint', 'bg-sunshine', 'bg-lilac'] as const

const NOTE_FILL = lightTints

function MobileDate({ date }: { date: string }) {
  return <p className="mb-1 font-hand text-xl leading-none text-ink/70 sm:hidden">{date}</p>
}

export function PolaroidCard({ m, index }: { m: StoryMoment; index: number }) {
  return (
    <article className="relative border-2 border-ink bg-white p-3 pb-5 shadow-hard">
      <span className={`washi -left-5 -top-2 -rotate-[30deg] ${WASHI[index % WASHI.length]}`} />
      <span className={`washi -right-5 -top-2 rotate-[30deg] ${WASHI[(index + 2) % WASHI.length]}`} />

      <PhotoFrame
        color={m.color}
        sticker={m.sticker}
        photo={m.photo}
        art={m.art && <StoryArt id={m.art} />}
        alt={m.artAlt ?? m.title}
        className="aspect-[4/3]"
      />

      {m.photoCaption && <p className="mt-2 text-center font-hand text-2xl leading-none">{m.photoCaption}</p>}

      <div className="mt-3 border-t-2 border-dashed border-ink/20 pt-3">
        <MobileDate date={m.date} />
        <h3 className="font-display text-xl font-bold">{m.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-ink/80">{m.caption}</p>
        {m.poem && (
          <figure className="mt-3 border-l-4 border-sunshine bg-sunshine/20 py-2 pl-3 pr-2">
            <blockquote className="font-hand text-[1.3rem] leading-snug text-ink/90">
              {m.poem.lines.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </blockquote>
            <figcaption className="mt-1 text-right font-hand text-xl text-gold-deep">- {m.poem.author}</figcaption>
          </figure>
        )}
      </div>
    </article>
  )
}

/** Deterministic jagged bottom edge */
function tornBottom(seed: number) {
  let s = seed
  const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280)
  const n = 22
  return Array.from({ length: n + 1 }, (_, i) => `${i ? 'L' : 'M'}${((i * 100) / n).toFixed(2)} ${(rand() * 9 + 1).toFixed(2)}`).join(' ')
}

export function NoteCard({ m, index }: { m: StoryMoment; index: number }) {
  const fill = NOTE_FILL[m.color]
  const edge = tornBottom(index * 17 + 3)
  return (
    // drop-shadow (not box-shadow) so the hard shadow follows the torn edge
    <article className="relative [filter:drop-shadow(4px_4px_0_#2B2D42)]">
      <div className="relative border-2 border-b-0 border-ink px-5 pb-3 pt-6" style={{ backgroundColor: fill }}>
        <span className={`washi -top-3 left-1/2 -translate-x-1/2 rotate-[-3deg] ${WASHI[(index + 1) % WASHI.length]}`} />
        <MobileDate date={m.date} />
        <div className="flex items-start gap-3">
          <span className="text-3xl leading-none">{m.sticker}</span>
          <div>
            <h3 className="font-display text-xl font-bold">{m.title}</h3>
            <p className="mt-1 font-hand text-[1.35rem] leading-snug text-ink/85">{m.caption}</p>
          </div>
        </div>
      </div>
      <svg viewBox="0 0 100 11" preserveAspectRatio="none" aria-hidden className="-mt-px block h-3 w-full">
        <path d={`M0 0 ${edge.replace(/^M/, 'L')} L100 0 Z`} fill={fill} />
        <path
          d={`M0 0 ${edge.replace(/^M/, 'L')} L100 0`}
          fill="none"
          stroke={palette.ink}
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
        />
      </svg>
    </article>
  )
}
