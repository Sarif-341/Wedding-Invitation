/**
 * One boarding pass for the whole wedding day: AKAD ✈ RESEPSI.
 * Same day and same venue, so the date and the location appear ONCE; only the two time slots differ.
 *  - Horizontal on tablet/desktop (main part | perforation | tear-off stub on the right).
 *  - Stacked on phones (main part, perforation, stub underneath). Same pieces, re-ordered with CSS.
 * Motion: GSAP animates the outer `.boarding-pass` and the stamp (entrance, in EventsSection);
 * Framer Motion handles the hover lift on its own inner element.
 */
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, Clock, MapPin, Navigation } from 'lucide-react'
import { couple, events, eventsSection, weddingDate, weddingVenue, type WeddingEvent } from '../../data/weddingData'
import { formatDate, formatDuration, formatRange, formatTime } from '../../lib/format'
import { getGuestName } from '../../lib/guest'
import { lightTints, pageTints, palette } from '../../lib/palette'
import { PassportStamp, PlaneGlyph } from '../story/ldr/LdrArt'

const SPRING = { type: 'spring', stiffness: 350, damping: 18 } as const

// ---- torn end of the stub (vertical on desktop, horizontal on phones) ----------------------------
const TEETH = 16
const ZIG = Array.from({ length: TEETH * 2 + 1 }, (_, i) => ({ t: (i * 100) / (TEETH * 2), d: i % 2 ? 9 : 1 }))
const V_EDGE = ZIG.map(({ t, d }) => `${d} ${t.toFixed(2)}`).join(' L')
const H_EDGE = ZIG.map(({ t, d }) => `${t.toFixed(2)} ${d}`).join(' L')

