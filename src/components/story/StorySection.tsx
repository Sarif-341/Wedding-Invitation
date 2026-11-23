/**
 * Section #3 — Interactive Scrapbook Story Timeline
 *  - GSAP ScrollTrigger: cards bounce up with a natural tilt as they enter, sticker dots pop,
 *    and the timeline "thread" draws itself as you scroll (scrub) with a paper plane at its head.
 *    The thread and the plane live in ONE scrubbed timeline, so the plane can never drift from the line.
 *  - Chapter header (shared component) handles its own reveal + Anime.js underline.
 */
import { useRef } from 'react'
import { story, storySection } from '../../data/weddingData'
import { gsap, useGSAP } from '../../lib/gsap'
import { ChapterHeader } from '../layout/ChapterHeader'
import { NextPageButton } from '../layout/NextPageButton'
import { ScrapbookPage } from '../layout/ScrapbookPage'
import { LdrJourney } from './ldr/LdrJourney'
import { PaperPlane } from './PaperPlane'
import { NoteCard, PolaroidCard } from './StoryCards'

// Static class strings so Tailwind can see them
const TILTS = ['rotate-[-2.5deg]', 'rotate-[2deg]', 'rotate-[-1.5deg]', 'rotate-[3deg]', 'rotate-[-2deg]']

/**
 * Dashed-line pattern shared by the faint base line and the drawn coral line, so the dashes line up exactly.
 * Written out in full (not built from a variable) because Tailwind only generates classes it can read as literals.
 */
const DASH_FAINT = 'bg-[repeating-linear-gradient(to_bottom,rgb(43_45_66/0.22)_0_9px,transparent_9px_17px)]'
const DASH_CORAL = 'bg-[repeating-linear-gradient(to_bottom,var(--color-coral)_0_9px,transparent_9px_17px)]'

/** The plane glides rather than falls: it sways side to side and banks into each turn. */
const SWAYS = 6
const SWAY_PX = 7
const SWAY_PX_PHONE = 4 // the thread sits close to the cards on phones, so sway less there
const BANK_DEG = 14

export function StorySection() {
  const scope = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Thread + paper plane: one scrubbed timeline, so the plane is always exactly at the line's head
        const glide = (progress: number) => {
          const phase = progress * Math.PI * 2 * SWAYS
          // nose points down; moving right (cos > 0) → bank counter-clockwise, like a real glide
          const sway = window.innerWidth >= 640 ? SWAY_PX : SWAY_PX_PHONE
          gsap.set('.story-plane-art', { x: Math.sin(phase) * sway, rotate: -Math.cos(phase) * BANK_DEG })
        }
        glide(0)
        const thread = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: '.story-list', start: 'top 65%', end: 'bottom 65%', scrub: 0.6 },
          onUpdate: () => glide(thread.progress()),
        })
        thread
          .fromTo('.story-progress', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }, 0)
          .fromTo('.story-plane', { top: '0%' }, { top: '100%' }, 0)

        gsap.utils.toArray<HTMLElement>('.story-item').forEach((item) => {
          const fromLeft = item.dataset.side === 'left'
          const card = item.querySelector('.story-card')
          gsap
            .timeline({
              scrollTrigger: { trigger: item, start: 'top 85%', toggleActions: 'play none none reverse' },
            })
            .from(item.querySelector('.story-dot'), { scale: 0, rotate: -200, duration: 0.6, ease: 'back.out(3)' })
            .from(card, { opacity: 0, duration: 0.25, ease: 'power1.out' }, '<0.05')
            .from(
              card,
              {
                y: 140,
                x: fromLeft ? -50 : 50,
                rotate: fromLeft ? -16 : 16,
                duration: 1.2,
                ease: 'elastic.out(1, 0.6)',
              },
              '<',
            )
            .from(item.querySelector('.story-date'), { x: fromLeft ? 40 : -40, opacity: 0, duration: 0.6, ease: 'back.out(2)' }, '<0.25')
        })

        gsap.from('.story-ending', {
          scale: 0.6,
          rotate: -8,
          opacity: 0,
          duration: 0.9,
          ease: 'elastic.out(1, 0.55)',
          scrollTrigger: { trigger: '.story-ending', start: 'top 90%', toggleActions: 'play none none reverse' },
        })
      })
    },
    { scope },
  )

  return (
    <ScrapbookPage id="story" tint="warm" pageNumber={2} kraft>
      <div ref={scope} className="relative mx-auto max-w-4xl pl-4 pr-10 sm:px-8">
        <ChapterHeader
          chapter={storySection.chapter}
          title={storySection.title}
          subtitle={storySection.subtitle}
          color="sky"
        />

        {/* Long-distance chapter: Germany ↔ Indonesia, before the timeline begins */}
        <LdrJourney />

        {/* Timeline */}
        <div className="relative">
          {/* thread */}
          <div aria-hidden className="absolute bottom-0 left-6 top-0 w-1 -translate-x-1/2 sm:left-1/2">
            <div className={`absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 ${DASH_FAINT}`} />
            <div className={`story-progress absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 ${DASH_CORAL}`} />
            {/* paper plane at the head of the drawn line (hidden when the guest prefers reduced motion) */}
            <div className="story-plane absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/2 motion-reduce:hidden">
              <PaperPlane className="story-plane-art h-9 sm:h-14" />
            </div>
          </div>

          <ol className="story-list relative space-y-14 sm:space-y-20">
            {story.map((m, i) => {
              const side = i % 2 === 0 ? 'left' : 'right'
              return (
                <li key={m.id} data-side={side} className="story-item relative pl-14 sm:grid sm:grid-cols-2 sm:gap-24 sm:pl-0">
                  {/* sticker dot on the thread */}
                  <span
                    aria-hidden
                    className={`story-dot absolute left-6 top-4 z-10 grid size-12 -translate-x-1/2 place-items-center rounded-full border-2 border-ink text-xl shadow-hard-sm sm:left-1/2 sm:size-14 sm:text-2xl bg-${m.color}`}
                  >
                    {m.sticker}
                  </span>

                  {/* card */}
                  <div className={side === 'left' ? 'sm:col-start-1' : 'sm:col-start-2'}>
                    <div className={`story-card mx-auto max-w-sm ${TILTS[i % TILTS.length]}`}>
                      {m.style === 'polaroid' ? <PolaroidCard m={m} index={i} /> : <NoteCard m={m} index={i} />}
                    </div>
                  </div>

                  {/* big handwritten date on the opposite side (desktop) */}
                  <div
                    className={`story-date hidden pt-5 sm:row-start-1 sm:flex ${
                      side === 'left' ? 'sm:col-start-2 sm:justify-start' : 'sm:col-start-1 sm:justify-end'
                    }`}
                  >
                    <p className={`font-hand text-4xl leading-none ${side === 'left' ? 'rotate-[-4deg]' : 'rotate-[4deg]'}`}>
                      {m.date}
                      <span className={`mt-1 block h-1.5 w-2/3 rounded-full bg-${m.color} ${side === 'left' ? '' : 'ml-auto'}`} />
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>

        <p className="story-ending mx-auto mt-16 max-w-md rotate-[-2deg] rounded-lg border-2 border-ink bg-paper px-5 py-3 text-center font-hand text-2xl shadow-hard">
          {storySection.ending}
        </p>

        <NextPageButton from="story" />
      </div>
    </ScrapbookPage>
  )
}
