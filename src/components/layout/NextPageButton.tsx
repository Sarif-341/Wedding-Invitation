/** "Turn the page" button at the end of a section (Framer spring hover, GSAP scroll). */
import { motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import { scrollToSection } from '../../lib/gsap'
import { nextSectionOf, type SectionId } from './sections'

export function NextPageButton({ from, label }: { from: SectionId; label?: string }) {
  const next = nextSectionOf(from)
  if (!next) return null
  return (
    <div className="mt-14 flex justify-center">
      <motion.button
        type="button"
        onClick={() => scrollToSection(next.id)}
        whileHover={{ y: -3, rotate: -2, scale: 1.04 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 400, damping: 14 }}
        className={`group flex items-center gap-2 rounded-full border-2 border-ink px-5 py-2.5 font-display text-sm font-semibold shadow-hard bg-${next.color}`}
      >
        {label ?? `Lanjut ke ${next.label}`}
        <ArrowDown className="size-4 animate-bounce" strokeWidth={3} />
      </motion.button>
    </div>
  )
}
