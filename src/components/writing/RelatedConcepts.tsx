import { Link } from 'react-router';
import { ArrowUpRight, GitBranch } from 'lucide-react';
import { articleBySlug, conceptBySlug, readingTimeFor, type ConceptRelation } from '../../config';

interface RelatedConceptsProps {
  conceptSlugs: string[];
  currentArticleSlug?: string;
}

function formatRelationType(type: ConceptRelation['type']): string {
  const labels: Record<ConceptRelation['type'], string> = {
    'related-to': 'related',
    'prerequisite-for': 'prerequisite',
    'alternative-to': 'alternative',
    explains: 'explains',
    'expands-on': 'expands',
    'tradeoff-of': 'tradeoff',
    'implementation-of': 'implements',
  };
  return labels[type] ?? type;
}

export function RelatedConcepts({ conceptSlugs, currentArticleSlug }: RelatedConceptsProps) {
  const resolved = conceptSlugs
    .map((slug) => conceptBySlug(slug))
    .filter((concept): concept is NonNullable<typeof concept> => Boolean(concept));

  if (resolved.length === 0) return null;

  const inGroup = new Set(conceptSlugs);

  return (
    <section className="related-concepts" aria-labelledby="related-concepts-title">
      <header className="related-concepts-head">
        <h2 id="related-concepts-title">
          <GitBranch size={16} /> Concepts in this piece
        </h2>
        <p>Each concept links to the other writing that uses it.</p>
      </header>

      <div className="concept-graph">
        {resolved.map((concept) => {
          const relations = concept.relations.filter((relation) => inGroup.has(relation.target));
          const others = concept.relatedArticles.filter((slug) => slug !== currentArticleSlug);

          return (
            <article key={concept.slug} className="concept-card">
              <Link to={`/writing/concepts/${concept.slug}`} className="concept-link">
                <h3>{concept.title}</h3>
                <p>{concept.description}</p>
              </Link>

              {relations.length > 0 && (
                <ul className="concept-relations">
                  {relations.map((relation) => {
                    const target = conceptBySlug(relation.target);
                    return (
                      <li
                        key={`${relation.target}-${relation.type}`}
                        className={`relation-tag relation-${relation.type}`}
                      >
                        <span>{formatRelationType(relation.type)}</span>
                        <Link to={`/writing/concepts/${relation.target}`}>
                          {target?.title ?? relation.target}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}

              {others.length > 0 && (
                <div className="concept-articles">
                  {others.map((slug) => {
                    const other = articleBySlug(slug);
                    if (!other) return null;
                    return (
                      <Link key={slug} to={`/writing/notes/${slug}`} className="related-article-link">
                        <span>{other.title}</span>
                        <em>{readingTimeFor(other.blocks)}</em>
                        <ArrowUpRight size={12} />
                      </Link>
                    );
                  })}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
