/**
 * Section #2 — Hero scrapbook canvas
 *  - GSAP: card drop-in + bouncy kinetic letters + periodic idle "wave".
 *  - Framer Motion: per-letter spring wiggle on hover/tap (inner span, never the GSAP span).
 *  - Anime.js: hand-drawn doodles (underline, arrow, heart, sparkles) draw themselves.
 */
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { animate, createDrawable, stagger } from 'animejs'
import { motion } from 'framer-motion'
import { CalendarHeart, MapPin } from 'lucide-react'
import { couple, events, hero, invitation, weddingDate, weddingVenue } from '../../data/weddingData'
import { DOODLE_SHAPES } from '../doodles/doodles'
import { formatDate, formatRange, formatVenueShort } from '../../lib/format'
import { getGuestName } from '../../lib/guest'
import { palette, prefersReducedMotion } from '../../lib/palette'
import { NextPageButton } from '../layout/NextPageButton'

function BouncyWord({ word, className }: { word: string; className: string }) {
  return (
    <span className={`inline-block whitespace-nowrap ${className}`}>
      {[...word].map((ch, i) => (
        <span key={i} className="hero-letter inline-block will-change-transform">
          <motion.span
            className="inline-block cursor-default"
            whileHover={{ y: -12, rotate: i % 2 ? 10 : -10, scale: 1.12 }}
            whileTap={{ y: -12, rotate: i % 2 ? 10 : -10, scale: 1.12 }}
            transition={{ type: 'spring', stiffness: 500, damping: 9 }}
          >
            {ch}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

export function HeroSection() {
  const scope = useRef<HTMLElement>(null)
  const doodles = useRef<HTMLDivElement>(null)
  const guestName = getGuestName()
  const fullDate = formatDate(weddingDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  // --- GSAP: entrance + kinetic typography ---
  useGSAP(
    () => {
      const reduce = prefersReducedMotion()
      const tl = gsap.timeline()
      tl.from('.hero-card', { y: 80, rotate: -10, opacity: 0, duration: 0.9, ease: 'back.out(1.6)' })
        .from('.hero-eyebrow', { y: 16, opacity: 0, duration: 0.4 }, '-=0.4')
        .from(
          '.hero-letter',
          {
            y: -90,
            opacity: 0,
            rotate: () => gsap.utils.random(-14, 14),
            duration: 0.9,
            ease: 'bounce.out',
            stagger: 0.045,
          },
          '-=0.2',
        )
        .from('.hero-amp', { scale: 0, rotate: -200, duration: 0.7, ease: 'back.out(2.5)' }, '-=0.7')
        .from('.hero-detail', { y: 20, opacity: 0, stagger: 0.1, duration: 0.5, ease: 'back.out(1.7)' }, '-=0.3')

      if (!reduce) {
        // Idle "wave" through the letters every few seconds
        gsap.to('.hero-letter', {
          y: -8,
          duration: 0.22,
          ease: 'power1.out',
          yoyo: true,
          repeat: 1,
          stagger: 0.05,
          repeatDelay: 0,
          delay: tl.duration() + 1.5,
          onComplete() {
            this.restart(true)
          },
        })
        // Must wait for the intro (which starts from scale 0): a GSAP `to` records its start values
        // when it first runs, so starting it at t=0 would lock in scale 0 and shrink the "&" to nothing.
        gsap.to('.hero-amp', {
          rotate: 6,
          scale: 1.06,
          duration: 1.6,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: tl.duration() + 0.2,
        })
      }
    },
    { scope },
  )

  // --- Anime.js: self-drawing doodles ---
  useEffect(() => {
    const root = doodles.current
    const section = scope.current
    if (!root || !section) return
    const reduce = prefersReducedMotion()
    // Underline first (right after the names land), then the surrounding doodles
    const underline = animate(createDrawable(section.querySelectorAll('.draw-underline')), {
      draw: ['0 0', '0 1'],
      duration: 800,
      ease: 'outQuad',
      delay: 1400,
    })
    const draw = animate(createDrawable(root.querySelectorAll('.draw')), {
      draw: ['0 0', '0 1'],
      duration: 900,
      ease: 'inOutQuad',
      delay: stagger(220, { start: 1900 }),
    })
    const note = animate(root.querySelectorAll('.doodle-note'), {
      opacity: [0, 1],
      translateY: [8, 0],
      duration: 500,
      delay: 2500,
      ease: 'outBack',
    })
    const twinkle = reduce
      ? null
      : animate(root.querySelectorAll('.twinkle'), {
          scale: [0.75, 1.15],
          rotate: [-12, 12],
          duration: 900,
          ease: 'inOutSine',
          delay: stagger(300, { start: 2600 }),
          loop: true,
          alternate: true,
        })
    return () => {
      underline.revert()
      draw.revert()
      note.revert()
      twinkle?.revert()
    }
  }, [])

  return (
    <section
      id="hero"
      ref={scope}
      aria-labelledby="hero-title"
      className="relative flex min-h-[92dvh] flex-col items-center justify-center px-6 pb-16 pt-24 sm:px-6"
    >
      <div className="relative w-full max-w-xl">
        {/* Doodles layer (outside the tilted card so positions stay predictable) */}
        <div ref={doodles} aria-hidden className="pointer-events-none absolute inset-0 z-20">
          {/* curved arrow + note */}
          <div className="absolute -top-16 right-0 w-28 sm:-right-16 sm:-top-14 sm:w-36">
            <p className="doodle-note absolute -top-3 right-0 rotate-[8deg] font-hand text-xl text-coral opacity-0 sm:-right-4 sm:text-2xl">
              {hero.arrowNote}
            </p>
            <svg viewBox="0 0 120 100" className="mt-5 w-full" fill="none" stroke={palette.coral} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <path className="draw" d="M104 12 C 78 2, 44 14, 34 46 C 30 60, 32 74, 38 88" />
              <path className="draw" d="M26 78 L38 90 L48 76" />
            </svg>
          </div>

          {/* heart, bottom-left */}
          <svg viewBox="0 0 24 24" className="absolute -bottom-6 -left-1 size-12 rotate-[-14deg] sm:-left-10 sm:size-14" fill="none" stroke={palette.rose} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path className="draw" d={DOODLE_SHAPES.heart} />
          </svg>

          {/* sparkles */}
          <span className="twinkle absolute -left-2 -top-10 block sm:-left-12">
            <svg viewBox="0 0 24 24" className="size-10" fill="none" stroke={palette.sunshine} strokeWidth={2.2} strokeLinejoin="round">
              <path className="draw" d={DOODLE_SHAPES.sparkle} />
            </svg>
          </span>
          <span className="twinkle absolute -right-1 bottom-10 block sm:-right-12">
            <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke={palette.sky} strokeWidth={2.2} strokeLinejoin="round">
              <path className="draw" d={DOODLE_SHAPES.star} />
            </svg>
          </span>
          <span className="twinkle absolute -bottom-10 right-1/3 block">
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke={palette.mint} strokeWidth={2.4} strokeLinejoin="round">
              <path className="draw" d={DOODLE_SHAPES.sparkle} />
            </svg>
          </span>
        </div>

        {/* Scrapbook card */}
        <div className="hero-card paper-card relative rotate-[-1deg] px-6 pb-12 pt-14 text-center sm:px-14">
          <div className="paper-grain pointer-events-none absolute inset-0 rounded-md opacity-[0.07]" />
          {/* archival framing: a hairline gold foil rule + a dotted keyline, like a printed certificate */}
          <div aria-hidden className="pointer-events-none absolute inset-2.5 rounded-sm border border-gold-deep/55" />
          <div aria-hidden className="pointer-events-none absolute inset-[18px] rounded-[2px] border border-dotted border-ink/20" />
          {/* washi tape on all four corners */}
          <span className="washi -left-7 top-3 -rotate-45 bg-rose" />
          <span className="washi -right-7 top-3 rotate-45 bg-mint" />
          <span className="washi -left-7 bottom-3 rotate-45 bg-sky" />
          <span className="washi -right-7 bottom-3 -rotate-45 bg-sunshine" />

          <p className="hero-eyebrow font-hand text-2xl text-sage-deep sm:text-3xl">{hero.eyebrow}</p>

          <h1
            id="hero-title"
            aria-label={couple.displayName}
            className="relative mt-1 font-display text-[clamp(3.2rem,15vw,6.25rem)] font-semibold leading-[0.95] tracking-tight"
          >
            <BouncyWord
              word={couple.groom.nickname}
              className="text-sage-deep [text-shadow:2px_3px_0_rgb(168_128_47/0.3)]"
            />
            <span className="hero-amp -mt-2 mb-1 block font-serif-display text-[0.95em] font-medium italic text-gold-deep">
              &amp;
            </span>
            <BouncyWord
              word={couple.bride.nickname}
              className="text-terra-deep [text-shadow:2px_3px_0_rgb(168_128_47/0.3)]"
            />
          </h1>

          {/* soft-gold wavy underline (Anime.js draws it — lives inside the card so it tilts with the names) */}
          <svg viewBox="0 0 300 24" aria-hidden className="mx-auto -mt-1 h-6 w-[72%]" fill="none" stroke={palette.sunshine} strokeWidth={3.5} strokeLinecap="round">
            <path
              className="draw-underline"
              d="M6 14 C 32 4, 52 22, 80 12 S 130 4, 154 13 S 206 22, 230 11 S 278 6, 294 14"
            />
          </svg>

          {/* Date ticket */}
          <div className="hero-detail mx-auto mt-7 inline-flex rotate-[1deg] flex-col items-center rounded-sm border-2 border-dashed border-ink/70 bg-sunshine/25 px-6 py-3 shadow-hard-sm">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-gold-deep">
              <CalendarHeart className="size-4" /> {hero.dateLabel}
            </span>
            <span className="font-display text-xl font-semibold capitalize sm:text-2xl">{fullDate}</span>
            <span className="mt-0.5 text-xs font-semibold text-ink/75">
              {events.map((e) => `${e.title} ${formatRange(e)}`).join(' · ')} WIB
            </span>
          </div>

          <p className="hero-detail mx-auto mt-4 max-w-xs text-balance text-center text-xs font-semibold leading-relaxed text-ink/70 sm:max-w-sm">
            <MapPin aria-hidden className="mr-1.5 inline-block size-3.5 -translate-y-px align-middle text-coral" />
            {formatVenueShort(weddingVenue)}
          </p>

          <p className="hero-detail mt-6 text-sm">
            Halo, <span className="font-hand text-xl text-sage-deep">{guestName}</span>!{' '}
            <span className="text-ink/70">{invitation.welcomeTitle}</span>
          </p>
        </div>
      </div>

      <div className="hero-detail">
        <NextPageButton from="hero" label={hero.nextLabel} />
      </div>
    </section>
  )
}
