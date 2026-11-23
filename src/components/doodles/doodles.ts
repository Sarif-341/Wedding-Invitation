import { palette } from '../../lib/palette'

/** Single-stroke doodle paths on a 24×24 grid. */
export const DOODLE_SHAPES = {
  star: 'M12 2.5 L14.8 8.7 L21.5 9.4 L16.4 13.9 L17.9 20.6 L12 17.2 L6.1 20.6 L7.6 13.9 L2.5 9.4 L9.2 8.7 Z',
  heart: 'M12 20.5 C 5.5 15.5, 2.5 11.5, 2.5 8 C 2.5 5, 4.8 3, 7.3 3 C 9.4 3, 11 4.3, 12 6.2 C 13 4.3, 14.6 3, 16.7 3 C 19.2 3, 21.5 5, 21.5 8 C 21.5 11.5, 18.5 15.5, 12 20.5 Z',
  sparkle: 'M12 2 C 12.8 8, 16 11.2, 22 12 C 16 12.8, 12.8 16, 12 22 C 11.2 16, 8 12.8, 2 12 C 8 11.2, 11.2 8, 12 2 Z',
  squiggle: 'M1.5 13 C 4 6, 7 6, 8 12 S 12 18, 14 12 S 18.5 6, 22.5 11',
  loop: 'M2 16 C 6 16, 9 4, 13 5 C 17 6, 13 15, 10 12 C 7 9, 14 4, 22 9',
} as const

export type DoodleShape = keyof typeof DOODLE_SHAPES

export interface Doodle {
  shape: DoodleShape
  color: string
  /** CSS position relative to the parent, e.g. '10%' */
  left: string
  top: string
  size: number
  rotate?: number
}

export const envelopeDoodles: Doodle[] = [
  { shape: 'star', color: palette.sunshine, left: '3%', top: '6%', size: 34, rotate: -12 },
  { shape: 'sparkle', color: palette.sunshine, left: '99%', top: '40%', size: 24 },
  { shape: 'sparkle', color: palette.sky, left: '100%', top: '62%', size: 22 },
  { shape: 'heart', color: palette.rose, left: '0%', top: '62%', size: 26, rotate: -10 },
  { shape: 'star', color: palette.mint, left: '88%', top: '97%', size: 28, rotate: 14 },
  { shape: 'squiggle', color: palette.rose, left: '14%', top: '100%', size: 46 },
  { shape: 'sparkle', color: palette.sunshine, left: '36%', top: '-2%', size: 18 },
  { shape: 'loop', color: palette.sky, left: '-3%', top: '28%', size: 36, rotate: 70 },
]
