import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowUpRight, Check, Copy, ExternalLink, Layers } from 'lucide-react';
import {
  articles,
  conceptBySlug,
  diagramById,
  experimentById,
  projectBySlug,
  readingTimeFor,
  type Article,
  type ArticleBlock,
} from '../../config';
import { DiagramRenderer } from './DiagramRenderer';
import { ExperimentHost } from './ExperimentHost';
import { slugifyHeading } from '../../lib/articleStructure';

function CodeBlock({ block }: { block: ArticleBlock }) {
  const [copied, setCopied] = useState(false);
  const language = (block.meta?.language as string) || 'text';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(block.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="article-code-block" data-block-id={block.id}>
      <div className="code-header">
        <span className="code-lang">{language}</span>
        <button className="code-copy" onClick={copy} aria-label={copied ? 'Copied' : 'Copy code'}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre>
        <code data-language={language}>{block.content}</code>
      </pre>
    </div>
  );
}

function DataTable({ block }: { block: ArticleBlock }) {
  const columns = (block.meta?.columns as string[]) ?? [];
  const rows = (block.meta?.rows as string[][]) ?? [];
  const caption = block.meta?.caption as string | undefined;

  if (columns.length === 0) return null;

  return (
    <figure className="article-table" data-block-id={block.id}>
      {caption && <figcaption>{caption}</figcaption>}
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

interface ArticleRendererProps {
  article: Article;
  className?: string;
}

export function ArticleRenderer({ article, className = '' }: ArticleRendererProps) {
  const navigate = useNavigate();
  const project = article.projectSlug ? projectBySlug(article.projectSlug) : undefined;

  const renderBlock = (block: ArticleBlock) => {
    switch (block.type) {
      case 'paragraph':
        return (
          <p key={block.id} className="article-paragraph" data-block-id={block.id}>
            {block.content}
          </p>
        );

      case 'heading':
        return (
          <h2
            key={block.id}
            id={slugifyHeading(block.content)}
            className="article-heading"
            data-block-id={block.id}
            tabIndex={-1}
          >
            {block.content}
          </h2>
        );

      case 'code':
        return <CodeBlock key={block.id} block={block} />;

      case 'quote':
        return (
          <blockquote key={block.id} className="article-quote" data-block-id={block.id}>
            {block.content}
          </blockquote>
        );

      case 'table':
        return <DataTable key={block.id} block={block} />;

      case 'callout':
        return (
          <aside
            key={block.id}
            className={`article-callout variant-${(block.meta?.variant as string) || 'note'}`}
            data-block-id={block.id}
          >
            {block.content}
          </aside>
        );

      case 'diagram': {
        const diagramId = block.meta?.diagramId as string;
        return diagramById(diagramId) ? (
          <DiagramRenderer key={block.id} diagramId={diagramId} />
        ) : (
          <div key={block.id} className="diagram-missing" role="note">
            Diagram <code>{diagramId}</code> is not defined.
          </div>
        );
      }

      case 'interactive': {
        const experimentId = block.meta?.experimentId as string;
        const experiment = experimentById(experimentId);
        return experiment ? <ExperimentHost key={block.id} experiment={experiment} /> : null;
      }

      default:
        return (
          <p key={block.id} className="article-paragraph" data-block-id={block.id}>
            {block.content}
          </p>
        );
    }
  };

  const related = article.concepts
    .map((slug) => conceptBySlug(slug))
    .filter((concept): concept is NonNullable<typeof concept> => Boolean(concept));

  const moreReading = articles.filter((other) => other.slug !== article.slug).slice(0, 3);

  return (
    <article className={`article-content ${className}`}>
      <header className="article-header">
        <div className="article-meta">
          <span className="article-topics">
            {article.topics.map((topic) => (
              <span key={topic} className="topic-pill">
                {topic}
              </span>
            ))}
          </span>
          <span className="article-reading-time">{readingTimeFor(article.blocks)}</span>
        </div>

        <h1 className="article-title">{article.title}</h1>
        <p className="article-description">{article.description}</p>

        <div className="article-byline">
          {article.date ? (
            <time dateTime={article.date}>
              {new Date(article.date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
          ) : (
            <span className="byline-undated">Working note — undated by choice</span>
          )}
          {article.updated && article.date && (
            <span>
              Updated{' '}
              {new Date(article.updated).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          )}
        </div>

        {project && (
          <button className="article-source" onClick={() => navigate(`/work/${project.slug}`)}>
            <Layers size={14} />
            <span>
              From the project <strong>{project.name}</strong>
            </span>
            <ArrowUpRight size={14} />
          </button>
        )}
      </header>

      <div className="article-blocks">
        {article.blocks.map((block) => renderBlock(block))}
      </div>

      {related.length > 0 && (
        <section className="article-concepts" aria-labelledby="article-concepts-title">
          <h2 id="article-concepts-title" className="article-concepts-title">
            Concepts in this piece
          </h2>
          <div className="concept-chips">
            {related.map((concept) => (
              <Link key={concept.slug} to={`/writing/concepts/${concept.slug}`} className="concept-chip">
                {concept.title}
                <ArrowUpRight size={13} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {project && (
        <section className="article-repo">
          <div>
            <p className="eyebrow">Read the source</p>
            <p>
              The claims in this piece come from work in {project.name}. The repository is public, so
              they can be checked rather than taken on trust.
            </p>
          </div>
          <a
            className="button button-dark"
            href={project.repo}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open {project.name} <ExternalLink size={15} />
          </a>
        </section>
      )}

      <section className="article-more">
        <h2 className="article-concepts-title">Keep reading</h2>
        <div className="article-more-list">
          {moreReading.map((other) => (
            <Link key={other.slug} to={`/writing/notes/${other.slug}`} className="article-more-card">
              <span className="eyebrow">{other.topics[0]}</span>
              <strong>{other.title}</strong>
              <span className="article-more-desc">{other.description}</span>
              <span className="article-more-time">
                {readingTimeFor(other.blocks)} <ArrowUpRight size={13} />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
