'use client';

import { CheckIcon, ShieldIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import type { CloserPhase } from '@/hooks/useCloserState';
import { CLOSER_CONTENT } from '@/lib/closer-content';

interface CloserHeroProps {
  phase: CloserPhase;
  starting: boolean;
  onStart: () => void;
}

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

/**
 * Marken-/Hero-Spalte (Sektion 6 & 7). Zeigt Eyebrow, Überschrift,
 * Beschreibung, Merkmale, Startbutton und Datenschutzhinweis. Alle Texte
 * stammen aus `CLOSER_CONTENT`. Einstiegsanimationen mit Framer Motion.
 */
export function CloserHero({ phase, starting, onStart }: CloserHeroProps) {
  const isConnected = phase !== 'idle' && phase !== 'connecting';
  const connecting = phase === 'connecting' || starting;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex max-w-xl flex-col items-center text-center md:items-start md:text-left"
    >
      <motion.span
        variants={item}
        className="text-gold font-mono text-[11px] font-bold tracking-[0.22em] uppercase"
      >
        {CLOSER_CONTENT.eyebrow}
      </motion.span>

      <motion.h1
        variants={item}
        className="text-cream mt-4 text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
      >
        <span className="from-gold-light via-gold to-gold-dark bg-gradient-to-br bg-clip-text text-transparent">
          {CLOSER_CONTENT.heading.line1}
        </span>
        <span className="text-cream mt-2 block">{CLOSER_CONTENT.heading.line2}</span>
      </motion.h1>

      <motion.p
        variants={item}
        className="text-cream-muted mt-5 max-w-prose text-base leading-7 text-pretty"
      >
        {CLOSER_CONTENT.description}
      </motion.p>

      <motion.div variants={item} className="mt-8">
        <Button
          size="lg"
          onClick={onStart}
          disabled={connecting || isConnected}
          className="from-gold-light to-gold text-primary-foreground hover:from-gold hover:to-gold-dark h-12 w-full rounded-full bg-gradient-to-b px-8 font-mono text-xs font-bold tracking-wider uppercase shadow-[0_8px_30px_rgba(139,108,255,0.35)] transition-all disabled:opacity-70 sm:w-auto"
        >
          {connecting ? CLOSER_CONTENT.buttons.connecting : CLOSER_CONTENT.buttons.start}
        </Button>
      </motion.div>

      <motion.ul
        variants={item}
        className="mt-8 flex flex-col flex-wrap justify-center gap-x-6 gap-y-2 sm:flex-row md:justify-start"
      >
        {CLOSER_CONTENT.features.map((feature) => (
          <li key={feature} className="text-cream flex items-center gap-2 text-sm">
            <CheckIcon className="text-gold size-4 shrink-0" aria-hidden="true" />
            {feature}
          </li>
        ))}
      </motion.ul>

      <motion.p
        variants={item}
        className="text-cream-muted/80 mt-8 flex items-start gap-2 text-xs leading-5"
      >
        <ShieldIcon className="text-gold-dark mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        <span>{CLOSER_CONTENT.privacyNote}</span>
      </motion.p>
    </motion.div>
  );
}
