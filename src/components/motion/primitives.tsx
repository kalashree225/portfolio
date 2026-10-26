import { AnimatePresence, motion } from 'motion/react';
import type { CSSProperties, ReactNode } from 'react';
import { calm, durations, easings, useCalmReducedMotion } from '../../lib/motion';

/* ============================================================================
   Shared micro-motion primitives — one language for every menu, dialog,
   tab, filter, and list on the site. All durations/easings come from
   lib/motion.ts (mirrors theme.css); reduced motion renders instantly.
   ========================================================================== */

/** Height-expanding presence for menus and dropdowns (mobile nav, toolbar). */
export function Expand({
  open,
  children,
  className,
  style,
}: {
  open: boolean;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const reduced = useCalmReducedMotion();
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          className={className}
          style={{ overflow: 'hidden', ...style }}
          initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
          animate={reduced ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
          exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
          transition={calm({ duration: durations.medium2, ease: easings.calm }, reduced)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Small popover presence — fades/scales from its anchor edge. */
export function Pop({
  open,
  children,
  className,
  origin = 'top right',
}: {
  open: boolean;
  children: ReactNode;
  className?: string;
  origin?: string;
}) {
  const reduced = useCalmReducedMotion();
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          className={className}
          style={{ transformOrigin: origin }}
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: -4 }}
          transition={calm({ duration: durations.short4, ease: easings.standard }, reduced)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Sliding indicator shared across a control group via layoutId.
 * Render inside the active button/tab behind its label — the pill glides
 * between options instead of blinking. Falls back to a static fill when
 * reduced motion is on.
 */
export function Pill({ id, className = 'motion-pill' }: { id: string; className?: string }) {
  const reduced = useCalmReducedMotion();
  if (reduced) return <span className={className} />;
  return (
    <motion.span
      layoutId={id}
      className={className}
      transition={calm({ duration: durations.medium2, ease: easings.calm }, false)}
    />
  );
}

/**
 * Filterable list item — glides to its new slot on reorder (layout),
 * rises in on first scroll into view, and shrinks out on removal.
 * Wrap the list in <motion.div layout> + <AnimatePresence mode="popLayout">.
 */
export function ListItem({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const reduced = useCalmReducedMotion();
  return (
    <motion.div layout className={className} style={style}>
      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-6% 0px' }}
        exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
        transition={calm({ duration: durations.medium4, ease: easings.calm }, reduced)}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/** Crossfade swap for mutually exclusive states (form ⇄ success). */
export function Swap({
  pane,
  children,
  className,
}: {
  pane: string;
  children: ReactNode;
  className?: string;
}) {
  const reduced = useCalmReducedMotion();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pane}
        className={className}
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
        transition={calm({ duration: durations.medium1, ease: easings.calm }, reduced)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
