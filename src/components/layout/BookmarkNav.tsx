/**
 * Book-divider tabs on the right edge. ScrollTrigger tracks the active page;
 * Framer Motion gives the tabs their springy slide-out.
 */
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ScrollTrigger, scrollToSection, useGSAP } from '../../lib/gsap'
import { SECTIONS, type SectionId } from './sections'

export function BookmarkNav() {
  const [active, setActive] = useState<SectionId>('hero')

  useGSAP(() => {
    SECTIONS.forEach((s) => {
      if (!document.getElementById(s.id)) return
      ScrollTrigger.create({
        trigger: `#${s.id}`,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => self.isActive && setActive(s.id),
      })
    })
  })

  return (
    <nav aria-label="Halaman undangan" className="fixed right-0 top-1/2 z-30 -translate-y-1/2">
      <ul className="flex flex-col gap-0.5 sm:gap-1">
        {SECTIONS.map((s, i) => {
          const isActive = s.id === active
          return (
            <li key={s.id}>
              <motion.button
                type="button"
                onClick={() => scrollToSection(s.id)}
                aria-current={isActive ? 'true' : undefined}
                aria-label={s.label}
                initial={false}
                animate={{ x: isActive ? 0 : 4 }}
                whileHover={{ x: -4 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className={`relative flex min-h-8 min-w-7 items-center justify-center gap-1 rounded-l-md border-2 border-r-0 border-ink py-0.5 pl-1.5 pr-2 text-[11px] font-bold shadow-hard-sm before:absolute before:-inset-x-2 before:inset-y-0 before:content-[''] sm:min-h-11 sm:min-w-11 sm:rounded-l-lg sm:py-1.5 sm:pl-2 sm:pr-3 sm:before:hidden bg-${s.color} ${
                  isActive ? '' : 'opacity-75'
                }`}
              >
                <span className="font-hand text-sm leading-none sm:text-base lg:text-sm">{i + 1}</span>
                {/* labels only where there is spare margin; below that the tabs stay slim so they never cover content */}
                <span className="hidden lg:inline">{s.label}</span>
              </motion.button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
