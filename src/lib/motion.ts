/* ============================================================================
   MOTION.ED — calm motion tokens bridged to motion.dev
   Editorial rule: motion is quiet, purposeful, and respectful.
   - No particles, bounces, or loops that fight for attention.
   - Every transition maps to a CSS token in theme.css, so the design
     system stays the source of truth and motion cannot drift.
   - prefers-reduced-motion always wins: durations collapse to ~0.
   ========================================================================== */

import { useReducedMotion } from 'motion/react';

export type MotionCurve = [number, number, number, number];

export const cinematicMotion = {
  duration: {
    micro: 0.14,
    control: 0.22,
    section: 0.62,
    hero: 0.78,
    scene: 0.9,
    stagger: 0.09,
  },
  ease: {
    enter: [0.16, 1, 0.3, 1] as MotionCurve,
    camera: [0.65, 0, 0.35, 1] as MotionCurve,
    standard: [0.2, 0, 0, 1] as MotionCurve,
  },
} as const;

/** Cubic-bezier ramps — mirrors --motion-* in theme.css */
export const easings: Record<string, [number, number, number, number]> = {
  emphasized: [0.05, 0.7, 0.1, 1],
  standard: [0.2, 0, 0, 1],
  accelerated: [0.3, 0, 1, 1],
  /** Signature editorial ease: calm entrance, no overshoot */
  calm: [0.16, 1, 0.3, 1],
};

export type EasingName = 'emphasized' | 'standard' | 'accelerated' | 'calm';

/** Durations in seconds — mirrors --duration-* in theme.css */
export const durations = {
  short2: 0.1,
  short4: 0.2,
  medium1: 0.25,
  medium2: 0.3,
  medium4: 0.4,
  long2: 0.5,
  long4: 0.9,
} as const;

/** Ready-made transitions for common editorial moments */
export const transitions = {
  route: { duration: durations.medium4, ease: easings.calm },
  reveal: { duration: durations.long4, ease: easings.calm },
  lift: { duration: durations.medium2, ease: easings.calm },
  tap: { duration: durations.short4, ease: easings.standard },
  progress: { duration: durations.short2, ease: easings.standard },
} as const;

/** Shared variants — fade + rise, never slide far */
export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

export const fadeOnly = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const staggerParent = (stagger = 0.08, delayChildren = 0.05) => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren } },
});

export const staggerChild = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.medium4, ease: easings.calm },
  },
};

/**
 * Returns true when the OS asks for reduced motion.
 * All Motion.Ed primitives check this and render instantly.
 */
export function useCalmReducedMotion(): boolean {
  return useReducedMotion() ?? false;
}

/** Collapse any transition to instant when reduced motion is on */
export function calm<T extends { duration?: number; delay?: number }>(
  transition: T,
  reduced: boolean,
): T {
  if (!reduced) return transition;
  return { ...transition, duration: 0.01, delay: 0 };
}
