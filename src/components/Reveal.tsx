import type { CSSProperties, ReactNode } from 'react';
import { motion } from 'motion/react';
import { calm, cinematicMotion, useCalmReducedMotion } from '../lib/motion';

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Reveal — now powered by motion.dev (Motion.Ed upgrade).
 * Same props as before, so all call sites keep working.
 * Renders instantly when the OS asks for reduced motion.
 */
export function Reveal({ children, delay = 0, y = 16, className = '', style }: RevealProps) {
  const reduced = useCalmReducedMotion();
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: reduced ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={calm(
        {
          duration: cinematicMotion.duration.section,
          ease: cinematicMotion.ease.enter,
          delay: delay / 1000,
        },
        reduced,
      )}
    >
      {children}
    </motion.div>
  );
}
