/**
 * Floating vinyl music player (fixed, bottom-right).
 *  - Framer Motion: floating entrance, spring hover/tap, tonearm swing.
 *  - Anime.js: continuous record rotation, eased up/down on play/pause via playback speed.
 */
import { useEffect, useRef } from 'react'
import { animate } from 'animejs'
import { motion } from 'framer-motion'
import { Music2, Pause, Play } from 'lucide-react'
import { couple, music } from '../../data/weddingData'
import { useMusic } from '../../audio/useMusic'

type Spin = ReturnType<typeof animate>

export function VinylPlayer() {
  const { playing, toggle } = useMusic()
  const discRef = useRef<HTMLDivElement>(null)
  const spinRef = useRef<Spin | null>(null)
  const speedTween = useRef<Spin | null>(null)

  // Create the (paused) rotation once
  useEffect(() => {
    if (!discRef.current) return
    const spin = animate(discRef.current, {
      rotate: '1turn',
      duration: 2400,
      ease: 'linear',
      loop: true,
      autoplay: false,
    })
    spinRef.current = spin
    return () => {
      speedTween.current?.cancel()
      spin.revert()
    }
  }, [])

  // Ease the record's speed up / down instead of a hard start/stop
  useEffect(() => {
    const spin = spinRef.current
    if (!spin) return
    speedTween.current?.cancel()
    const proxy = { speed: spin.paused ? 0.01 : spin.speed }
    if (playing) {
      spin.speed = proxy.speed
      spin.play()
    }
    speedTween.current = animate(proxy, {
      speed: playing ? 1 : 0.01,
      duration: playing ? 700 : 1100,
      ease: playing ? 'outQuad' : 'outCubic',
      onUpdate: () => {
        spin.speed = proxy.speed
      },
      onComplete: () => {
        if (!playing) spin.pause()
      },
    })
  }, [playing])

  const label = playing ? music.pauseLabel : music.playLabel

  return (
    <motion.aside
      aria-label="Pemutar musik"
      initial={{ y: 140, opacity: 0, rotate: 25 }}
      animate={{ y: 0, opacity: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 160, damping: 14, delay: 0.5 }}
      className="fixed bottom-4 right-4 z-40 flex items-end gap-2 sm:bottom-6 sm:right-6"
    >
      {/* Track tag with explicit Play/Pause */}
      {/* Hidden on phones so the floating player never covers centered content */}
      <div className="relative mb-1 hidden max-w-[11.5rem] sm:flex rotate-[-3deg] flex-col gap-1.5 rounded-lg border-2 border-ink bg-paper px-3 py-2 shadow-hard-sm">
        <span className="washi -top-2.5 left-3 h-4 w-10 rotate-[-8deg] bg-lilac" />
        <div className="flex items-center gap-1.5">
          <Equalizer active={playing} />
          <p className="truncate font-display text-xs font-semibold leading-tight">{music.title}</p>
        </div>
        <p className="truncate text-[10px] text-ink/60">{music.artist}</p>
        <motion.button
          type="button"
          onClick={toggle}
          aria-pressed={playing}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          className={`flex items-center justify-center gap-1 rounded-full border-2 border-ink px-3 py-0.5 text-xs font-bold shadow-hard-sm ${
            playing ? 'bg-sunshine' : 'bg-mint'
          }`}
        >
          {playing ? <Pause className="size-3.5 fill-ink" /> : <Play className="size-3.5 fill-ink" />}
          {label}
        </motion.button>
      </div>

      {/* The record itself (also a toggle) */}
      <motion.button
        type="button"
        onClick={toggle}
        aria-label={`${label} musik`}
        aria-pressed={playing}
        whileHover={{ scale: 1.07, rotate: -4 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 400, damping: 14 }}
        className="relative size-[4.5rem] shrink-0 rounded-full min-[400px]:size-20 sm:size-24"
      >
        {/* Disc (Anime.js rotates this) */}
        <div
          ref={discRef}
          className="absolute inset-0 rounded-full border-2 border-ink shadow-hard"
          style={{
            background:
              'radial-gradient(circle, transparent 0 34%, rgb(255 255 255 / 0.08) 35%, transparent 36%), repeating-radial-gradient(circle, #2B2D42 0 2px, #3a3d58 2px 3.5px)',
          }}
        >
          {/* sheen so the rotation is visible */}
          <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_20deg,transparent_0_12%,rgb(255_255_255/0.18)_16%,transparent_22%_62%,rgb(255_255_255/0.12)_66%,transparent_72%)]" />
          {/* centre label */}
          <div className="absolute inset-[30%] grid place-items-center rounded-full border-2 border-ink bg-coral">
            <span className="font-display text-[9px] font-bold leading-none text-paper sm:text-[11px]">
              {couple.groom.initial}&amp;{couple.bride.initial}
            </span>
          </div>
        </div>

        {/* Static play/pause badge (does not spin) */}
        <span
          className={`absolute -left-2 -top-2 grid size-9 place-items-center rounded-full border-2 border-ink shadow-hard-sm sm:-left-1 sm:-top-1 sm:size-7 sm:bg-paper ${
            playing ? 'bg-sunshine' : 'bg-mint'
          }`}
        >
          {playing ? (
            <Pause className="size-4 fill-ink sm:size-3.5" />
          ) : (
            <Play className="ml-0.5 size-4 fill-ink sm:size-3.5" />
          )}
        </span>

        {/* Tonearm swings onto the record while playing */}
        <motion.span
          aria-hidden
          className="absolute -right-2 -top-2 h-12 w-2 origin-top rounded-full border-2 border-ink bg-sunshine sm:h-14"
          initial={false}
          animate={{ rotate: playing ? 28 : 4 }}
          transition={{ type: 'spring', stiffness: 120, damping: 10 }}
        >
          <span className="absolute -left-1.5 -top-1.5 size-4 rounded-full border-2 border-ink bg-coral" />
        </motion.span>

        {/* Floating notes while playing */}
        {playing && (
          <motion.span
            aria-hidden
            className="absolute -left-4 top-2 text-lilac"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], y: -26, x: -6 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
          >
            <Music2 className="size-4" strokeWidth={3} />
          </motion.span>
        )}
      </motion.button>
    </motion.aside>
  )
}

function Equalizer({ active }: { active: boolean }) {
  return (
    <span aria-hidden className="flex h-3 items-end gap-[2px]">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`w-[3px] rounded-full bg-coral ${active ? 'animate-eq' : 'h-1'}`}
          style={active ? { animationDelay: `${i * 0.15}s` } : undefined}
        />
      ))}
    </span>
  )
}
