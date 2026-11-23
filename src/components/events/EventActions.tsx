/**
 * "Save the date" card under the ticket: one button that adds the wedding day to Google Calendar.
 * (Intimate wedding — only invited guests attend — so there is deliberately no share / copy-link button.)
 */
import { motion } from 'framer-motion'
import { CalendarPlus } from 'lucide-react'
import { events, eventsSection } from '../../data/weddingData'
import { weddingCalendarUrl } from '../../lib/calendar'

export function EventActions() {
  return (
    <div className="event-actions paper-card relative mx-auto mt-14 max-w-md rotate-[-1deg] px-5 pb-6 pt-9 text-center sm:px-8">
      <span className="washi -left-6 top-2 w-20 -rotate-[35deg] bg-mint" />
      <span className="washi -right-6 top-2 w-20 rotate-[35deg] bg-rose" />

      <h3 className="font-display text-2xl font-semibold">{eventsSection.actionsTitle}</h3>
      <p className="mt-0.5 font-hand text-xl text-ink/70">{eventsSection.actionsHint}</p>

      <motion.a
        href={weddingCalendarUrl(events)}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ y: -3, rotate: -1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 450, damping: 15 }}
        className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-2 border-ink bg-sunshine px-5 py-3 font-display text-sm font-semibold shadow-hard"
      >
        <CalendarPlus className="size-5" strokeWidth={2.5} />
        {eventsSection.saveAllLabel}
      </motion.a>
    </div>
  )
}
