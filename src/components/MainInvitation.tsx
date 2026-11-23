/**
 * Main invitation "book": every section is a scrapbook page.
 * Hero (#2) → Story (#3) → Polaroid board (#4) → Events, countdown & save/share (#5) → RSVP & wishes (#6) → back cover.
 */
import { useRef } from 'react'
import { motion } from 'framer-motion'
import { MailOpen } from 'lucide-react'
import { invitation } from '../data/weddingData'
import { ScrollTrigger, useGSAP } from '../lib/gsap'
import { EventsSection } from './events/EventsSection'
import { GallerySection } from './gallery/GallerySection'
import { HeroSection } from './hero/HeroSection'
import { BookmarkNav } from './layout/BookmarkNav'
import { ClosingCover } from './layout/ClosingCover'
import { VinylPlayer } from './music/VinylPlayer'
import { RsvpSection } from './rsvp/RsvpSection'
import { StorySection } from './story/StorySection'

export function MainInvitation({ onCloseEnvelope }: { onCloseEnvelope: () => void }) {
  const scope = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      // Web fonts change text height → recompute trigger positions once they're in
      document.fonts?.ready.then(() => ScrollTrigger.refresh())
    },
    { scope },
  )

  return (
    <div ref={scope} className="min-h-dvh overflow-x-clip">
      {/* Demo helper: re-close the envelope (top-left) */}
      <motion.button
        type="button"
        onClick={onCloseEnvelope}
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        whileHover={{ y: -2, rotate: -2 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        className="fixed left-3 top-3 z-40 flex min-h-11 items-center gap-2 rounded-full border-2 border-ink bg-paper px-3.5 py-1.5 text-xs font-bold shadow-hard sm:left-5 sm:top-5 sm:text-sm"
      >
        <MailOpen className="size-4" strokeWidth={2.5} />
        {invitation.closeEnvelopeLabel}
      </motion.button>

      <HeroSection />
      <StorySection />
      <GallerySection />
      <EventsSection />
      <RsvpSection />
      <ClosingCover />

      <BookmarkNav />
      <VinylPlayer />
    </div>
  )
}
