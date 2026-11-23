/**
 * A polaroid you can pick up, slide around the board and twist with the corner handle.
 * Framer Motion owns this element's transform; GSAP only animates the outer `.board-photo` wrapper.
 */
import { useRef, type PointerEvent as ReactPointerEvent, type RefObject } from 'react'
import { motion, useDragControls, useMotionValue } from 'framer-motion'
import { RotateCw } from 'lucide-react'
import type { Polaroid } from '../../data/weddingData'
import { PhotoFrame } from '../shared/PhotoFrame'
import { PolaroidOrnament } from './PolaroidOrnament'

const WASHI = ['bg-sunshine', 'bg-sky', 'bg-coral', 'bg-mint', 'bg-lilac']

interface Props {
  p: Polaroid
  index: number
  boardRef: RefObject<HTMLDivElement | null>
  zIndex: number
  onLift: () => void
}

export function BoardPolaroid({ p, index, boardRef, zIndex, onLift }: Props) {
  const controls = useDragControls()
  const rotate = useMotionValue(p.rotate)
  const cardRef = useRef<HTMLDivElement>(null)

  /** Twist around the card's centre by following the pointer angle. */
  const startRotate = (e: ReactPointerEvent) => {
    e.preventDefault()
    onLift()
    const rect = cardRef.current!.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const angleOf = (x: number, y: number) => (Math.atan2(y - cy, x - cx) * 180) / Math.PI
    const offset = angleOf(e.clientX, e.clientY) - rotate.get()

    const move = (ev: PointerEvent) => rotate.set(angleOf(ev.clientX, ev.clientY) - offset)
    const end = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', end)
      window.removeEventListener('pointercancel', end)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', end)
    window.addEventListener('pointercancel', end)
  }

  return (
    <div className="board-photo absolute w-[42%] min-w-[6.5rem] sm:w-48" style={{ left: `${p.x}%`, top: `${p.y}%`, zIndex }}>
      <motion.div
        ref={cardRef}
        drag
        dragControls={controls}
        dragListener={false}
        dragConstraints={boardRef}
        dragElastic={0.1}
        dragTransition={{ power: 0.25, timeConstant: 220, bounceStiffness: 400, bounceDamping: 22 }}
        onPointerDown={(e) => {
          onLift()
          if (!(e.target as HTMLElement).closest('[data-rotate-handle]')) controls.start(e)
        }}
        style={{ rotate }}
        whileHover={{ scale: 1.03 }}
        whileDrag={{ scale: 1.08, boxShadow: 'rgb(43, 45, 66) 10px 12px 0px 0px' }}
        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        className="relative w-full cursor-grab touch-none select-none border-2 border-ink bg-white p-2 pb-2 shadow-hard active:cursor-grabbing sm:p-2.5"
      >
        <span className={`washi -left-4 -top-2 h-5 w-16 -rotate-[32deg] ${WASHI[index % WASHI.length]}`} />
        <span className={`washi -right-4 -top-2 h-5 w-16 rotate-[32deg] ${WASHI[(index + 2) % WASHI.length]}`} />

        <PhotoFrame
          color={p.color}
          sticker={p.sticker}
          photo={p.photo}
          alt={p.alt}
          className="aspect-square"
          emojiClass="text-5xl sm:text-6xl"
        />
        {/* no printed caption: a little hand-drawn trim keeps the polaroid's bottom strip from feeling bare */}
        <PolaroidOrnament variant={index} className="mb-0.5 ml-[3%] mt-2.5 w-[78%] sm:mt-3" />

        {/* Rotate handle */}
        <span
          data-rotate-handle
          role="presentation"
          title="Putar foto"
          onPointerDown={startRotate}
          className="absolute -bottom-3 -right-3 grid size-8 cursor-alias before:absolute before:-inset-2 before:content-[''] touch-none place-items-center rounded-full border-2 border-ink bg-sunshine shadow-hard-sm transition-transform hover:scale-110"
        >
          <RotateCw className="pointer-events-none size-4" strokeWidth={3} />
        </span>
      </motion.div>
    </div>
  )
}
