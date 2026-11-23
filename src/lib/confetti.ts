import confetti from 'canvas-confetti'
import { confettiColors } from './palette'

const base: confetti.Options = {
  colors: confettiColors,
  disableForReducedMotion: true,
  zIndex: 100,
}

/** Big multi-point celebration burst (envelope open, RSVP submit). */
export function celebrate() {
  confetti({ ...base, particleCount: 100, spread: 75, startVelocity: 45, origin: { x: 0.5, y: 0.55 } })
  confetti({ ...base, particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.75 } })
  confetti({ ...base, particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.75 } })
  window.setTimeout(() => {
    confetti({ ...base, particleCount: 40, spread: 120, shapes: ['star'], scalar: 1.2, origin: { x: 0.5, y: 0.4 } })
  }, 250)
}
