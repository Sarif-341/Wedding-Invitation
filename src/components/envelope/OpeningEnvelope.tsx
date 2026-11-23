/**
 * Section #1 — Interactive Opening Envelope
 *
 * Motion responsibilities (see CLAUDE.md):
 *  - Framer Motion: tactile input only — draggable ribbon pull-tab, spring hover/tap on the seal.
 *  - GSAP: the intro + the full tear/open choreography (seal pops, ribbon tears, flap flips,
 *    letter slides out, scene exits). GSAP only animates wrapper elements, never the
 *    Framer-controlled nodes, so the two libraries never fight over the same transform.
 *  - Anime.js: self-drawing doodles (DoodleLayer).
 *  - canvas-confetti: burst when the flap opens.
 */
import { useCallback, useMemo, useRef, useState, type CSSProperties } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { ChevronsRight, Heart } from 'lucide-react'
import { couple, invitation, weddingDate } from '../../data/weddingData'
import { getGuestName } from '../../lib/guest'
import { celebrate } from '../../lib/confetti'
import { palette } from '../../lib/palette'
import { DoodleLayer } from '../doodles/DoodleLayer'
import { EnvelopeSeal } from './EnvelopeSeal'
import { DovePair, GoldRings, OliveWreath } from './WeddingOrnaments'

gsap.registerPlugin(useGSAP)

/** How far (px) the ribbon tab can be pulled, and how far counts as "torn". */
const PULL_MAX = 100
const PULL_THRESHOLD = 55

/** Flap tip & ribbon line, as % of envelope height. */
const FLAP_DEPTH = 58

interface Props {
  /** Fired synchronously inside the user's tap/drag gesture (e.g. to start audio). */
  onOpenStart?: () => void
  /** Fired once the exit animation finishes. */
  onOpened: () => void
}

/** Longer names get a smaller hand so they wrap onto two tidy lines instead of being cut off. */
const nameSize = (name: string) =>
  name.length <= 14 ? 'text-xl sm:text-2xl' : name.length <= 26 ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'

