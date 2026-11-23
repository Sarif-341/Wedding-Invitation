/**
 * Hand-drawn vector doodles that draw themselves (Anime.js `createDrawable`)
 * and gently float. Purely decorative — pointer-events disabled.
 */
import { useEffect, useRef } from 'react'
import { animate, createDrawable, stagger } from 'animejs'
import { prefersReducedMotion } from '../../lib/palette'
import { DOODLE_SHAPES as SHAPES, envelopeDoodles, type Doodle } from './doodles'

export function DoodleLayer({ doodles = envelopeDoodles, className = '' }: { doodles?: Doodle[]; className?: string }) {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el) return
    const reduce = prefersReducedMotion()

    const drawables = createDrawable(el.querySelectorAll('path'))
    const draw = animate(drawables, {
      draw: ['0 0', '0 1'],
      duration: 1400,
      ease: 'inOutQuad',
      delay: stagger(180, { start: 300 }),
      ...(reduce ? {} : { loop: true, alternate: true, loopDelay: 1800 }),
    })

    const float = reduce
      ? null
      : animate(el.querySelectorAll('.doodle'), {
          translateY: [-5, 5],
          rotate: [-6, 6],
          duration: 2400,
          ease: 'inOutSine',
          delay: stagger(220),
          loop: true,
          alternate: true,
        })

    return () => {
      draw.revert()
      float?.revert()
    }
  }, [doodles])

  return (
    <div ref={root} aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}>
      {doodles.map((d, i) => (
        <span
          key={i}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: d.left, top: d.top, rotate: `${d.rotate ?? 0}deg` }}
        >
          <svg
            className="doodle block"
            width={d.size}
            height={d.size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={d.color}
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={SHAPES[d.shape]} />
          </svg>
        </span>
      ))}
    </div>
  )
}
