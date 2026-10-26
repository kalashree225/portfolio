import { motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router';
import type { Project } from '../config';
import { calm, cinematicMotion, useCalmReducedMotion } from '../lib/motion';

interface ProjectDeckProps {
  projects: Project[];
}

export function ProjectDeck({ projects }: ProjectDeckProps) {
  const reduced = useCalmReducedMotion();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    skipSnaps: false,
    dragFree: false,
  });
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);

  const updateProgress = useCallback(() => {
    if (!emblaApi) return;
    setProgress(emblaApi.scrollProgress());
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
    updateProgress();
  }, [emblaApi, updateProgress]);

  useEffect(() => {
    if (!emblaApi) return;
    // Embla has no state until it is mounted, so the first snap list and
    // selected index can only be synchronised here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSnaps(emblaApi.scrollSnapList());
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('scroll', updateProgress);
    emblaApi.on('reInit', () => {
      setSnaps(emblaApi.scrollSnapList());
      onSelect();
    });
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('scroll', updateProgress);
    };
  }, [emblaApi, onSelect, updateProgress]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!emblaApi) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      if (e.key === 'ArrowRight') emblaApi.scrollNext();
      if (e.key === 'ArrowLeft') emblaApi.scrollPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="deck">
      <div className="deck-viewport" ref={emblaRef}>
        <div className="deck-track">
          {projects.map((project, i) => {
            const active = i === selected;
            const distance = Math.abs(i - selected);
            return (
              <div
                className={`deck-slide ${active ? 'is-active' : ''}`}
                key={project.slug}
                style={{ zIndex: projects.length - distance }}
              >
                <article className={`deck-card glass glass-interactive accent-${project.accent}`}>
                  <div className="deck-body">
                    <div className="deck-top">
                      <span className="deck-index">{String(i + 1).padStart(2, '0')}</span>
                      <span className="deck-cat">
                        {project.category} · {project.year}
                      </span>
                    </div>
                    <h3>{project.name}</h3>
                    <p>{project.summary}</p>
                    <div className="tag-row">
                      {project.stack.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                    <div className="deck-links">
                      <Link className="button button-dark deck-cta" to={`/work/${project.slug}`}>
                        Open case study <ArrowUpRight size={16} />
                      </Link>
                      <a
                        className="deck-ghost"
                        href={project.repo}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        GitHub ↗
                      </a>
                    </div>
                  </div>
                  <motion.div
                    className="deck-visual-shell"
                    initial={{
                      clipPath: reduced ? 'inset(0)' : 'inset(12% 0 0 round 24px)',
                      scale: reduced ? 1 : 1.025,
                    }}
                    whileInView={{ clipPath: 'inset(0)', scale: 1 }}
                    viewport={{ once: true, margin: '-8% 0px' }}
                    transition={calm({
                      duration: cinematicMotion.duration.section,
                      ease: cinematicMotion.ease.enter,
                    }, reduced)}
                  >
                    <Link
                      className="deck-visual"
                      to={`/work/${project.slug}`}
                      aria-label={`Open ${project.name} case study`}
                    >
                      <div className="art-grid" />
                      <div className="art-orbit orbit-one" />
                      <div className="art-orbit orbit-two" />
                      <span className="deck-letter">{project.name.slice(0, 1)}</span>
                      <i className="deck-visual-cat">{project.category}</i>
                      <b className="deck-visual-year">{project.year}</b>
                      <span className="deck-go">
                        <ArrowUpRight size={22} />
                      </span>
                    </Link>
                  </motion.div>
                </article>
              </div>
            );
          })}
        </div>
      </div>

      <div className="deck-ui">
        <div className="deck-nav">
          <button
            className="deck-arrow"
            onClick={scrollPrev}
            disabled={selected === 0}
            aria-label="Previous project"
          >
            <ArrowLeft size={18} />
          </button>
          <button
            className="deck-arrow"
            onClick={scrollNext}
            disabled={selected === snaps.length - 1}
            aria-label="Next project"
          >
            <ArrowRight size={18} />
          </button>
        </div>
        <div className="deck-counter">
          <strong>{String(selected + 1).padStart(2, '0')}</strong>
          <span> / {String(snaps.length || projects.length).padStart(2, '0')}</span>
        </div>
        <div className="deck-progress" aria-hidden="true">
          <motion.div
            className="deck-progress-fill"
            animate={{ scaleX: progress || (selected + 1) / projects.length }}
            transition={{ duration: 0.15, ease: 'linear' }}
          />
        </div>
        <div className="deck-dots" role="group" aria-label="Choose project card">
          {snaps.map((_, i) => (
            <button
              key={i}
              className={`deck-dot ${i === selected ? 'is-on' : ''}`}
              onClick={() => emblaApi?.scrollTo(i)}
              aria-label={`Go to card ${i + 1}`}
              aria-current={i === selected ? 'true' : undefined}
            />
          ))}
        </div>
        <p className="deck-hint">Drag · Scroll · Use arrows</p>
      </div>
    </div>
  );
}
