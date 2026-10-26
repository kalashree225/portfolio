import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, Clock, ExternalLink, Layers } from 'lucide-react';
import { Link } from 'react-router';
import {
  articleBySlug,
  articles,
  conceptBySlug,
  concepts,
  notes,
  projects,
  readingTimeFor,
  site,
  wordCountFor,
  type NoteStatus,
  type ProjectCategory,
} from '../config';
import { Reveal } from '../components/Reveal';
import { PageHead } from '../components/PageHead';
import { ListItem, Pill } from '../components/motion/primitives';

const statusColumns: NoteStatus[] = ['Drafting', 'Planned'];
const categoryFilters: Array<'All' | ProjectCategory> = ['All', 'AI & backend', 'Data', 'Tools', 'Frontend'];

/** Curated routes through the writing, for readers who arrive with a question. */
const readingPaths = [
  {
    title: 'Start with boundaries',
    detail: 'Where requests enter, what the gateway owns, and how to keep business logic out of it.',
    articles: ['designing-a-production-api', 'transactional-boundaries-prevent-drift'],
    concepts: ['api-gateway', 'transactions'],
  },
  {
    title: 'Make data trustworthy',
    detail: 'Contract-first pipelines and the checks that stop a wrong number from rendering.',
    articles: ['etl-pipelines-people-trust'],
    concepts: ['etl', 'evaluation'],
  },
  {
    title: 'Explain the design',
    detail: 'Turning a system into a diagram a reader can inspect, not just admire.',
    articles: ['diagrams-as-data'],
    concepts: ['dependency-graphs', 'diagrams-as-structured-data'],
  },
];