function TornEnd({ vertical }: { vertical: boolean }) {
  const fill = lightTints.sunshine
  return (
    <svg
      aria-hidden
      viewBox={vertical ? '0 0 10 100' : '0 0 100 10'}
      preserveAspectRatio="none"
      className={
        vertical
          ? 'pointer-events-none absolute left-full top-0 -ml-px hidden h-full w-3 md:block'
          : 'pointer-events-none absolute left-0 top-full -mt-px block h-3 w-full md:hidden'
      }
    >
      <path d={vertical ? `M0 0 L${V_EDGE} L0 100 Z` : `M0 0 L${H_EDGE} L100 0 Z`} fill={fill} />
      <path
        d={vertical ? `M${V_EDGE}` : `M${H_EDGE}`}
        fill="none"
        stroke={palette.ink}
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ---- small pieces ---------------------------------------------------------------------------------
function Field({ icon, label, children, tone }: { icon: ReactNode; label: string; children: ReactNode; tone: string }) {
  return (
    <div className="flex gap-2.5">
      <span aria-hidden className={`mt-0.5 shrink-0 ${tone}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/55">{label}</dt>
        <dd className="text-sm font-semibold leading-snug">{children}</dd>
      </div>
    </div>
  )
}

function MapsLink({ href }: { href: string }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.94 }}
      className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 border-ink bg-sky px-3.5 py-1.5 text-xs font-bold shadow-hard-sm"
    >
      <Navigation className="size-3.5" strokeWidth={2.5} /> {eventsSection.mapsLabel}
    </motion.a>
  )
}

/** One time slot of the day, boarding-pass style: big start time, end time underneath. */
function TimeSlot({ event, index }: { event: WeddingEvent; index: number }) {
  return (
    <div
      role="group"
      aria-label={`${event.title}: ${formatRange(event)} ${eventsSection.timezone}`}
      className={`relative px-2 pb-3 pt-4 text-center sm:px-4 ${index > 0 ? 'border-l-2 border-dashed border-ink/40' : ''}`}
    >
      <span aria-hidden className={`absolute inset-x-0 top-0 h-1.5 bg-${event.color}`} />
      <p className="whitespace-nowrap font-display text-sm font-semibold sm:text-lg">{event.title}</p>
      <p className="mt-1 font-display text-3xl font-bold leading-none lining-nums sm:text-4xl">{formatTime(event.startsAt)}</p>
      <p className="mt-1.5 whitespace-nowrap text-[11px] font-bold tracking-[0.2em] text-ink/70 sm:text-xs">{eventsSection.untilLabel} {formatTime(event.endsAt)} {eventsSection.timezone}</p>
    </div>
  )
}

// ---- the ticket ------------------------------------------------------------------------------------
export function BoardingPassTicket() {
  const guest = getGuestName()
  const first = events[0]
  const last = events[events.length - 1]
  // Resepsi starts this long after the Akad starts
  const gapMs = events.length > 1 ? new Date(events[1].startsAt).getTime() - new Date(first.startsAt).getTime() : 0

  const day = formatDate(weddingDate, { day: '2-digit' })
  const month = formatDate(weddingDate, { month: 'short' }).replace('.', '').toUpperCase()
  const year = formatDate(weddingDate, { year: 'numeric' })

  const hole = { backgroundColor: pageTints.sun }

  return (
    <div className="boarding-pass relative mx-auto mt-10 max-w-3xl">
      <motion.div whileHover={{ y: -5 }} transition={SPRING} className="relative mb-3 rotate-[-1deg] md:mb-0 md:mr-3">
        {/* ticket + torn edge share one hard shadow (drop-shadow follows the ragged outline) */}
        <article
          aria-label={`${eventsSection.ticketLabel}: ${events.map((e) => e.title).join(' & ')}`}
          className="relative [filter:drop-shadow(4px_4px_0_#2B2D42)]"
        >
          <div className="flex flex-col rounded-t-xl border-2 border-b-0 border-ink bg-white md:flex-row md:rounded-l-xl md:rounded-tr-none md:border-b-2 md:border-r-0">
            {/* ---------- main part ---------- */}
            <div className="min-w-0 flex-1">
              <header className="flex items-center gap-2 rounded-tl-[10px] border-b-2 border-ink bg-coral py-2 pl-5 pr-24 text-[10px] font-bold uppercase tracking-[0.18em] text-paper sm:pr-32">
                <span>{eventsSection.ticketLabel}</span>
                <span aria-hidden className="hidden opacity-60 sm:inline">
                  ·
                </span>
                <span className="hidden sm:inline">{eventsSection.passLabel}</span>
              </header>

              <div className="px-5 pb-5 pt-4 sm:px-6">
                {/* route: AKAD ✈ RESEPSI */}
                {events.length > 1 && (
                  <div aria-hidden>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="font-display text-xl font-bold leading-none sm:text-4xl">{first.code}</span>
                      <div className="relative flex h-9 flex-1 items-center justify-center">
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-[3px] border-dashed border-ink/55" />
                        <svg viewBox="-26 -20 52 40" className="relative size-8 bg-white px-0.5 sm:size-10">
                          <PlaneGlyph />
                        </svg>
                      </div>
                      <span className="font-display text-xl font-bold leading-none sm:text-4xl">{last.code}</span>
                    </div>
                    <p className="mt-1 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-ink/55">
                      {last.title} · {formatDuration(gapMs)} {eventsSection.gapSuffix}
                    </p>
                  </div>
                )}

                {/* shared by both events: the date… */}
                <dl className="mt-5 space-y-3">
                  <Field icon={<CalendarDays className="size-4" />} label={eventsSection.dateLabel} tone="text-terra-deep">
                    <span className="capitalize">
                      {formatDate(first.startsAt, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </Field>
                </dl>

                {/* …then the two time slots, side by side */}
                <div className="mt-4">
                  <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-ink/55">
                    <Clock aria-hidden className="size-3.5 text-sky-deep" /> {eventsSection.timesLabel}
                  </p>
                  <div className="grid grid-cols-2 overflow-hidden rounded-md border-2 border-ink bg-paper">
                    {events.map((e, i) => (
                      <TimeSlot key={e.id} event={e} index={i} />
                    ))}
                  </div>
                </div>

                {/* …and the one location */}
                <dl className="mt-4">
                  <Field icon={<MapPin className="size-4" />} label={eventsSection.placeLabel} tone="text-sage-deep">
                    {weddingVenue.name && <span className="block font-bold">{weddingVenue.name}</span>}
                    <span className={weddingVenue.name ? 'font-normal text-ink/75' : 'font-semibold'}>{weddingVenue.address}</span>
                  </Field>
                </dl>
                <MapsLink href={weddingVenue.mapsUrl} />

                {/* passenger strip */}
                <div className="mt-5 flex items-end justify-between gap-3 border-t-2 border-dashed border-ink/30 pt-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/55">{eventsSection.guestLabel}</p>
                    <p className="truncate font-hand text-2xl leading-tight" title={guest}>
                      {guest}
                    </p>
                  </div>
                  <p className="shrink-0 font-display text-sm font-bold tracking-wide text-ink/70">{eventsSection.passCode}</p>
                </div>
              </div>
            </div>

            {/* ---------- tear-off stub (perforated) ---------- */}
            <div
              aria-hidden
              className="relative flex shrink-0 items-center justify-between gap-4 border-t-2 border-dashed border-ink px-5 py-4 md:w-40 md:flex-col md:justify-between md:border-l-2 md:border-t-0 md:px-4 md:py-5"
              style={{ backgroundColor: lightTints.sunshine }}
            >
              {/* punched notches at both ends of the perforation */}
              <span className="absolute left-0 top-0 z-10 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ink" style={hole} />
              <span
                className="absolute right-0 top-0 z-10 size-6 -translate-y-1/2 translate-x-1/2 rounded-full border-2 border-ink md:bottom-0 md:left-0 md:right-auto md:top-auto md:-translate-x-1/2 md:translate-y-1/2"
                style={hole}
              />

              <div className="text-left md:text-center">
                <p className="text-[10px] font-bold tracking-[0.3em]">{eventsSection.admitLabel}</p>
                <p className="mt-1 font-display leading-none">
                  <span className="block text-4xl font-bold md:text-5xl">{day}</span>
                  <span className="block text-xs font-bold tracking-[0.2em]">{month}</span>
                  <span className="block text-[10px] font-semibold tracking-widest text-ink/70">{year}</span>
                </p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="block h-10 w-24 bg-[repeating-linear-gradient(90deg,#2B2D42_0_2px,transparent_2px_4px,#2B2D42_4px_5px,transparent_5px_8px)] md:h-14 md:w-28" />
                <span className="text-[10px] font-bold tracking-[0.2em]">{eventsSection.passCode}</span>
              </div>
            </div>
          </div>

          <TornEnd vertical />
          <TornEnd vertical={false} />
        </article>

        {/* rubber stamp pressed over the corner (GSAP "thunks" it down; decorative) */}
        <div aria-hidden className="boarding-stamp pointer-events-none absolute -top-10 right-3 z-10 w-20 sm:right-8 sm:w-24 md:right-[11.5rem]">
          <div className="rotate-[9deg]">
            <PassportStamp
              color={palette.terraDeep}
              ring={couple.displayName.toUpperCase()}
              word={eventsSection.admitLabel}
              date={`${day} ${month} ${year}`}
              planeAngle={-25}
            />
          </div>
        </div>

        {/* washi tape holding the ticket to the page */}
        <span aria-hidden className="washi -left-10 -top-1 z-10 w-20 -rotate-[38deg] bg-mint" />
      </motion.div>
    </div>
  )
}
