/**
 * Central GSAP setup — import `gsap` / `ScrollTrigger` from here so plugins are registered once.
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { useGSAP } from '@gsap/react'
import { prefersReducedMotion } from './palette'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, useGSAP)

export { gsap, ScrollTrigger, useGSAP }

/** Smoothly page-turn to a section by id. */
export function scrollToSection(id: string) {
  gsap.to(window, {
    scrollTo: { y: `#${id}`, offsetY: 0, autoKill: true },
    duration: prefersReducedMotion() ? 0 : 1.1,
    ease: 'power3.inOut',
  })
}
