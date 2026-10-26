import { useEffect } from 'react';
import { getGsap, prefersReducedMotion } from '../lib/gsap-setup';

/**
 * Site-wide calm GSAP scroll effects — scroll-linked moments only.
 * Entrances and gestures belong to motion.dev (see lib/motion.ts);
 * GSAP owns what it does best: scrubbed parallax and honest count-ups.
 *
 * - Any `[data-gsap="parallax"]` element drifts gently on scroll.
 *   Tune distance with `data-gsap-amount` (default 60px).
 * - Home signal-strip numbers count up to their real values once in view.
 * - Everything skips when the OS asks for reduced motion.
 */
export function useGsapSite() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const gsap = getGsap();

    const ctx = gsap.context(() => {
      // 1. Generic scrub parallax for opted-in visuals.
      gsap.utils.toArray<HTMLElement>('[data-gsap="parallax"]').forEach((el) => {
        const amount = Number(el.dataset.gsapAmount || '60');
        gsap.to(el, {
          y: amount,
          ease: 'none',
          scrollTrigger: {
            trigger: el.closest('section') ?? el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6,
          },
        });
      });

      // 2. Home hero visual — drifts as the hero scrolls away.
      const heroVisual = document.querySelector('.home-page .hero-visual');
      if (heroVisual && !heroVisual.hasAttribute('data-gsap')) {
        gsap.to(heroVisual, {
          y: 90,
          ease: 'none',
          scrollTrigger: {
            trigger: '.home-page .hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 0.6,
          },
        });
      }

      // 3. Home signal strip — quiet rise + count-up to the real figure, once.
      const cards = gsap.utils.toArray<HTMLElement>('.home-page .signal-strip > div');
      cards.forEach((card, i) => {
        const num = card.querySelector<HTMLElement>('[data-gsap-count]');
        const target = num ? Number(num.dataset.gsapCount || '0') : 0;

        const tl = gsap.timeline({
          scrollTrigger: { trigger: card, start: 'top 88%', once: true },
          delay: i * 0.08,
        });
        tl.from(card, { y: 26, opacity: 0, duration: 0.7, ease: 'power3.out' });
        if (num && target > 0) {
          const state = { value: 0 };
          tl.to(
            state,
            {
              value: target,
              duration: 1.1,
              ease: 'power2.out',
              onUpdate: () => {
                num.textContent = String(Math.round(state.value)).padStart(2, '0');
              },
            },
            '<',
          );
        }
      });
    });

    return () => ctx.revert();
  }, []);
}
