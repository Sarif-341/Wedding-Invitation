/**
 * One "page" of the scrapbook: tinted paper, torn top edge overlapping the previous page,
 * and a page-number stamp — so every section reads as part of the same book.
 */
import type { ReactNode } from 'react'
import { pageTints, type PageTint } from '../../lib/palette'
import { TornEdge } from './TornEdge'

interface Props {
  id: string
  tint: PageTint
  pageNumber: number
  kraft?: boolean
  className?: string
  children: ReactNode
}

export function ScrapbookPage({ id, tint, pageNumber, kraft, className = '', children }: Props) {
  return (
    <section
      id={id}
      className={`relative mt-6 pb-20 pt-16 sm:pb-28 sm:pt-20 ${kraft ? 'page-kraft' : 'page-texture'} ${className}`}
      style={{ backgroundColor: pageTints[tint] }}
    >
      <TornEdge fill={pageTints[tint]} seed={pageNumber * 31} />
      <span
        aria-hidden
        className="absolute right-4 top-4 grid size-12 rotate-[10deg] place-items-center rounded-full border-2 border-dashed border-ink/50 font-hand text-sm leading-none text-ink/60 sm:right-10 sm:top-6"
      >
        hal.
        <br />
        {String(pageNumber).padStart(2, '0')}
      </span>
      {children}
    </section>
  )
}
