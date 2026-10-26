import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Download, MessageSquare, Pencil, Trash2, X } from 'lucide-react';
import type { Annotation } from '../../hooks/useArticleAnnotations';
import { calm, durations, easings, useCalmReducedMotion } from '../../lib/motion';

interface WorkspacePanelProps {
  open: boolean;
  onClose: () => void;
  annotations: Annotation[];
  articleSlug: string;
  articleTitle: string;
  openNoteId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateNote: (id: string, note: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

function download(name: string, contents: string) {
  const blob = new Blob([contents], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function WorkspacePanel({
  open,
  onClose,
  annotations,
  articleSlug,
  articleTitle,
  openNoteId,
  onSelect,
  onUpdateNote,
  onRemove,
  onClear,
}: WorkspacePanelProps) {
  const [filter, setFilter] = useState<'all' | 'note' | 'highlight'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  // Re-seed the editor whenever a different annotation is opened. Adjusting
  // state during render (rather than in an effect) avoids painting the
  // previous note's text for a frame.
  const [seededFor, setSeededFor] = useState<string | null>(openNoteId);
  if (seededFor !== openNoteId) {
    setSeededFor(openNoteId);
    setEditingId(null);
    setDraft('');
  }

  const visible = useMemo(() => {
    const sorted = [...annotations].sort((a, b) => a.start - b.start);
    if (filter === 'all') return sorted;
    return sorted.filter((a) => a.kind === filter);
  }, [annotations, filter]);

  const noteCount = annotations.filter((a) => a.kind === 'note').length;
  const reduced = useCalmReducedMotion();

  const exportJson = () =>
    download(
      `${articleSlug}-annotations.json`,
      JSON.stringify({ articleSlug, articleTitle, exportedAt: new Date().toISOString(), annotations }, null, 2),
    );

  // Enter uses the CSS keyframes; AnimatePresence owns a matching exit so the
  // panel slides back out instead of vanishing when it closes.
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.aside
          className="workspace-panel"
          aria-label="Reading workspace"
          exit={reduced ? { opacity: 0 } : { opacity: 0, x: 40 }}
          transition={calm({ duration: durations.medium2, ease: easings.calm }, reduced)}
        >
      <header className="workspace-head">
        <div>
          <p className="eyebrow">Workspace</p>
          <h2>Your annotations</h2>
        </div>
        <button className="workspace-close" onClick={onClose} aria-label="Close workspace">
          <X size={18} />
        </button>
      </header>

      <div className="workspace-toolbar">
        <div className="workspace-filters" role="group" aria-label="Filter annotations">
          {(['all', 'note', 'highlight'] as const).map((key) => (
            <button
              key={key}
              className={filter === key ? 'active' : ''}
              aria-pressed={filter === key}
              onClick={() => setFilter(key)}
            >
              {key}
              <span className="workspace-count">
                {key === 'all' ? annotations.length : annotations.filter((a) => a.kind === key).length}
              </span>
            </button>
          ))}
        </div>
        <button className="workspace-export" onClick={exportJson} disabled={annotations.length === 0}>
          <Download size={13} /> Export
        </button>
      </div>

      <p className="workspace-summary">
        {annotations.length === 0
          ? 'Select any text in the article to highlight it or attach a note.'
          : `${annotations.length} saved · ${noteCount} with notes · stored in this browser only.`}
      </p>

      <div className="workspace-list">
        {visible.length === 0 && annotations.length > 0 && (
          <p className="workspace-empty">Nothing of this kind saved yet.</p>
        )}

        {visible.map((annotation) => (
          <article
            key={annotation.id}
            className={`workspace-item ${annotation.kind === 'note' ? 'is-note' : ''} ${
              openNoteId === annotation.id ? 'is-open' : ''
            }`}
          >
            <button
              className="workspace-item-text"
              onClick={() => onSelect(openNoteId === annotation.id ? null : annotation.id)}
            >
              <span className="workspace-kind">
                {annotation.kind === 'note' ? <MessageSquare size={12} /> : <Pencil size={12} />}
                {annotation.kind}
              </span>
              <q>{annotation.text}</q>
            </button>

            {annotation.note && openNoteId !== annotation.id && (
              <p className="workspace-item-note">{annotation.note}</p>
            )}

            {openNoteId === annotation.id && (
              <form
                className="workspace-note-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  onUpdateNote(annotation.id, draft.trim());
                  setEditingId(null);
                  onSelect(null);
                }}
              >
                <label htmlFor={`note-${annotation.id}`}>Note</label>
                <textarea
                  id={`note-${annotation.id}`}
                  rows={3}
                  autoFocus
                  value={editingId === annotation.id ? draft : (annotation.note ?? '')}
                  placeholder="Why does this matter?"
                  onChange={(event) => {
                    setEditingId(annotation.id);
                    setDraft(event.target.value);
                  }}
                />
                <div className="workspace-note-actions">
                  <button
                    type="button"
                    className="is-ghost"
                    onClick={() => {
                      setEditingId(null);
                      onSelect(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="is-primary">
                    Save note
                  </button>
                </div>
              </form>
            )}

            <button
              className="workspace-item-remove"
              onClick={() => onRemove(annotation.id)}
              aria-label={`Remove annotation on "${annotation.text.slice(0, 40)}"`}
            >
              <Trash2 size={13} />
            </button>
          </article>
        ))}
      </div>

      {annotations.length > 0 && (
        <footer className="workspace-foot">
          <button className="workspace-clear" onClick={onClear}>
            <Trash2 size={13} /> Clear all annotations
          </button>
        </footer>
      )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
