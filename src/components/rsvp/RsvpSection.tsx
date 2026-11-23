/**
 * Section #6 — Gamified RSVP & sticky-note wish wall
 *  - canvas-confetti: celebration on submit.
 *  - Framer Motion: form feedback + note slap-on.
 *  - GSAP: scroll reveal, and scrolls the fresh note into view if it's off-screen.
 */
import { useEffect, useRef, useState } from 'react'
import { rsvpSection } from '../../data/weddingData'
import { celebrate } from '../../lib/confetti'
import { flushPendingDownloads, submitRsvp } from '../../lib/rsvpApi'
import { ScrollTrigger, gsap, useGSAP } from '../../lib/gsap'
import { prefersReducedMotion } from '../../lib/palette'
import { useWishes } from '../../lib/useWishes'
import { ChapterHeader } from '../layout/ChapterHeader'
import { ScrapbookPage } from '../layout/ScrapbookPage'
import { GuestPassPanel } from './guestpass/GuestPassPanel'
import { makeTicketNo, type PassGuest } from './guestpass/passData'
import { RsvpForm, type RsvpSubmission } from './RsvpForm'
import { WishWall } from './WishWall'

const PASS_KEY = 'sz-pass-v1'

/** The guest's pass outlives a reload, so they can come back to download it again. */
function loadPass(): PassGuest | null {
  try {
    const p = JSON.parse(localStorage.getItem(PASS_KEY) ?? 'null')
    return p && typeof p.name === 'string' && typeof p.ticketNo === 'string' ? { name: p.name, ticketNo: p.ticketNo } : null
  } catch {
    return null
  }
}

function savePass(p: PassGuest | null) {
  try {
    if (p) localStorage.setItem(PASS_KEY, JSON.stringify(p))
    else localStorage.removeItem(PASS_KEY)
  } catch {
    /* private mode: the pass still shows for this visit */
  }
}

export function RsvpSection() {
  const scope = useRef<HTMLDivElement>(null)
  const { wishes, add, status, refresh } = useWishes()
  const [freshId, setFreshId] = useState<string | null>(null)
  const [pass, setPass] = useState<PassGuest | null>(loadPass)
  const [downloaded, setDownloaded] = useState(false)

  // Deliver any "ticket downloaded" signal that failed to send last time
  useEffect(() => {
    flushPendingDownloads()
  }, [])

  // Page height changed → keep later ScrollTriggers (footer, bookmarks) accurate
  useEffect(() => {
    ScrollTrigger.refresh()
  }, [wishes.length, pass])

  useGSAP(
    () => {
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.rsvp-card', {
          y: 80,
          rotate: -6,
          opacity: 0,
          duration: 0.9,
          ease: 'back.out(1.6)',
          scrollTrigger: { trigger: '.rsvp-card', start: 'top 85%', toggleActions: 'play none none reverse' },
        })
        gsap.from('.wish-wall', {
          y: 80,
          rotate: 4,
          opacity: 0,
          duration: 0.9,
          ease: 'back.out(1.6)',
          scrollTrigger: { trigger: '.wish-wall', start: 'top 88%', toggleActions: 'play none none reverse' },
        })
      })
    },
    { scope },
  )

  const handleSubmit = async (w: RsvpSubmission): Promise<boolean> => {
    const ticketNo = w.attending ? makeTicketNo(w.name) : ''
    // Save to the spreadsheet first: if that fails nothing is shown as sent, and the guest can simply retry
    const saved = await submitRsvp({
      submissionId: w.submissionId,
      name: w.name,
      attending: w.attending,
      guestCount: w.guestCount,
      ticketNo,
      message: w.message,
    })
    if (!saved.ok) return false

    const wish = add({ name: w.name, message: w.message, attending: w.attending })
    setFreshId(wish.id)
    // Only guests who are coming get a pass; a decline clears any earlier one.
    const next = w.attending ? { name: w.name, ticketNo } : null
    setDownloaded(false)
    setPass(next)
    savePass(next)
    celebrate()

    // After the note lands, bring it into view if needed (e.g. wall is below the form on phones)
    window.setTimeout(() => {
      const el = document.getElementById(w.attending ? 'guest-pass' : `wish-${wish.id}`)
      if (!el) return
      const r = el.getBoundingClientRect()
      if (r.top >= 80 && r.bottom <= window.innerHeight - 40) return
      gsap.to(window, {
        scrollTo: { y: el, offsetY: 140, autoKill: true },
        duration: prefersReducedMotion() ? 0 : 0.9,
        ease: 'power2.inOut',
      })
    }, 650)
    return true
  }

  // The ticket is single-use: once it has been downloaded it disappears from the page and from this browser
  const handleDownloaded = () => {
    setPass(null)
    savePass(null)
    setDownloaded(true)
  }

  return (
    <ScrapbookPage id="rsvp" tint="warm" pageNumber={5}>
      <div ref={scope} className="mx-auto max-w-5xl pl-4 pr-10 sm:px-8">
        <ChapterHeader
          chapter={rsvpSection.chapter}
          title={rsvpSection.title}
          subtitle={rsvpSection.subtitle}
          color="lilac"
          underline="sky"
        />

        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-10">
          <div className="lg:sticky lg:top-20">
            <RsvpForm onSubmit={handleSubmit} />
          </div>
          <WishWall wishes={wishes} freshId={freshId} status={status} onRetry={refresh} />
        </div>

        {pass && <GuestPassPanel key={pass.ticketNo} guest={pass} onDownloaded={handleDownloaded} />}
        {downloaded && !pass && (
          <section
            id="guest-pass"
            role="status"
            className="mx-auto mt-14 max-w-xl rotate-[-1deg] rounded-2xl border-2 border-ink bg-paper px-6 py-8 text-center shadow-hard"
          >
            <p className="font-display text-2xl font-bold">{rsvpSection.passDownloadedTitle}</p>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-ink/80">{rsvpSection.passDownloadedBody}</p>
          </section>
        )}
      </div>
    </ScrapbookPage>
  )
}
