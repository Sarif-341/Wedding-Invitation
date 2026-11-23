/** Sticky-note wish wall. New notes "slap" onto the wall with a Framer spring. */
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { rsvpSection, type Wish } from '../../data/weddingData'
import { lightTints } from '../../lib/palette'
import type { WallStatus } from '../../lib/useWishes'

const PAGE = 8

/** Stable pseudo-random tilt per note */
function tiltOf(id: string) {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) | 0
  return ((Math.abs(h) % 9) - 4) * 0.9
}

const PIN = ['bg-coral', 'bg-sky', 'bg-mint', 'bg-lilac', 'bg-sunshine']

export function WishWall({
  wishes,
  freshId,
  status,
  onRetry,
}: {
  wishes: Wish[]
  freshId: string | null
  status: WallStatus
  onRetry: () => void
}) {
  const [visible, setVisible] = useState(PAGE)
  const attending = wishes.filter((w) => w.attending).length

  return (
    <div className="wish-wall">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-2xl font-bold">{rsvpSection.wallTitle}</h3>
        <p className="flex flex-wrap gap-1.5 text-[11px] font-bold">
          <span className="rounded-full border-2 border-ink bg-mint px-2 py-0.5">🥳 {attending} hadir</span>
          {wishes.length - attending > 0 && (
            <span className="rounded-full border-2 border-ink bg-lilac px-2 py-0.5">🙏 {wishes.length - attending} berhalangan</span>
          )}
          <span className="rounded-full border-2 border-ink bg-sunshine px-2 py-0.5">💌 {wishes.length} ucapan</span>
        </p>
      </div>

      {status !== 'ok' && (
        <p role="status" className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-ink/70">
          {status === 'loading' ? rsvpSection.wallLoading : rsvpSection.wallError}
          {status === 'error' && (
            <button
              type="button"
              onClick={onRetry}
              className="min-h-11 rounded-full border-2 border-ink bg-paper px-4 py-1 text-xs font-bold shadow-hard-sm"
            >
              {rsvpSection.wallRetryLabel}
            </button>
          )}
        </p>
      )}

      <div className="page-kraft rounded-xl border-2 border-ink bg-[#EBDCC0] p-4 shadow-hard sm:p-5">
        {wishes.length === 0 && status !== 'loading' && (
          <p className="py-10 text-center font-hand text-2xl leading-snug text-ink/70">{rsvpSection.wallEmpty}</p>
        )}
        <ul className="grid grid-cols-1 items-start gap-5 min-[420px]:grid-cols-2">
          <AnimatePresence initial={false}>
            {wishes.slice(0, visible).map((w, i) => {
              const tilt = tiltOf(w.id)
              const fresh = w.id === freshId
              return (
                <motion.li
                  layout
                  key={w.id}
                  id={`wish-${w.id}`}
                  initial={{ opacity: 0, scale: 0.3, y: -80, rotate: tilt - 40 }}
                  animate={{ opacity: 1, scale: 1, y: 0, rotate: tilt }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  whileHover={{ scale: 1.04, rotate: 0, zIndex: 5 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 18 }}
                  className="relative border-2 border-ink px-4 pb-3 pt-5 shadow-hard"
                  style={{ backgroundColor: lightTints[w.color] }}
                >
                  {/* push pin */}
                  <span
                    aria-hidden
                    className={`absolute -top-2.5 left-1/2 size-5 -translate-x-1/2 rounded-full border-2 border-ink shadow-hard-sm ${PIN[i % PIN.length]}`}
                  />
                  {fresh && (
                    <span className="absolute -right-3 -top-3 rotate-12 rounded-md border-2 border-ink bg-coral px-1.5 text-[10px] font-bold text-paper shadow-hard-sm">
                      BARU!
                    </span>
                  )}
                  <p className="whitespace-pre-line break-words font-hand text-xl leading-snug">{w.message}</p>
                  <div className="mt-3 flex items-center justify-between gap-2 border-t-2 border-dashed border-ink/20 pt-2">
                    <p className="min-w-0 truncate text-sm font-bold">— {w.name}</p>
                    <span className="shrink-0 text-[10px] font-bold text-ink/60">
                      {w.attending ? '🥳 Hadir' : '🙏 Berhalangan'}
                    </span>
                  </div>
                  {fresh && <p className="mt-0.5 text-[10px] font-semibold text-ink/50">{rsvpSection.justNow}</p>}
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>

        {wishes.length > visible && (
          <div className="mt-5 text-center">
            <motion.button
              type="button"
              onClick={() => setVisible((v) => v + PAGE)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.94 }}
              className="min-h-11 rounded-full border-2 border-ink bg-paper px-4 py-1.5 text-xs font-bold shadow-hard-sm"
            >
              {rsvpSection.showMoreLabel} ({wishes.length - visible})
            </motion.button>
          </div>
        )}
      </div>
    </div>
  )
}
