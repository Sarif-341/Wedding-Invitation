/**
 * JS mirror of the scrapbook tokens in index.css (for SVG strokes, confetti, etc.).
 * Vintage wedding palette — token names kept from the original scheme:
 *   coral = terracotta · sunshine = soft gold · mint = sage · sky = dusty blue · lilac = dusty mauve
 */
export const palette = {
  paper: '#FFFDF7',
  linen: '#F7EFDF',
  coral: '#BF5F47',
  sunshine: '#D8B15E',
  mint: '#9DB398',
  sky: '#7F9DB9',
  lilac: '#B795B2',
  rose: '#DBA99D',
  ink: '#2B2D42',
  terraDeep: '#A9503B',
  sageDeep: '#5E7A60',
  goldDeep: '#A8802F',
  skyDeep: '#46688A',
} as const

/** Page paper tints — each scrapbook "page" alternates between these. */
export const pageTints = {
  paper: '#FDF8EE',
  warm: '#F4E8D1',
  blush: '#F7E9E2',
  sun: '#F5EBD3',
} as const
export type PageTint = keyof typeof pageTints

/** Light paper versions of the accent colors (sticky notes, ticket stubs, torn notes) */
export const lightTints = {
  coral: '#F2D2C7',
  sunshine: '#F3E5B8',
  mint: '#DCE6D6',
  sky: '#D6E2EE',
  lilac: '#E7DAE8',
} as const

/** Confetti: terracotta, gold, sage, dusty blue, blush and champagne */
export const confettiColors = ['#BF5F47', '#D8B15E', '#9DB398', '#7F9DB9', '#E8B4A5', '#F4E3B5']

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
