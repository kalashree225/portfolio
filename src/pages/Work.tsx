import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router';
import { projects, type ProjectCategory } from '../config';
import { PageHead } from '../components/PageHead';
import { ListItem, Pill } from '../components/motion/primitives';
import { calm, cinematicMotion, useCalmReducedMotion } from '../lib/motion';

const categories = Array.from(new Set(projects.map((project) => project.category)));
const filters: Array<'All' | ProjectCategory> = ['All', ...categories];

export default function Work() {
  const reduced = useCalmReducedMotion();
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const visible = filter === 'All' ? projects : projects.filter((project) => project.category === filter);

  return (
    <div className="page">
      <PageHead eyebrow="Selected work" title="Projects with a point of view.">
        A growing portfolio of intelligent backends, data systems, and developer tools built with precision.
      </PageHead>

      <section className="section container work-list">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          {categories.length > 1 ? (
            <div className="filter-row" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }} role="group" aria-label="Filter projects by category">
              {filters.map((item) => (
                <button
                  className={filter === item ? 'active' : ''}
                  key={item}
                  onClick={() => setFilter(item)}
                  aria-pressed={filter === item}
                >
                  {filter === item && <Pill id="work-filter-pill" />}
                  <span className="pill-label">{item}</span>
                </button>
              ))}
            </div>
          ) : null}

          <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }} aria-live="polite">
            Showing {visible.length} of {projects.length} {projects.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        <motion.div layout className="work-large-list">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((project, i) => (
              <ListItem key={project.slug}>
                <Link to={`/work/${project.slug}`} className={`work-large-card glass glass-interactive accent-${project.accent}`}>
                  <span className="work-large-index">{String(i + 1).padStart(2, '0')}</span>
                  <span className="work-large-main">
                    <span className="eyebrow">
                      {project.category} · {project.year}
                    </span>
                    <span className="work-large-title">{project.name}</span>
                    <span className="work-large-summary">{project.summary}</span>
                    <span className="tag-row">
                      {project.stack.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </span>
                  </span>
                  <motion.span
                    className="work-large-visual"
                    aria-hidden="true"
                    initial={{
                      clipPath: reduced ? 'inset(0)' : 'inset(14% 0 0 round 16px)',
                      scale: reduced ? 1 : 1.025,
                    }}
                    whileInView={{ clipPath: 'inset(0)', scale: 1 }}
                    viewport={{ once: true, margin: '-8% 0px' }}
                    transition={calm({
                      duration: cinematicMotion.duration.section,
                      ease: cinematicMotion.ease.enter,
                    }, reduced)}
                  >
                    <span className="art-grid" />
                    <span className="art-orbit orbit-one" />
                    <span className="work-large-letter">{project.name.slice(0, 1)}</span>
                  </motion.span>
                  <span className="work-large-arrow">
                    <ArrowUpRight size={24} />
                  </span>
                </Link>
              </ListItem>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>
    </div>
  );
}
