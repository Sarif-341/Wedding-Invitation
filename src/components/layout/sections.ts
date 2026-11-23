import type { PaperColor } from '../../data/weddingData'

/** Ordered "pages" of the scrapbook — drives bookmark nav & next-page buttons. */
export const SECTIONS = [
  { id: 'hero', label: 'Sampul', color: 'coral' },
  { id: 'story', label: 'Cerita', color: 'sky' },
  { id: 'gallery', label: 'Papan', color: 'mint' },
  { id: 'events', label: 'Acara', color: 'sunshine' },
  { id: 'rsvp', label: 'RSVP', color: 'lilac' },
] as const satisfies readonly { id: string; label: string; color: PaperColor }[]

export type SectionId = (typeof SECTIONS)[number]['id']

export const nextSectionOf = (id: SectionId) => {
  const i = SECTIONS.findIndex((s) => s.id === id)
  return SECTIONS[i + 1]
}
