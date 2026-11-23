/**
 * Live countdown: four flip-calendar cards. Framer Motion pops each digit in/out on change
 * and gives the cards a springy hover/tap.
 */
import { AnimatePresence, motion } from 'framer-motion'
import { eventsSection, weddingDate, type PaperColor } from '../../data/weddingData'
import { formatDate, formatTime } from '../../lib/format'
import { useCountdown } from '../../lib/useCountdown'

const UNITS: { key: 'days' | 'hours' | 'minutes' | 'seconds'; color: PaperColor; tilt: string }[] = [
  { key: 'days', color: 'coral', tilt: 'rotate-[-3deg]' },
  { key: 'hours', color: 'sunshine', tilt: 'rotate-[2deg]' },
  { key: 'minutes', color: 'mint', tilt: 'rotate-[-1.5deg]' },
  { key: 'seconds', color: 'sky', tilt: 'rotate-[3deg]' },
]

export function Countdown() {
  const left = useCountdown(weddingDate)

  return (
    <div className="countdown relative mx-auto max-w-2xl text-center">
      <p className="font-hand text-3xl text-coral">{eventsSection.countdownTitle}</p>
      <p className="mb-6 text-xs font-semibold capitalize text-ink/70">
        {formatDate(weddingDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} ·{' '}
        {formatTime(weddingDate)} {eventsSection.timezone}
      </p>

      {left.done ? (
        <p className="mx-auto w-fit rotate-[-2deg] rounded-xl border-2 border-ink bg-sunshine px-6 py-4 font-display text-2xl font-bold shadow-hard">
          {eventsSection.countdownDone}
        </p>
      ) : (
        <div role="timer" aria-live="off" className="grid grid-cols-[1.3fr_1fr_1fr_1fr] gap-1.5 min-[420px]:grid-cols-4 min-[420px]:gap-2.5 sm:gap-5">
          {UNITS.map((u) => {
            const value = left[u.key]
            const text = String(value).padStart(2, '0')
            return (
              <motion.div
                key={u.key}
                whileHover={{ y: -6, rotate: 0, scale: 1.05 }}
                whileTap={{ scale: 0.92, rotate: 6 }}
                transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                className={`count-card relative rounded-xl border-2 border-ink pb-2 pt-4 shadow-hard bg-${u.color} ${u.tilt}`}
              >
                {/* flip-calendar binder rings */}
                <span aria-hidden className="absolute -top-2 left-1/4 h-4 w-2 rounded-full border-2 border-ink bg-paper" />
                <span aria-hidden className="absolute -top-2 right-1/4 h-4 w-2 rounded-full border-2 border-ink bg-paper" />

                <div className="mx-1 overflow-hidden sm:mx-1.5 rounded-md border-2 border-ink bg-paper">
                  <div className="relative h-12 font-display text-[1.7rem] font-bold leading-[3rem] min-[420px]:text-3xl lining-nums tabular-nums sm:h-20 sm:text-6xl sm:leading-[5rem]">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={text}
                        className="absolute inset-0"
                        initial={{ y: '-100%', opacity: 0, rotateX: 60 }}
                        animate={{ y: 0, opacity: 1, rotateX: 0 }}
                        exit={{ y: '100%', opacity: 0, rotateX: -60 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                      >
                        {text}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </div>
                <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wider sm:text-xs">
                  {eventsSection.countdownUnits[u.key]}
                </p>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
