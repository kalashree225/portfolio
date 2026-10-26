import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useSpring } from 'motion/react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, ArrowUpRight, BookOpen, FlaskConical, Highlighter, PanelRight } from 'lucide-react';
import {
  articleBySlug,
  articles,
  projectBySlug,
  wordCountFor,
} from '../config';
import { ArticleRenderer } from '../components/writing/ArticleRenderer';
import { tocFor } from '../lib/articleStructure';
import { ArticleToolbar } from '../components/writing/ArticleToolbar';
import { ContentSelection } from '../components/writing/ContentSelection';
import { WorkspacePanel } from '../components/writing/WorkspacePanel';
import { RelatedConcepts } from '../components/writing/RelatedConcepts';
import { useArticleAnnotations, type SelectionInfo } from '../hooks/useArticleAnnotations';
import { PageHead } from '../components/PageHead';
import type { SelectionAction } from '../components/writing/ActionMenu';

type Mode = 'read' | 'explore' | 'annotate';

export default function Article() {
  const { slug } = useParams();
  const article = slug ? articleBySlug(slug) : undefined;

  const [mode, setMode] = useState<Mode>('read');
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [activeHeading, setActiveHeading] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);

  const bodyRef = useRef<HTMLDivElement>(null);
  const { annotations, add, remove, updateNote, clear, containerRef, openNoteId, setOpenNoteId } =
    useArticleAnnotations(article?.slug ?? 'unknown');
  // Spring-smoothed reading progress — the bar glides instead of stepping.
  const smoothProgress = useSpring(progress, { stiffness: 120, damping: 26, mass: 0.4 });

  const toc = useMemo(() => (article ? tocFor(article) : []), [article]);

  // Reading progress + which section the reader is in.
  useEffect(() => {
    if (!article) return;
    const onScroll = () => {
      const body = bodyRef.current;
      if (!body) return;
      const start = body.offsetTop;
      const total = body.offsetHeight - window.innerHeight;
      const value = total > 0 ? (window.scrollY - start) / total : 0;
      setProgress(Math.min(1, Math.max(0, value)));

      let current: string | null = null;
      toc.forEach((entry) => {
        const element = document.getElementById(entry.id);
        if (element && element.getBoundingClientRect().top <= 140) current = entry.id;
      });
      setActiveHeading(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [article, toc]);

  /**
   * Mode changes come from the toolbar, the rail, and single-key shortcuts.
   * Opening the workspace is part of entering annotate mode rather than a
   * separate effect, so there is one place that decides what a mode means.
   */
  const changeMode = useCallback((next: Mode) => {
    setMode(next);
    if (next === 'annotate') setWorkspaceOpen(true);
  }, []);

  const handleAction = useCallback(
    (action: SelectionAction, selection: SelectionInfo, note?: string) => {
      if (action === 'highlight') {
        add(selection, 'highlight');
        changeMode('annotate');
        setFlash('Highlight saved');
      } else if (action === 'note') {
        add(selection, 'note', note || undefined);
        changeMode('annotate');
        setFlash('Note saved');
      } else if (action === 'copy') {
        void navigator.clipboard.writeText(selection.text).catch(() => undefined);
        setFlash('Copied to clipboard');
      } else if (action === 'quote') {
        const quoted = selection.text
          .split('\n')
          .map((line) => `> ${line}`)
          .join('\n');
        void navigator.clipboard
          .writeText(`${quoted}\n\n— ${article?.title ?? ''}`)
          .catch(() => undefined);
        setFlash('Quote copied');
      }
      if (action === 'highlight' || action === 'note') setOpenNoteId(null);
      window.setTimeout(() => setFlash(null), 2000);
    },
    [add, article, changeMode, setOpenNoteId],
  );

  const jumpTo = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;
    const top = element.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  /**
   * Native find-in-page is the honest implementation here: it uses the
   * browser's own highlighting and scroll behaviour instead of a hand-rolled
   * approximation that would only match rendered text.
   */
  const findInArticle = useCallback(() => {
    const term = window.prompt('Find in this article');
    if (!term) return;
    const found = (window as unknown as { find?: (t: string) => boolean }).find?.(term);
    if (found === false) setFlash(`No match for “${term}”`);
  }, []);

  if (!article) {
    return (
      <div className="page">
        <PageHead eyebrow="Writing" title="That piece doesn't exist.">
          The index lists everything that has actually been written.
        </PageHead>
        <div className="container" style={{ paddingBottom: '90px' }}>
          <Link className="text-link" to="/writing">
            Back to writing <ArrowLeft size={16} />
          </Link>
        </div>
      </div>
    );
  }

  const project = article.projectSlug ? projectBySlug(article.projectSlug) : undefined;
  const index = articles.findIndex((item) => item.slug === article.slug);
  const words = wordCountFor(article.blocks);

  return (
    <div className={`page article-page mode-${mode}`}>
      <div className="reading-progress" aria-hidden="true">
        <motion.span style={{ scaleX: smoothProgress }} />
      </div>

      <ArticleToolbar
        mode={mode}
        onModeChange={changeMode}
        interactive={article.interactive}
        onSearch={findInArticle}
      />

      <div className="article-shell container">
        <nav className="article-rail" aria-label="Article navigation">
          <Link className="back-link" to="/writing">
            <ArrowLeft size={14} /> All writing
          </Link>

          <ol className="article-toc">
            {toc.map((entry) => (
              <li key={entry.id}>
                <button
                  className={activeHeading === entry.id ? 'active' : ''}
                  onClick={() => jumpTo(entry.id)}
                >
                  {entry.text}
                </button>
              </li>
            ))}
          </ol>

          <div className="article-rail-meta">
            <span>{words.toLocaleString()} words</span>
            <span>
              {String(index + 1).padStart(2, '0')} / {String(articles.length).padStart(2, '0')}
            </span>
          </div>

          <div className="article-rail-actions">
            <button
              className={`rail-action ${mode === 'annotate' ? 'active' : ''}`}
              onClick={() => {
                changeMode(mode === 'annotate' ? 'read' : 'annotate');
              }}
            >
              <Highlighter size={14} />
              <span>Annotate</span>
              {annotations.length > 0 && <em>{annotations.length}</em>}
            </button>
            <button className="rail-action" onClick={() => setWorkspaceOpen((open) => !open)}>
              <PanelRight size={14} />
              <span>Workspace</span>
            </button>
            {article.interactive && (
              <button
                className={`rail-action ${mode === 'explore' ? 'active' : ''}`}
                onClick={() => changeMode(mode === 'explore' ? 'read' : 'explore')}
              >
                <FlaskConical size={14} />
                <span>Explore models</span>
              </button>
            )}
          </div>
        </nav>

        <div className="article-main" ref={bodyRef}>
          {mode === 'explore' && !article.interactive && (
            <p className="mode-notice">
              <BookOpen size={15} /> This piece has no interactive model. Reading mode shows everything.
            </p>
          )}

          <ContentSelection
            enabled={mode === 'annotate'}
            onAction={handleAction}
          >
            <div ref={containerRef}>
              <ArticleRenderer article={article} />
            </div>

            {/* Inside the selection container so concept text is annotatable too. */}
            <RelatedConcepts
              conceptSlugs={article.concepts}
              currentArticleSlug={article.slug}
            />
          </ContentSelection>

          {project && (
            <section className="article-next">
              <p className="eyebrow">Source project</p>
              <Link to={`/work/${project.slug}`}>
                <span>{project.name}</span>
                <ArrowUpRight size={24} />
              </Link>
            </section>
          )}
        </div>
      </div>

      <WorkspacePanel
        open={workspaceOpen}
        onClose={() => setWorkspaceOpen(false)}
        annotations={annotations}
        articleSlug={article.slug}
        articleTitle={article.title}
        openNoteId={openNoteId}
        onSelect={(id) => {
          setOpenNoteId(id);
          if (id) {
            const mark = containerRef.current?.querySelector(`mark[data-annotation-id="${id}"]`);
            mark?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }}
        onUpdateNote={updateNote}
        onRemove={remove}
        onClear={clear}
      />

      {flash && (
        <p className="annotation-flash" role="status">
          {flash}
        </p>
      )}
    </div>
  );
}
