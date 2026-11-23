/**
 * The English guest pass shown after a guest RSVPs "attending". The ticket is a canvas (so the preview and the PNG are
 * identical); the guest's name is drawn from data, never baked into an image. GSAP reveals it, Framer Motion handles
 * the button feel. Wide boarding pass on desktop, tall one on phones.
 */
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Download } from 'lucide-react'
import { guestPass } from '../../../data/weddingData'
import { gsap, useGSAP } from '../../../lib/gsap'
import { useMediaQuery } from '../../../lib/useMediaQuery'
import { reportDownloaded } from '../../../lib/rsvpApi'
import { PASS_BUTTON, PASS_SIZE, canvasToPng, drawPass, loadPassFonts, type PassLayout } from './drawPass'
import { passFileName, type PassGuest } from './passData'

export function GuestPassPanel({ guest, onDownloaded }: { guest: PassGuest; onDownloaded: () => void }) {
  const scope = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const wide = useMediaQuery('(min-width: 1024px)')
  const layout: PassLayout = wide ? 'landscape' : 'portrait'
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    loadPassFonts().then(() => {
      if (cancelled || !canvas.current) return
      drawPass(canvas.current, guest, layout, true)
      setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [guest, layout])

  useGSAP(
    () => {
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.pass-reveal', { y: 40, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out' })
      })
    },
    { scope },
  )

  const download = async () => {
    if (busy) return
    setBusy(true)
    setError(false)
    try {
      await loadPassFonts()
      const off = document.createElement('canvas')
      drawPass(off, guest, layout, false)
      const blob = await canvasToPng(off)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = passFileName(guest)
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 10000)
      // The file was handed to the browser: tell the sheet, then take the ticket off the page.
      // A short pause lets the browser start saving before the page re-renders.
      await new Promise((r) => window.setTimeout(r, 1200))
      void reportDownloaded(guest.ticketNo) // fire and forget: a failure is queued and retried on the next visit
      onDownloaded()
      return
    } catch {
      setError(true)
    } finally {
      setBusy(false)
    }
  }

  const { w, h } = PASS_SIZE[layout]
  const b = PASS_BUTTON.landscape
  const label = busy ? guestPass.downloadingLabel : guestPass.downloadLabel

  return (
    <section
      ref={scope}
      id="guest-pass"
      aria-label={guestPass.panelTitle}
      className="mx-auto mt-14 w-full max-w-5xl scroll-mt-20 rounded-[28px] bg-[#10161c] px-3 pb-6 pt-8 text-center shadow-hard-lg sm:px-6"
    >
      <h3 className="pass-reveal font-[Pinyon_Script] text-4xl leading-tight text-[#e6c877] sm:text-5xl">
        {guestPass.panelTitle}
      </h3>
      <p className="pass-reveal mt-2 font-[Jost] text-xs font-medium uppercase tracking-[0.3em] text-white/90 sm:text-sm">
        {guestPass.panelSubtitle}
      </p>

      <div
        className="pass-reveal relative mx-auto mt-5"
        style={{ maxWidth: layout === 'portrait' ? 460 : undefined, aspectRatio: `${w} / ${h}` }}
      >
        <canvas
          ref={canvas}
          role="img"
          aria-label={`${guestPass.panelSubtitle}: ${guest.name}, ${guest.ticketNo}`}
          className={`block size-full transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}
        />
        {!ready && (
          <p className="absolute inset-0 grid place-items-center font-[Jost] text-sm text-white/70">
            {guestPass.loadingLabel}
          </p>
        )}
        {layout === 'landscape' && ready && (
          <button
            type="button"
            onClick={download}
            disabled={busy}
            aria-label={guestPass.downloadLabel}
            className="absolute rounded-[1.4%] outline-offset-2 focus-visible:outline-4 focus-visible:outline-[#ebcf82]"
            style={{
              left: `${(b.x / w) * 100}%`,
              width: `${(b.w / w) * 100}%`,
              top: `${((b.y + b.h / 2) / h) * 100}%`,
              height: `max(44px, ${(b.h / h) * 100}%)`,
              transform: 'translateY(-50%)',
            }}
          />
        )}
      </div>

      {layout === 'portrait' && (
        <motion.button
          type="button"
          onClick={download}
          disabled={busy}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.96 }}
          className="pass-reveal mx-auto mt-5 flex min-h-12 w-full max-w-[460px] items-center justify-center gap-3 rounded-2xl border-2 border-[#c19a43] bg-gradient-to-b from-[#16604e] to-[#0b3a2f] px-6 py-3 font-[Jost] text-sm font-semibold uppercase tracking-[0.25em] text-[#ebcf82] disabled:opacity-70"
        >
          <Download aria-hidden className="size-5" strokeWidth={2.5} /> {label}
        </motion.button>
      )}

      <p role="status" className="mt-3 min-h-5 font-[Jost] text-xs text-white/70">
        {error ? guestPass.downloadError : ''}
      </p>
    </section>
  )
}
