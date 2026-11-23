/** A sticker stamped on the board: springy "thunk" on placement, re-draggable, double-tap to peel off. */
import { useRef, type RefObject } from 'react'
import { motion } from 'framer-motion'
import type { StickerId } from '../../data/weddingData'
import { StickerArt } from './stickerArt'

export interface PlacedStickerData {
  uid: number
  id: StickerId
  /** Centre position, % of board */
  x: number
  y: number
  rotate: number
  scale: number
  z: number
}

interface Props {
  s: PlacedStickerData
  label: string
  boardRef: RefObject<HTMLDivElement | null>
  onLift: () => void
  onRemove: () => void
}

const DOUBLE_TAP_MS = 320

export function PlacedSticker({ s, label, boardRef, onLift, onRemove }: Props) {
  const lastTap = useRef(0)

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${s.x}%`, top: `${s.y}%`, zIndex: s.z }}
    >
      <motion.div
        role="img"
        aria-label={`Stiker ${label}`}
        drag
        dragConstraints={boardRef}
        dragElastic={0.1}
        dragMomentum={false}
        onPointerDown={onLift}
        // Double-tap (touch) / double-click (mouse) peels the sticker off
        onTap={() => {
          const now = performance.now()
          if (now - lastTap.current < DOUBLE_TAP_MS) onRemove()
          lastTap.current = now
        }}
        initial={{ scale: s.scale * 1.9, rotate: s.rotate - 35, opacity: 0 }}
        animate={{ scale: s.scale, rotate: s.rotate, opacity: 1 }}
        exit={{ scale: 0, rotate: s.rotate + 90, opacity: 0, transition: { duration: 0.25 } }}
        whileHover={{ scale: s.scale * 1.08 }}
        whileDrag={{ scale: s.scale * 1.2 }}
        transition={{ type: 'spring', stiffness: 520, damping: 14 }}
        className="size-12 cursor-grab touch-none active:cursor-grabbing sm:size-16"
      >
        <StickerArt id={s.id} className="pointer-events-none size-full" />
      </motion.div>
    </div>
  )
}
