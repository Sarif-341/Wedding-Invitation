/**
 * Mini sticker drawer. Tap a sticker → stamps at a random spot; drag it → drop it where you like.
 *  - Anime.js: idle floating on the outer wrappers.
 *  - Framer Motion: drag / tap physics on the inner sticker (separate element, no transform clash).
 */
import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'
import { motion, type PanInfo } from 'framer-motion'
import { gallerySection, stickerSet, type StickerId } from '../../data/weddingData'
import { prefersReducedMotion } from '../../lib/palette'
import { StickerArt } from './stickerArt'

interface Props {
  onStampRandom: (id: StickerId) => void
  /** Returns true if the drop landed on the board */
  onDropAt: (id: StickerId, clientX: number, clientY: number) => boolean
}

export function StickerDrawer({ onStampRandom, onDropAt }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current || prefersReducedMotion()) return
    const float = animate(ref.current.querySelectorAll('.drawer-float'), {
      translateY: [-3, 3],
      rotate: [-4, 4],
      duration: 1600,
      ease: 'inOutSine',
      loop: true,
      alternate: true,
      delay: stagger(180),
    })
    return () => {
      float.revert()
    }
  }, [])

  const handleDragEnd = (id: StickerId) => (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const pe = e as PointerEvent
    const x = typeof pe.clientX === 'number' ? pe.clientX : info.point.x - window.scrollX
    const y = typeof pe.clientY === 'number' ? pe.clientY : info.point.y - window.scrollY
    onDropAt(id, x, y)
  }

  return (
    <aside
      ref={ref}
      aria-label={gallerySection.drawerTitle}
      className="gallery-drawer relative z-20 rounded-xl border-2 border-ink bg-paper px-3 pb-3 pt-5 shadow-hard sm:rotate-[-1.5deg]"
    >
      <span className="washi -top-3 left-1/2 -translate-x-1/2 rotate-[-4deg] bg-lilac" />
      <p className="text-center font-display text-sm font-bold">{gallerySection.drawerTitle}</p>
      <p className="mb-3 text-center font-hand text-base leading-none text-ink/60">{gallerySection.drawerHint}</p>

      <ul className="grid grid-cols-6 gap-2 sm:grid-cols-2 sm:gap-3">
        {stickerSet.map((s) => (
          <li key={s.id} className="drawer-float flex justify-center">
            <motion.button
              type="button"
              aria-label={`Tempel stiker ${s.label}`}
              title={s.label}
              drag
              dragSnapToOrigin
              dragElastic={0.6}
              onTap={() => onStampRandom(s.id)}
              onDragEnd={handleDragEnd(s.id)}
              whileHover={{ scale: 1.15, rotate: -8 }}
              whileTap={{ scale: 0.9 }}
              whileDrag={{ scale: 1.35, rotate: 10, zIndex: 60 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              className="relative size-11 cursor-grab touch-none rounded-lg p-0.5 active:cursor-grabbing sm:size-14"
            >
              <StickerArt id={s.id} className="pointer-events-none size-full" />
            </motion.button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
