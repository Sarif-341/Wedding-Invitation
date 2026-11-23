/**
 * Section #5 — Event details (ONE boarding pass for Akad + Resepsi) & live countdown
 *  - GSAP ScrollTrigger: the boarding pass drops in and its stamp "thunks" on, countdown cards pop.
 *  - Anime.js: doodles around the countdown (DoodleLayer).
 */
import { useRef } from 'react'
import { eventsSection } from '../../data/weddingData'
import { gsap, useGSAP } from '../../lib/gsap'
import { palette } from '../../lib/palette'
import { DoodleLayer } from '../doodles/DoodleLayer'
import type { Doodle } from '../doodles/doodles'
import { ChapterHeader } from '../layout/ChapterHeader'
import { NextPageButton } from '../layout/NextPageButton'
import { ScrapbookPage } from '../layout/ScrapbookPage'
import { BoardingPassTicket } from './BoardingPassTicket'
import { Countdown } from './Countdown'
import { EventActions } from './EventActions'

const COUNTDOWN_DOODLES: Doodle[] = [
  { shape: 'heart', color: palette.coral, left: '2%', top: '8%', size: 28, rotate: -14 },
  { shape: 'sparkle', color: palette.sunshine, left: '97%', top: '4%', size: 26 },
  { shape: 'star', color: palette.lilac, left: '99%', top: '88%', size: 24, rotate: 12 },
  { shape: 'squiggle', color: palette.sky, left: '3%', top: '96%', size: 40 },
]

export function EventsSection() {
  const scope = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline({ scrollTrigger: { trigger: '.boarding-ticket', start: 'top 85%', toggleActions: 'play none none reverse' } })
          .from('.boarding-pass', { y: 90, rotate: 5, opacity: 0, duration: 1, ease: 'back.out(1.5)' })
          .from('.boarding-stamp', { scale: 2.6, rotate: -30, opacity: 0, duration: 0.45, ease: 'back.out(2.4)' }, '-=0.15')
        gsap.from('.event-actions', {
          y: 70,
          rotate: 4,
          opacity: 0,
          duration: 0.9,
          ease: 'back.out(1.6)',
          scrollTrigger: { trigger: '.event-actions', start: 'top 88%', toggleActions: 'play none none reverse' },
        })
        gsap.from('.count-card', {
          scale: 0,
          rotate: () => gsap.utils.random(-30, 30),
          duration: 0.9,
          ease: 'elastic.out(1, 0.55)',
          stagger: 0.1,
          scrollTrigger: { trigger: '.countdown', start: 'top 85%', toggleActions: 'play none none reverse' },
        })
      })
    },
    { scope },
  )

  return (
    <ScrapbookPage id="events" tint="sun" pageNumber={4}>
      <div ref={scope} className="mx-auto max-w-5xl pl-4 pr-10 sm:px-8">
        <ChapterHeader
          chapter={eventsSection.chapter}
          title={eventsSection.title}
          subtitle={eventsSection.subtitle}
          color="sunshine"
          underline="mint"
        />

        {/* the trigger element stays still; the pass inside it is what GSAP animates */}
        <div className="boarding-ticket">
          <BoardingPassTicket />
        </div>

        <EventActions />

        <div className="relative mt-16 px-0 py-6 sm:mt-20 sm:px-2">
          <DoodleLayer doodles={COUNTDOWN_DOODLES} className="-inset-x-2 sm:-inset-x-8" />
          <Countdown />
        </div>

        <NextPageButton from="events" />
      </div>
    </ScrapbookPage>
  )
}
