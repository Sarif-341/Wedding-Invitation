/**
 * Photo area for polaroids: a real photo or looping .gif if provided, otherwise a cheerful placeholder.
 * Animated GIFs loop forever on their own (checked: every file carries the "loop infinitely" flag);
 * guests who ask for reduced motion get the first frame as a still picture instead.
 */
import { useEffect, useRef, type ReactNode } from 'react'
import type { PaperColor } from '../../data/weddingData'
import { palette, prefersReducedMotion } from '../../lib/palette'

interface Props {
  color: PaperColor
  sticker: string
  photo?: string
  /** Illustration used instead of the placeholder when there is no photo */
  art?: ReactNode
  alt: string
  className?: string
  /** Tailwind text-size classes for the placeholder emoji */
  emojiClass?: string
}

const isGif = (src: string) => /\.gif(\?|#|$)/i.test(src)

/** First frame of an animated GIF, drawn once on a canvas (for prefers-reduced-motion). */
function StillFrame({ src, alt }: { src: string; alt: string }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      const c = canvas.current
      if (!c) return
      c.width = img.naturalWidth
      c.height = img.naturalHeight
      c.getContext('2d')?.drawImage(img, 0, 0)
    }
    img.src = src
  }, [src])
  return <canvas ref={canvas} role="img" aria-label={alt} className="size-full object-cover" />
}

export function PhotoFrame({ color, sticker, photo, art, alt, className = '', emojiClass = 'text-6xl sm:text-7xl' }: Props) {
  return (
    <div className={`relative overflow-hidden border-2 border-ink bg-${color} ${className}`}>
      {photo ? (
        isGif(photo) && prefersReducedMotion() ? (
          <StillFrame src={photo} alt={alt} />
        ) : (
          <img src={photo} alt={alt} loading="lazy" decoding="async" draggable={false} className="size-full object-cover" />
        )
      ) : art ? (
        <div role="img" aria-label={alt} className="size-full">
          {art}
        </div>
      ) : (
        <div
          role="img"
          aria-label={alt}
          className="grid size-full place-items-center"
          style={{
            backgroundImage: `radial-gradient(${palette.paper}66 2px, transparent 2.5px)`,
            backgroundSize: '16px 16px',
          }}
        >
          <span className={`drop-shadow-[3px_3px_0_#2B2D42] ${emojiClass}`}>{sticker}</span>
          <span className="absolute bottom-1 right-2 font-hand text-xs text-ink/70 sm:text-sm">foto menyusul</span>
        </div>
      )}
    </div>
  )
}
