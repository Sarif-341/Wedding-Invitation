/**
 * Section #4 — Draggable Polaroid & Sticker Board
 *  - Framer Motion: drag / rotate / lift polaroids, sticker drag & stamp physics.
 *  - Anime.js: floating stickers in the drawer.
 *  - GSAP ScrollTrigger: board & photos drop in when the page scrolls into view.
 */
import { useCallback, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Eraser, RotateCcw } from 'lucide-react'
import { gallerySection, polaroids, stickerSet, type StickerId } from '../../data/weddingData'
import { gsap, useGSAP } from '../../lib/gsap'
import { ChapterHeader } from '../layout/ChapterHeader'
import { NextPageButton } from '../layout/NextPageButton'
import { ScrapbookPage } from '../layout/ScrapbookPage'
import { BoardPolaroid } from './BoardPolaroid'
import { PlacedSticker, type PlacedStickerData } from './PlacedSticker'
import { StickerDrawer } from './StickerDrawer'

const MAX_STICKERS = 30
const LABELS = Object.fromEntries(stickerSet.map((s) => [s.id, s.label])) as Record<StickerId, string>
const rand = (min: number, max: number) => min + Math.random() * (max - min)

export function GallerySection() {
  const scope = useRef<HTMLDivElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const zTop = useRef(polaroids.length + 10)
  const uid = useRef(0)

  const [photoZ, setPhotoZ] = useState<Record<string, number>>(() =>
    Object.fromEntries(polaroids.map((p, i) => [p.id, 10 + i])),
  )
  const [photosKey, setPhotosKey] = useState(0)
  const [placed, setPlaced] = useState<PlacedStickerData[]>([])

  const nextZ = () => ++zTop.current

  const addSticker = useCallback((id: StickerId, x: number, y: number) => {
    const s: PlacedStickerData = {
      uid: ++uid.current,
      id,
      x,
      y,
      rotate: rand(-25, 25),
      scale: rand(0.9, 1.2),
      z: ++zTop.current,
    }
    setPlaced((list) => [...list, s].slice(-MAX_STICKERS))
  }, [])

  const stampRandom = useCallback((id: StickerId) => addSticker(id, rand(10, 90), rand(10, 90)), [addSticker])

  const dropAt = useCallback(
    (id: StickerId, clientX: number, clientY: number) => {
      const r = boardRef.current?.getBoundingClientRect()
      if (!r || clientX < r.left || clientX > r.right || clientY < r.top || clientY > r.bottom) return false
      addSticker(id, ((clientX - r.left) / r.width) * 100, ((clientY - r.top) / r.height) * 100)
      return true
    },
    [addSticker],
  )

  const resetPhotos = () => {
    setPhotoZ(Object.fromEntries(polaroids.map((p, i) => [p.id, 10 + i])))
    setPhotosKey((k) => k + 1)
  }

  // --- GSAP: scroll reveal (wrappers only; Framer owns the inner elements) ---
  useGSAP(
    () => {
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: boardRef.current, start: 'top 80%', once: true },
        })
        tl.from('.gallery-board-wrap', { y: 80, rotate: 3, opacity: 0, duration: 0.8, ease: 'back.out(1.5)' })
          .from('.gallery-drawer-wrap', { x: -60, rotate: -8, opacity: 0, duration: 0.7, ease: 'back.out(1.8)' }, '-=0.5')
          .from(
            '.board-photo',
            { y: -260, rotate: () => gsap.utils.random(-25, 25), opacity: 0, duration: 1, ease: 'bounce.out', stagger: 0.15 },
            '-=0.4',
          )
      })
    },
    { scope },
  )

  return (
    <ScrapbookPage id="gallery" tint="blush" pageNumber={3}>
      <div ref={scope} className="mx-auto max-w-5xl pl-4 pr-10 sm:px-8">
        <ChapterHeader
          chapter={gallerySection.chapter}
          title={gallerySection.title}
          subtitle={gallerySection.subtitle}
          color="mint"
          underline="lilac"
        />

        <div className="flex flex-col gap-5 sm:grid sm:grid-cols-[9.5rem_1fr] sm:items-start sm:gap-6">
          <div className="gallery-drawer-wrap sm:sticky sm:top-24">
            <StickerDrawer onStampRandom={stampRandom} onDropAt={dropAt} />
          </div>

          <div className="gallery-board-wrap">
            <div
              ref={boardRef}
              className="cork-board relative h-[540px] overflow-hidden rounded-2xl border-2 border-ink shadow-hard-lg sm:h-[620px]"
            >
              {/* inner frame line */}
              <div aria-hidden className="pointer-events-none absolute inset-2 rounded-xl border-2 border-dashed border-ink/20" />

              <div key={photosKey}>
                {polaroids.map((p, i) => (
                  <BoardPolaroid
                    key={p.id}
                    p={p}
                    index={i}
                    boardRef={boardRef}
                    zIndex={photoZ[p.id]}
                    onLift={() => setPhotoZ((z) => ({ ...z, [p.id]: nextZ() }))}
                  />
                ))}
              </div>

              <AnimatePresence>
                {placed.map((s) => (
                  <PlacedSticker
                    key={s.uid}
                    s={s}
                    label={LABELS[s.id]}
                    boardRef={boardRef}
                    onLift={() =>
                      setPlaced((list) => list.map((x) => (x.uid === s.uid ? { ...x, z: nextZ() } : x)))
                    }
                    onRemove={() => setPlaced((list) => list.filter((x) => x.uid !== s.uid))}
                  />
                ))}
              </AnimatePresence>
            </div>

            <p className="mt-3 text-center font-hand text-lg text-ink/70">{gallerySection.boardHint}</p>

            {/* left-aligned on phones so the floating vinyl doesn't cover a button */}
            <div className="mt-3 flex flex-wrap justify-start gap-3 sm:justify-center">
              <BoardButton onClick={resetPhotos} className="bg-sky">
                <RotateCcw className="size-4" strokeWidth={2.5} /> {gallerySection.resetPhotosLabel}
              </BoardButton>
              <BoardButton onClick={() => setPlaced([])} disabled={!placed.length} className="bg-sunshine">
                <Eraser className="size-4" strokeWidth={2.5} /> {gallerySection.clearStickersLabel}
                {placed.length > 0 && (
                  <span className="rounded-full border-2 border-ink bg-paper px-1.5 text-[10px] leading-4">{placed.length}</span>
                )}
              </BoardButton>
            </div>
          </div>
        </div>

        <NextPageButton from="gallery" />
      </div>
    </ScrapbookPage>
  )
}

function BoardButton({
  children,
  className,
  ...rest
}: { children: ReactNode; className: string; onClick: () => void; disabled?: boolean }) {
  return (
    <motion.button
      type="button"
      whileHover={rest.disabled ? undefined : { y: -2, rotate: -1.5 }}
      whileTap={rest.disabled ? undefined : { scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 450, damping: 15 }}
      className={`flex min-h-11 items-center gap-1.5 rounded-full border-2 border-ink px-4 py-1.5 text-xs font-bold shadow-hard-sm disabled:opacity-50 sm:text-sm ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  )
}
