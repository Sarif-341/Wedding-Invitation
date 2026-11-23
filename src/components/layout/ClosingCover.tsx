/** Back cover of the scrapbook: thank-you note, monogram, and a "back to cover" button. */
import { useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowUp, Heart } from 'lucide-react'
import { closing, couple } from '../../data/weddingData'
import { gsap, scrollToSection, useGSAP } from '../../lib/gsap'
import { ScrapbookPage } from './ScrapbookPage'

export function ClosingCover() {
  const scope = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.closing-item', {
          y: 50,
          opacity: 0,
          rotate: -5,
          stagger: 0.12,
          duration: 0.8,
          ease: 'back.out(1.8)',
          scrollTrigger: { trigger: scope.current, start: 'top 80%', toggleActions: 'play none none reverse' },
        })
      })
    },
    { scope },
  )

  return (
    <ScrapbookPage id="closing" tint="sun" pageNumber={6} className="pb-36">
      <div ref={scope} className="mx-auto max-w-xl px-6 text-center">
        <p className="closing-item mx-auto grid size-28 rotate-[-6deg] place-items-center rounded-full border-2 border-ink bg-coral font-display text-4xl font-bold text-paper shadow-hard-lg">
          {couple.monogram}
        </p>
        <h2 className="closing-item mt-8 font-display text-4xl font-bold sm:text-5xl">{closing.title}</h2>
        <p className="closing-item mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink/80 sm:text-base">{closing.body}</p>
        <p className="closing-item mt-6 font-hand text-2xl text-ink/70">{closing.signoff}</p>
        <p className="closing-item font-display text-3xl font-bold">
          <span className="text-sage-deep">{couple.groom.nickname}</span>{' '}
          <span className="font-serif-display font-medium italic text-gold-deep">&amp;</span>{' '}
          <span className="text-terra-deep">{couple.bride.nickname}</span>
        </p>

        <div className="closing-item mt-10">
          <motion.button
            type="button"
            onClick={() => scrollToSection('hero')}
            whileHover={{ y: -3, rotate: 2 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 400, damping: 14 }}
            className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-5 py-2.5 font-display text-sm font-semibold shadow-hard"
          >
            <ArrowUp className="size-4" strokeWidth={3} /> {closing.backToTopLabel}
          </motion.button>
        </div>

        <p className="mt-12 flex items-center justify-center gap-1 text-[11px] font-semibold text-ink/50">
          dibuat dengan <Heart className="size-3 fill-coral text-coral" /> untuk {couple.displayName}
        </p>
      </div>
    </ScrapbookPage>
  )
}