export default function Writing() {
  const [category, setCategory] = useState<(typeof categoryFilters)[number]>('All');

  const filteredNotes = useMemo(
    () => (category === 'All' ? notes : notes.filter((note) => note.category === category)),
    [category],
  );

  const filteredArticles = useMemo(
    () => (category === 'All' ? articles : articles.filter((article) => article.topics.includes(category))),
    [category],
  );

  const projectName = (slug: string) => projects.find((project) => project.slug === slug)?.name ?? slug;
  const wordTotal = articles.reduce((total, article) => total + wordCountFor(article.blocks), 0);

  return (
    <div className="page writing-page">
      <PageHead eyebrow="Writing" title="Notes from the work, written in the open.">
        Essays on backend reliability, data contracts, and interface craft. Finished pieces are
        listed as written; ideas are listed as ideas, with the smallest implementation that would
        make each one worth reading.
      </PageHead>

      <section className="container">
        <Reveal>
          <div className="honesty-strip">
            <span className="honesty-dot" />
            <p>
              <strong>
                {articles.length} pieces written · {notes.length} ideas not yet written.
              </strong>{' '}
              {wordTotal.toLocaleString()} words across {articles.length} essays, each grounded in
              systems I have built. Follow along on{' '}
              <a href={site.github} target="_blank" rel="noopener noreferrer">
                GitHub <ExternalLink size={12} />
              </a>{' '}
              or <Link to="/contact">suggest a topic</Link>.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="container writing-controls">
        <div className="filter-row compact-filters" role="group" aria-label="Filter by category">
          {categoryFilters.map((item) => (
            <button
              className={category === item ? 'active' : ''}
              key={item}
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
            >
              {category === item && <Pill id="writing-filter-pill" />}
              <span className="pill-label">{item}</span>
            </button>
          ))}
        </div>
        <span className="count-note" aria-live="polite">
          {filteredArticles.length} written · {filteredNotes.length} planned
        </span>
      </section>

      {/* Written pieces — these have bodies, so they are listed first. */}
      <section className="container written-list-section">
        <h2 className="writing-section-title">
          Written <span>{filteredArticles.length}</span>
        </h2>
        {filteredArticles.length === 0 ? (
          <p className="pipeline-empty">No written pieces in this filter yet.</p>
        ) : (
          <motion.div layout className="written-list">
            <AnimatePresence mode="popLayout" initial={false}>
              {filteredArticles.map((article, i) => (
                <ListItem key={article.slug}>
                  <Link to={`/writing/notes/${article.slug}`} className="written-card">
                  <span className="written-index">{String(i + 1).padStart(2, '0')}</span>
                  <span className="written-main">
                    <span className="written-topics">
                      {article.topics.map((topic) => (
                        <span key={topic} className="topic-pill">
                          {topic}
                        </span>
                      ))}
                      {article.interactive && (
                        <span className="topic-pill is-interactive">
                          <Layers size={11} /> interactive
                        </span>
                      )}
                    </span>
                    <strong className="written-title">{article.title}</strong>
                    <span className="written-desc">{article.description}</span>
                    <span className="written-meta">
                      <Clock size={12} /> {readingTimeFor(article.blocks)}
                      {article.projectSlug && (
                        <em>· from {projectName(article.projectSlug)}</em>
                      )}
                    </span>
                  </span>
                  <span className="written-arrow">
                    <ArrowUpRight size={20} />
                  </span>
                </Link>
              </ListItem>
            ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      {/* Ideas — no bodies, no dates, clearly labelled. */}
      <section className="container pipeline-section">
        <h2 className="writing-section-title">
          Ideas, not yet written <span>{notes.length}</span>
        </h2>
        <div className="pipeline">
          {statusColumns.map((status) => {
            const cards = filteredNotes.filter((note) => note.status === status);
            return (
              <div className="pipeline-col" key={status}>
                <header>
                  <span className={`status-pill status-${status.toLowerCase()}`}>{status}</span>
                  <span className="pipeline-count">{cards.length}</span>
                </header>
                <div className="pipeline-cards">
                  {cards.length === 0 && (
                    <p className="pipeline-empty">Nothing in this column for this filter.</p>
                  )}
                  <AnimatePresence mode="popLayout" initial={false}>
                    {cards.map((note) => (
                      <ListItem key={note.slug}>
                        <article className="note-card">
                        <p className="eyebrow tiny">{note.category}</p>
                        <h3>{note.title}</h3>
                        <p className="note-question">“{note.question}”</p>
                        <p className="note-implementation">
                          <strong>Smallest useful build</strong>
                          {note.implementation}
                        </p>
                        <ul>
                          {note.outline.map((point) => (
                            <li key={point}>{point}</li>
                          ))}
                        </ul>
                        <footer>
                          {note.projectSlug ? (
                            <Link to={`/work/${note.projectSlug}`}>
                              {projectName(note.projectSlug)} <ArrowUpRight size={14} />
                            </Link>
                          ) : (
                            <span className="note-topic">{note.category}</span>
                          )}
                          <Link className="note-request" to="/contact">
                            Request this
                          </Link>
                        </footer>
                      </article>
                    </ListItem>
                  ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="container concept-strip-section">
        <Reveal>
          <div className="source-map-head">
            <div>
              <p className="eyebrow">Concept index</p>
              <h2>Every term, and where it is used.</h2>
            </div>
            <p>Concepts link the essays together and show how the ideas connect.</p>
          </div>
          <div className="concept-index">
            {concepts.map((concept) => (
              <Link key={concept.slug} to={`/writing/concepts/${concept.slug}`}>
                {concept.title}
                <span>{concept.relatedArticles.length}</span>
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="container reading-paths-section">
        <Reveal>
          <div className="source-map-head">
            <div>
              <p className="eyebrow">Reading paths</p>
              <h2>Three ways into the writing.</h2>
            </div>
            <p>Short sequences for the question you arrived with.</p>
          </div>
          <div className="reading-paths">
            {readingPaths.map((path, index) => (
              <article className="reading-path" key={path.title}>
                <span className="reading-path-index">{String(index + 1).padStart(2, '0')}</span>
                <h3>{path.title}</h3>
                <p>{path.detail}</p>
                <div className="reading-path-links">
                  {path.articles.map((slug) => {
                    const article = articleBySlug(slug);
                    return article ? (
                      <Link key={slug} to={`/writing/notes/${slug}`}>
                        {article.title}
                      </Link>
                    ) : null;
                  })}
                  {path.concepts.map((slug) => {
                    const concept = conceptBySlug(slug);
                    return concept ? (
                      <Link key={slug} className="is-concept" to={`/writing/concepts/${slug}`}>
                        {concept.title}
                      </Link>
                    ) : null;
                  })}
                </div>
              </article>
            ))}
          </div>
        </Reveal>
      </section>
    </div>
  );
}