export function OpeningEnvelope({ onOpenStart, onOpened }: Props) {
  const scope = useRef<HTMLElement>(null)
  const opening = useRef(false)
  const [guestName] = useState(getGuestName)
  const dateLabel = useMemo(
    () =>
      new Date(weddingDate).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Jakarta',
      }),
    [],
  )

  // Framer Motion values for the pull-tab
  const pullX = useMotionValue(0)
  const ribbonStretch = useTransform(pullX, (v) => `calc(100% + ${Math.max(0, v)}px)`)
  const sealTilt = useTransform(pullX, [0, PULL_MAX], [0, -28])

  // --- GSAP intro ---
  const { context } = useGSAP(
    () => {
      gsap
        .timeline({ defaults: { ease: 'back.out(1.7)' } })
        .from('.env-header > *', { y: 24, opacity: 0, stagger: 0.1, duration: 0.6 })
        .from('.env-body', { y: 60, rotate: -8, opacity: 0, duration: 0.9 }, '-=0.3')
        .from('.env-label', { y: 16, rotate: 8, opacity: 0, duration: 0.5 }, '-=0.35')
        .from('.env-seal', { scale: 0, rotate: -180, duration: 0.6 }, '-=0.3')
        .from('.env-hint', { y: 10, opacity: 0, duration: 0.4 }, '-=0.2')
    },
    { scope },
  )

  // --- GSAP open sequence ---
  // `context.add` runs the sequence inside the same scoped GSAP context as the intro
  // (selectors stay scoped to this section; everything is reverted on unmount).
  const open = useCallback(() => {
    if (opening.current) return
    opening.current = true
    onOpenStart?.()
    context.add(() => {
      // Stop any still-running intro tweens so they don't fight the exit
      gsap.killTweensOf('.env-header > *, .env-body, .env-label, .env-seal, .env-hint')

      gsap
        .timeline({ defaults: { ease: 'power2.out' }, onComplete: onOpened })
        .to('.env-hint, .env-header', { opacity: 0, y: -12, duration: 0.3 })
        // 1. Seal pops off like a peeled sticker
        .to('.env-seal', { scale: 1.2, duration: 0.15, ease: 'power1.out' }, 0)
        .to('.env-seal', { x: 70, y: -110, rotate: 220, scale: 0, opacity: 0, duration: 0.6, ease: 'back.in(1.3)' })
        // 2. Ribbon tears in two
        .to('.env-ribbon-l', { xPercent: -140, yPercent: 60, rotate: -18, opacity: 0, duration: 0.6, ease: 'power3.in' }, '<')
        .to('.env-ribbon-r', { xPercent: 140, yPercent: -40, rotate: 16, opacity: 0, duration: 0.6, ease: 'power3.in' }, '<')
        // 3. Flap flips open (drops behind the letter halfway through)
        .to('.env-flap-orn', { opacity: 0, scale: 0.8, duration: 0.25, ease: 'power1.in' }, '-=0.15')
        .to('.env-flap', { rotationX: 180, duration: 0.75, ease: 'power2.inOut' }, '<')
        .set('.env-flap', { zIndex: 5 }, '<0.38')
        .add(celebrate, '<')
        .to('.env-label', { y: 24, opacity: 0, duration: 0.3 }, '<')
        // 4. Letter slides out
        .to('.env-letter', { yPercent: -62, duration: 0.8, ease: 'back.out(1.5)' }, '-=0.2')
        // 5. Scene exits toward the main page
        .to('.env-body', { scale: 1.15, y: -30, opacity: 0, duration: 0.6, ease: 'power2.in' }, '+=0.55')
        .to('.env-doodles', { opacity: 0, duration: 0.4 }, '<')
    })
  }, [context, onOpenStart, onOpened])

  return (
    <section
      ref={scope}
      aria-label="Amplop undangan"
      className="relative flex min-h-dvh flex-col items-center justify-center gap-10 overflow-hidden px-4 py-10 sm:gap-14"
    >
      {/* Heading */}
      <header className="env-header text-center">
        <p className="font-hand text-2xl text-sage-deep sm:text-3xl">{invitation.openingTitle}</p>
        <h1 className="font-display text-4xl font-semibold leading-tight sm:text-6xl">
          {couple.groom.nickname}{' '}
          <span className="font-serif-display font-medium italic text-gold-deep">&amp;</span> {couple.bride.nickname}
        </h1>
        <p className="mt-1 text-sm font-semibold tracking-wide text-ink/70">{dateLabel}</p>
      </header>

      {/* Envelope stage */}
      <div className="relative">
        <DoodleLayer className="env-doodles -inset-x-6 -inset-y-8 sm:-inset-x-14 sm:-inset-y-12" />

        <div
          className="env-body relative aspect-[3/2] w-[min(84vw,440px)] [perspective:1400px]"
          style={{ '--flap': `${FLAP_DEPTH}%` } as CSSProperties}
        >
          {/* Back / inner lining */}
          <div className="absolute inset-0 rounded-[10px] border-2 border-ink bg-coral shadow-hard-lg" />

          {/* Letter (inside) */}
          <div className="env-letter absolute inset-x-[7%] top-[5%] bottom-[6%] z-10 flex flex-col items-center justify-start rounded-md border-2 border-ink bg-paper pt-[6%] shadow-hard-sm">
            <p className="font-hand text-lg leading-none text-terra-deep sm:text-xl">Undangan Pernikahan</p>
            <p className="font-display text-3xl font-semibold sm:text-4xl">
              {couple.groom.initial}
              <span className="font-serif-display font-medium italic text-gold-deep"> &amp; </span>
              {couple.bride.initial}
            </p>
            <Heart className="mt-1 size-4 fill-coral text-ink" />
          </div>

          {/* Front pocket (side + bottom folds) */}
          <svg
            viewBox="0 0 300 200"
            preserveAspectRatio="none"
            className="absolute inset-0 z-20 size-full overflow-visible"
            aria-hidden
          >
            <g stroke={palette.ink} strokeWidth={2} strokeLinejoin="round" vectorEffect="non-scaling-stroke">
              <path d="M1 3 L150 102 L1 197 Z" fill={palette.sunshine} vectorEffect="non-scaling-stroke" />
              <path d="M299 3 L150 102 L299 197 Z" fill="#C9A24F" vectorEffect="non-scaling-stroke" />
              <path d="M1 199 L150 92 L299 199 Z" fill={palette.paper} vectorEffect="non-scaling-stroke" />
            </g>
          </svg>

          {/* Paper grain overlay */}
          <div className="paper-grain pointer-events-none absolute inset-0 z-[32] rounded-[10px]" />

          {/* Top flap (GSAP flips it on rotationX) */}
          <div className="env-flap absolute inset-x-0 top-0 z-30 h-[var(--flap)] origin-top">
            <svg viewBox="0 0 300 116" preserveAspectRatio="none" className="size-full overflow-visible" aria-hidden>
              <defs>
                {/* tone-on-tone terracotta with a fine dotted weave */}
                <pattern id="flap-dots" width="12" height="12" patternUnits="userSpaceOnUse">
                  <rect width="12" height="12" fill={palette.coral} />
                  <circle cx="3" cy="3" r="1.1" fill={palette.paper} opacity="0.3" />
                  <circle cx="9" cy="9" r="1.1" fill={palette.paper} opacity="0.3" />
                </pattern>
              </defs>
              <path
                d="M1 1 L299 1 L150 115 Z"
                fill="url(#flap-dots)"
                stroke={palette.ink}
                strokeWidth={2}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              {/* stitched keyline, like a bound stationery flap */}
              <path
                d="M15 9 L285 9 L150 101 Z"
                fill="none"
                stroke={palette.paper}
                strokeOpacity={0.7}
                strokeWidth={1.4}
                strokeDasharray="5 4"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {/* Interlocked gold rings — the wedding emblem (fades out as the flap lifts) */}
            <GoldRings className="env-flap-orn absolute left-1/2 top-[9%] w-[30%] -translate-x-1/2 drop-shadow-[2px_2px_0_rgb(43_45_66/0.85)]" />
          </div>

          {/* Pair of doves — a die-cut sticker stuck on the envelope's top-right corner */}
          <DovePair className="env-flap-orn sticker-die pointer-events-none absolute -right-[6%] -top-[12%] z-[45] w-[38%] rotate-[7deg]" />

          {/* "Kepada Tamu Spesial" label */}
          <div className="env-label absolute -bottom-[6%] left-[3%] z-[55] w-[50%] sm:bottom-[7%] sm:left-[5%] sm:w-[46%] rotate-[-3deg] rounded-sm border-2 border-ink bg-paper px-2 py-1 shadow-hard-sm">
            <span className="washi -top-3 left-1/2 h-4 w-12 -translate-x-1/2 rotate-[4deg] bg-sky" />
            <p className="text-[9px] font-bold uppercase tracking-[0.06em] text-ink/70 sm:text-[10px] sm:tracking-[0.12em]">
              {invitation.toLabel}
            </p>
            <p className={`text-balance break-words font-hand leading-[1.05] ${nameSize(guestName)}`}>
              {guestName}
            </p>
          </div>

          {/* Postage stamp */}
          <div className="absolute bottom-[8%] right-[6%] z-[35] grid aspect-[4/5] w-[14%] rotate-[6deg] place-items-center rounded-sm border-2 border-dashed border-ink bg-paper shadow-hard-sm">
            <Heart className="size-1/2 fill-coral text-ink" strokeWidth={2} />
          </div>

          {/* Ribbon: two halves so it can "tear" */}
          <div className="absolute inset-x-0 z-40 h-[11%] -translate-y-1/2" style={{ top: 'var(--flap)' }}>
            <div className="env-ribbon-l ribbon-paper absolute inset-y-0 left-0 w-1/2 border-y-2 border-l-2 border-ink" />
            <div className="env-ribbon-r absolute inset-y-0 left-1/2 w-1/2">
              <motion.div
                className="ribbon-paper absolute inset-y-0 left-0 border-y-2 border-r-2 border-ink"
                style={{ width: ribbonStretch }}
              />
              {/* Pull-tab (Framer Motion drag) */}
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: PULL_MAX }}
                dragElastic={0.12}
                dragSnapToOrigin
                dragTransition={{ bounceStiffness: 500, bounceDamping: 18 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x > PULL_THRESHOLD) open()
                }}
                // A plain tap (no drag) also opens — Framer cancels onTap once a drag starts
                onTap={open}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 1.1, cursor: 'grabbing' }}
                style={{ x: pullX }}
                role="button"
                aria-label="Tarik pita untuk membuka amplop"
                // Sits inside the ribbon (not at the very edge) so a thumb has room to pull right on phones
                className="absolute right-[14%] top-1/2 flex h-[170%] w-12 -translate-y-1/2 cursor-grab touch-none items-center justify-center rounded-md border-2 border-ink bg-sunshine shadow-hard-sm sm:w-14"
              >
                <ChevronsRight className="animate-nudge size-5 text-ink" strokeWidth={3} />
              </motion.div>
            </div>
          </div>

          {/* Seal (GSAP animates the wrapper, Framer the button inside) */}
          <div
            className="env-seal absolute left-1/2 z-50 aspect-square w-[30%] min-w-[5.5rem] max-w-[8.75rem] sm:w-[32%] -translate-x-1/2 -translate-y-1/2"
            style={{ top: 'var(--flap)' }}
          >
            {/* olive wreath framing the seal (decorative; the seal button sits inside it) */}
            <OliveWreath className="pointer-events-none absolute inset-0 size-full drop-shadow-[2px_2px_0_rgb(43_45_66/0.6)]" />
            <motion.button
              type="button"
              onClick={open}
              aria-label="Buka amplop undangan"
              style={{ rotate: sealTilt }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 420, damping: 14 }}
              className="absolute inset-[16%] block cursor-pointer rounded-full focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-sky"
            >
              <EnvelopeSeal groomInitial={couple.groom.initial} brideInitial={couple.bride.initial} />
            </motion.button>
          </div>
        </div>
      </div>

      <p className="env-hint font-hand text-xl text-ink/80 sm:text-2xl">{invitation.openHint}</p>
    </section>
  )
}
