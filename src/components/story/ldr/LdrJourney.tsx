/**
 * Long-distance ornament: Germany ↔ Indonesia flight path, drawn as a scrapbook page insert.
 *
 * Motion roles (see CLAUDE.md):
 *  - GSAP + ScrollTrigger: the card and pins/labels appear in order when scrolled into view, and the
 *    passport stamps / boarding pass are "stuck on" as the plane reaches each point of its trip (relay).
 *  - Anime.js: the dashed arc draws itself (via a reveal mask), the plane flies along it and the pins bob.
 *  - Framer Motion: spring hover on pins, stamps and ticket (separate inner elements).
 *
 * The plane's heading comes from the path tangent. The return trip uses a path drawn in the opposite
 * direction, so the nose always points the way it is moving.
 */
import { useId, useRef } from 'react'
import { motion } from 'framer-motion'
import { animate, createDrawable, stagger } from 'animejs'
import { Heart } from 'lucide-react'
import { couple, ldr } from '../../../data/weddingData'
import { ScrollTrigger, gsap, useGSAP } from '../../../lib/gsap'
import { palette, prefersReducedMotion } from '../../../lib/palette'
import { useMediaQuery } from '../../../lib/useMediaQuery'
import { BoardingPass, LocationPin, PassportStamp, PlaneGlyph } from './LdrArt'
import { NARROW, STAMP_ASPECT, TICKET_ASPECT, WIDE, arcPaths, boxStyle, pct, pinStyle } from './ldrLayout'

const FLIGHT_MS = 4200
const PAUSE_MS = 900
const CYCLE_MS = 2 * (FLIGHT_MS + PAUSE_MS)

const easeInOutSine = (t: number) => 0.5 - Math.cos(Math.PI * t) / 2
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

const SPRING = { type: 'spring', stiffness: 380, damping: 14 } as const

