/**
 * "Bab N" chapter header shared by every scrapbook page.
 * GSAP ScrollTrigger reveals it; Anime.js draws the wavy underline on enter.
 */
import { useRef } from 'react'
import { animate, createDrawable } from 'animejs'
import type { PaperColor } from '../../data/weddingData'
import { ScrollTrigger, gsap, useGSAP } from '../../lib/gsap'
import { palette } from '../../lib/palette'

interface Props {
  chapter: string
  title: string
  subtitle?: string
  /** Chapter tag color */
  color: PaperColor
  /** Underline stroke color */
  underline?: PaperColor
}

export function ChapterHeader({ chapter, title, subtitle, color, underline = 'coral' }: Props) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      let draw: ReturnType<typeof animate> | null = null
      ScrollTrigger.create({
        trigger: ref.current,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          const path = ref.current?.querySelector<SVGPathElement>('.chapter-underline')
          if (!path) return
          path.style.opacity = '1'
          draw = animate(createDrawable(path), { draw: ['0 0', '0 1'], duration: 900, ease: 'inOutQuad' })
        },
      })

      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from(ref.current!.children, {
          y: 40,
          opacity: 0,
          stagger: 0.12,
          duration: 0.8,
          ease: 'back.out(1.8)',
          scrollTrigger: { trigger: ref.current, start: 'top 85%', toggleActions: 'play none none reverse' },
        })
      })

      return () => draw?.revert()
    },
    { scope: ref },
  )

  return (
    <header ref={ref} className="mb-12 text-center sm:mb-16">
      <p
        className={`mx-auto block w-fit rotate-[-3deg] rounded-sm border-2 border-ink px-3 py-0.5 font-hand text-xl shadow-hard-sm bg-${color}`}
      >
        {chapter}
      </p>
      <h2 className="relative mt-4 inline-block font-display text-4xl font-bold sm:text-5xl">
        {title}
        <svg viewBox="0 0 200 16" aria-hidden className="absolute -bottom-3 left-0 h-4 w-full" fill="none">
          <path
            className="chapter-underline opacity-0"
            d="M3 10 C 40 3, 70 14, 100 8 S 160 3, 197 9"
            stroke={palette[underline]}
            strokeWidth={4}
            strokeLinecap="round"
          />
        </svg>
      </h2>
      {subtitle && <p className="mx-auto mt-5 max-w-sm font-hand text-2xl text-ink/75">{subtitle}</p>}
    </header>
  )
}
