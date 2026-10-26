import { Link, useParams } from 'react-router';
import { ArrowLeft, ArrowUpRight, GitBranch } from 'lucide-react';
import {
  articleBySlug,
  conceptBySlug,
  concepts,
  projectBySlug,
  readingTimeFor,
  type ConceptRelation,
} from '../config';
import { PageHead } from '../components/PageHead';
import { Reveal } from '../components/Reveal';

const RELATION_LABELS: Record<ConceptRelation['type'], string> = {
  'related-to': 'Related to',
  'prerequisite-for': 'Prerequisite for',
  'alternative-to': 'Alternative to',
  explains: 'Explains',
  'expands-on': 'Expands on',
  'tradeoff-of': 'Trade-off of',
  'implementation-of': 'Implementation of',
};

export default function Concept() {
  const { slug } = useParams();
  const concept = slug ? conceptBySlug(slug) : undefined;

  if (!concept) {
    return (
      <div className="page">
        <PageHead eyebrow="Concepts" title="No concept by that name.">
          The concept index lists every term used across the writing.
        </PageHead>
        <div className="container" style={{ paddingBottom: '90px' }}>
          <Link className="text-link" to="/writing">
            Back to writing <ArrowLeft size={16} />
          </Link>
        </div>
      </div>
    );
  }

  const written = concept.relatedArticles
    .map((articleSlug) => articleBySlug(articleSlug))
    .filter((article): article is NonNullable<typeof article> => Boolean(article));

  // Only relations whose target actually exists are rendered.
  const outgoing = concept.relations
    .map((relation) => ({ relation, target: conceptBySlug(relation.target) }))
    .filter((entry): entry is { relation: ConceptRelation; target: NonNullable<ReturnType<typeof conceptBySlug>> } =>
      Boolean(entry.target),
    );

  const incoming = concepts.flatMap((other) =>
    other.relations
      .filter((relation) => relation.target === concept.slug)
      .map((relation) => ({ relation, source: other })),
  );

  const relatedProjects = Array.from(
    new Set(
      written
        .map((article) => article.projectSlug)
        .filter((projectSlug): projectSlug is string => Boolean(projectSlug)),
    ),
  )
    .map((projectSlug) => projectBySlug(projectSlug))
    .filter((project): project is NonNullable<typeof project> => Boolean(project));

  const index = concepts.findIndex((item) => item.slug === concept.slug);
  const position = `${String(index + 1).padStart(2, '0')} / ${String(concepts.length).padStart(2, '0')}`;

  return (
    <div className="page concept-page">
      <section className="container concept-hero">
        <Link className="back-link" to="/writing">
          <ArrowLeft size={14} /> All writing
        </Link>
        <p className="eyebrow">
          <GitBranch size={12} /> Concept · {position}
        </p>
        <h1 className="page-title">{concept.title}</h1>
        <p className="page-lede">{concept.description}</p>
      </section>

      <section className="container concept-columns">
        <div className="concept-column">
          <h2 className="concept-column-title">Written about in</h2>
          {written.length === 0 ? (
            <p className="concept-empty">
              No finished piece references this concept yet. It is listed because the planned notes
              below will need it.
            </p>
          ) : (
            <ul className="concept-article-list">
              {written.map((article) => (
                <li key={article.slug}>
                  <Link to={`/writing/notes/${article.slug}`}>
                    <span className="concept-article-topic">{article.topics[0]}</span>
                    <strong>{article.title}</strong>
                    <span className="concept-article-desc">{article.description}</span>
                    <span className="concept-article-time">
                      {readingTimeFor(article.blocks)} <ArrowUpRight size={13} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="concept-column">
          <h2 className="concept-column-title">Connections</h2>
          {outgoing.length === 0 && incoming.length === 0 ? (
            <p className="concept-empty">This concept stands alone so far.</p>
          ) : (
            <ul className="relation-list">
              {outgoing.map(({ relation, target }) => (
                <li key={`out-${relation.target}-${relation.type}`}>
                  <span className={`relation-tag relation-${relation.type}`}>
                    {RELATION_LABELS[relation.type]}
                  </span>
                  <Link to={`/writing/concepts/${target.slug}`}>{target.title}</Link>
                </li>
              ))}
              {incoming.map(({ relation, source }) => (
                <li key={`in-${source.slug}-${relation.type}`}>
                  <span className="relation-tag relation-incoming">Referenced by</span>
                  <Link to={`/writing/concepts/${source.slug}`}>{source.title}</Link>
                </li>
              ))}
            </ul>
          )}

          {relatedProjects.length > 0 && (
            <>
              <h2 className="concept-column-title spaced">Where it comes from</h2>
              <ul className="concept-project-list">
                {relatedProjects.map((project) => (
                  <li key={project.slug}>
                    <Link to={`/work/${project.slug}`}>
                      <span>{project.name}</span>
                      <em>{project.category} · {project.year}</em>
                      <ArrowUpRight size={13} />
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>

      <section className="container concept-index-section">
        <Reveal>
          <h2 className="concept-column-title">All concepts</h2>
          <div className="concept-index">
            {concepts.map((item) => (
              <Link
                key={item.slug}
                to={`/writing/concepts/${item.slug}`}
                className={item.slug === concept.slug ? 'is-current' : ''}
                aria-current={item.slug === concept.slug ? 'page' : undefined}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </Reveal>
      </section>
    </div>
  );
}