export function LdrJourney() {
  const wide = useMediaQuery('(min-width: 768px)')
  const L = wide ? WIDE : NARROW
  const paths = arcPaths(L)

  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const titleId = `ldr-title-${uid}`
  const maskId = `ldr-mask-${uid}`

  const root = useRef<HTMLDivElement>(null)
  const forward = useRef<SVGPathElement>(null)
  const back = useRef<SVGPathElement>(null)
  const plane = useRef<SVGGElement>(null)

  useGSAP(
    () => {
      const rootEl = root.current
      const fwd = forward.current
      const ret = back.current
      const planeEl = plane.current
      const maskPath = rootEl?.querySelector<SVGPathElement>('.ldr-reveal')
      if (!rootEl || !fwd || !ret || !planeEl || !maskPath) return

      const length = fwd.getTotalLength()

      /** Put the plane at progress t (0–1) of a path: position, heading, "altitude" size, fade in/out. */
      const place = (path: SVGPathElement, t: number) => {
        const d = easeInOutSine(clamp01(t)) * length
        const p = path.getPointAtLength(d)
        const a = path.getPointAtLength(Math.max(0, d - 1))
        const b = path.getPointAtLength(Math.min(length, d + 1))
        const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
        // bigger mid-flight (cruising altitude), smaller at take-off and landing
        const scale = L.planeScale * (0.72 + 0.5 * Math.sin(Math.PI * clamp01(t)))
        const fade = clamp01(Math.min(t / 0.07, (1 - t) / 0.07))
        planeEl.setAttribute('transform', `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${angle.toFixed(1)}) scale(${scale.toFixed(3)})`)
        planeEl.style.opacity = String(fade)
      }

      // Reduced motion: a calm still frame — plane cruising at the top of the arc, everything visible.
      if (prefersReducedMotion()) {
        planeEl.setAttribute('transform', '')
        planeEl.style.opacity = '1'
        const p = fwd.getPointAtLength(length / 2)
        planeEl.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(0) scale(${L.planeScale * 1.1})`)
        return
      }

      // --- Anime.js: reveal mask (draws the dashed line), plane flight, pin bobbing -----------------
      const reveal = animate(createDrawable(maskPath), {
        draw: ['0 0', '0 1'],
        duration: 1500,
        ease: 'inOutQuad',
        autoplay: false,
      })
      reveal.seek(0)

      const bob = animate(rootEl.querySelectorAll('.ldr-pin-art'), {
        translateY: [-2.5, 2.5],
        duration: 1800,
        ease: 'inOutSine',
        loop: true,
        alternate: true,
        delay: stagger(350),
      })

      // --- GSAP: stamps & ticket wait (paused) until the plane triggers them -------------------------
      const stampA = gsap.from('.ldr-stamp-a', { scale: 2.6, rotate: -28, opacity: 0, duration: 0.45, ease: 'back.out(2.4)', paused: true })
      const ticket = gsap.from('.ldr-ticket', { x: 110, y: 28, rotate: 14, opacity: 0, duration: 0.9, ease: 'back.out(1.5)', paused: true })
      const stampB = gsap.from('.ldr-stamp-b', { scale: 2.6, rotate: 26, opacity: 0, duration: 0.45, ease: 'back.out(2.4)', paused: true })

      // The plane drives the relay: take-off → stamp, mid-flight → ticket, landing → stamp.
      const fired = { depart: false, mid: false, land: false }
      const frame = (ms: number) => {
        if (ms < FLIGHT_MS) {
          const t = ms / FLIGHT_MS
          place(fwd, t)
          if (!fired.depart && ms > 250) {
            fired.depart = true
            stampA.play()
          }
          if (!fired.mid && t >= 0.5) {
            fired.mid = true
            ticket.play()
          }
        } else if (ms < FLIGHT_MS + PAUSE_MS) {
          planeEl.style.opacity = '0'
          if (!fired.land) {
            fired.land = true
            stampB.play()
          }
        } else if (ms < 2 * FLIGHT_MS + PAUSE_MS) {
          place(ret, (ms - FLIGHT_MS - PAUSE_MS) / FLIGHT_MS)
        } else {
          planeEl.style.opacity = '0'
        }
      }

      const clock = { ms: 0 }
      const cycle = animate(clock, {
        ms: CYCLE_MS,
        duration: CYCLE_MS,
        ease: 'linear',
        loop: true,
        autoplay: false,
        onUpdate: () => frame(clock.ms),
      })

      // Only fly while the card is on screen
      let started = false
      const visibility = ScrollTrigger.create({
        trigger: rootEl,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => {
          if (!started) return
          if (self.isActive) cycle.play()
          else cycle.pause()
        },
      })
      const startFlight = () => {
        started = true
        if (visibility.isActive) cycle.play()
      }

      // --- GSAP: scroll-triggered entrance sequence ---------------------------------------------------
      gsap
        .timeline({ scrollTrigger: { trigger: rootEl, start: 'top 80%', once: true } })
        .from('.ldr-card', { y: 70, rotate: -3, opacity: 0, duration: 0.9, ease: 'back.out(1.5)' })
        .from('.ldr-pin', { scale: 0, y: -40, rotate: -25, opacity: 0, duration: 0.7, ease: 'back.out(2.4)', stagger: 0.28 }, 0.4)
        .from('.ldr-label', { y: 12, opacity: 0, duration: 0.45, ease: 'power2.out', stagger: 0.28 }, 0.8)
        .add(() => void reveal.play(), 1.0)
        .from('.ldr-chip', { scale: 0.6, rotate: -8, opacity: 0, duration: 0.6, ease: 'back.out(2)' }, 1.5)
        .from('.ldr-caption', { y: 14, opacity: 0, duration: 0.6, ease: 'power2.out' }, 1.9)
        .add(startFlight, 2.0)

      return () => {
        cycle.revert()
        reveal.revert()
        bob.revert()
      }
    },
    { scope: root, dependencies: [L.key], revertOnUpdate: true },
  )

  const pins = [
    { x: L.pinFromX, place: ldr.from, color: palette.sky, flag: 'DE' as const, tilt: -5 },
    { x: L.pinToX, place: ldr.to, color: palette.coral, flag: 'ID' as const, tilt: 5 },
  ]

  return (
    <div ref={root} className="ldr-wrap relative mx-auto mb-16 max-w-3xl sm:mb-24">
      <div
        role="group"
        aria-labelledby={titleId}
        className="ldr-card paper-card relative rotate-[-1deg] px-4 pb-6 pt-9 sm:px-8"
      >
        <span className="washi -left-6 -top-1 w-20 -rotate-[35deg] bg-sky" />
        <span className="washi -right-6 -top-1 w-20 rotate-[35deg] bg-rose" />

        <div className="text-center">
          <p className="mx-auto w-fit -rotate-2 rounded-sm border-2 border-ink bg-mint px-3 py-0.5 font-hand text-lg shadow-hard-sm">
            {ldr.kicker}
          </p>
          <h3 id={titleId} className="mt-2 text-balance font-display text-2xl font-semibold sm:text-3xl">
            {ldr.title}
          </h3>
        </div>

        {/* The illustration: one canvas, everything positioned in % so it scales as a whole */}
        <div
          className={`relative mx-auto mt-5 w-full ${wide ? '' : 'max-w-[26rem]'}`}
          style={{ aspectRatio: `${L.vw} / ${L.vh}` }}
        >
          <svg viewBox={`0 0 ${L.vw} ${L.vh}`} aria-hidden className="absolute inset-0 size-full overflow-visible">
            <defs>
              <mask id={maskId} maskUnits="userSpaceOnUse" x={0} y={0} width={L.vw} height={L.vh}>
                <path className="ldr-reveal" d={paths.forward} fill="none" stroke="#fff" strokeWidth={18} strokeLinecap="round" />
              </mask>
            </defs>
            {/* dashed flight path — revealed by the mask */}
            <path
              ref={forward}
              d={paths.forward}
              fill="none"
              stroke={palette.ink}
              strokeOpacity={0.85}
              strokeWidth={3.2}
              strokeLinecap="round"
              strokeDasharray="9 9"
              mask={`url(#${maskId})`}
            />
            {/* same arc, opposite direction: only used to steer the plane on the way back */}
            <path ref={back} d={paths.back} fill="none" stroke="none" />
            <g ref={plane} style={{ opacity: 0 }}>
              <g className="[filter:drop-shadow(1.5px_2.5px_0_rgb(43_45_66/0.4))]">
                <PlaneGlyph />
              </g>
            </g>
          </svg>

          {pins.map((p) => (
            <div key={p.place.code} className="ldr-pin absolute" style={pinStyle(L, p.x)}>
              <motion.div whileHover={{ y: -6, rotate: p.tilt, scale: 1.07 }} transition={SPRING}>
                <LocationPin className="ldr-pin-art" color={p.color} flag={p.flag} />
              </motion.div>
            </div>
          ))}

          {pins.map((p) => (
            <div
              key={`label-${p.place.code}`}
              className="ldr-label absolute -translate-x-1/2 text-center"
              style={{ left: pct(p.x, L.vw), top: pct(L.pinTipY + 7, L.vh) }}
            >
              <p className="whitespace-nowrap rounded-sm border-2 border-ink bg-paper px-2 py-0.5 shadow-hard-sm -rotate-2">
                <span className="block font-display text-[15px] font-semibold leading-tight">{p.place.name}</span>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-ink/60">
                  {p.place.code} · {p.place.city}
                </span>
              </p>
            </div>
          ))}

          <div
            className="ldr-chip absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: pct(L.chip.x, L.vw), top: pct(L.chip.y, L.vh) }}
          >
            <p className="-rotate-2 whitespace-nowrap rounded-sm border-2 border-ink bg-sunshine px-3 py-0.5 font-hand text-xl leading-tight shadow-hard-sm">
              {ldr.distance}
            </p>
          </div>

          <div className="ldr-ticket absolute" style={boxStyle(L, L.ticket, TICKET_ASPECT)}>
            <motion.div style={{ rotate: L.ticket.rot }} whileHover={{ rotate: L.ticket.rot + 3, y: -4, scale: 1.04 }} transition={SPRING}>
              <BoardingPass
                t={{
                  ...ldr.ticket,
                  passenger: couple.monogram,
                }}
              />
            </motion.div>
          </div>

          <div className="ldr-stamp-a absolute" style={boxStyle(L, L.stampA, STAMP_ASPECT)}>
            <motion.div style={{ rotate: L.stampA.rot }} whileHover={{ rotate: L.stampA.rot + 6, scale: 1.08 }} transition={SPRING}>
              <PassportStamp color={palette.terraDeep} ring={ldr.departed.ring} word={ldr.departed.word} date={ldr.departed.date} planeAngle={-35} />
            </motion.div>
          </div>

          <div className="ldr-stamp-b absolute" style={boxStyle(L, L.stampB, STAMP_ASPECT)}>
            <motion.div style={{ rotate: L.stampB.rot }} whileHover={{ rotate: L.stampB.rot - 6, scale: 1.08 }} transition={SPRING}>
              <PassportStamp color={palette.skyDeep} ring={ldr.arrived.ring} word={ldr.arrived.word} date={ldr.arrived.date} planeAngle={35} />
            </motion.div>
          </div>
        </div>

        <p className="ldr-caption mx-auto mt-6 max-w-md text-center font-hand text-2xl leading-snug text-ink/80">
          {ldr.caption} <Heart className="inline size-4 fill-coral text-coral" aria-hidden />
          <span className="mt-1 block text-xl text-gold-deep">- {ldr.captionAuthor}</span>
        </p>
      </div>
    </div>
  )
}
