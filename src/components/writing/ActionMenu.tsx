import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Check, Copy, Highlighter, MessageSquarePlus, Quote, X } from 'lucide-react';

export interface SelectionContext {
  type: 'text' | 'code' | 'table';
  text: string;
  blockId?: string;
  codeLanguage?: string;
}

export type SelectionAction = 'highlight' | 'note' | 'copy' | 'quote';

interface ActionMenuProps {
  context: SelectionContext;
  /** Viewport coordinates of the selection, used to place the menu. */
  position: { x: number; y: number };
  onAction: (action: SelectionAction, note?: string) => void;
  onClose: () => void;
}

export function ActionMenu({ context, position, onAction, onClose }: ActionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'actions' | 'note'>('actions');
  const [note, setNote] = useState('');
  const [copied, setCopied] = useState(false);
  // Place optimistically, then correct once the menu has been measured.
  const [placement, setPlacement] = useState({ left: position.x, top: position.y, ready: false });

  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    const rect = menu.getBoundingClientRect();
    const margin = 12;
    const left = Math.min(
      Math.max(rect.width / 2 + margin, position.x),
      window.innerWidth - rect.width / 2 - margin,
    );
    const preferredTop = position.y - rect.height - margin;
    const top = preferredTop < margin ? position.y + 26 : preferredTop;
    setPlacement({ left, top, ready: true });
  }, [position.x, position.y, mode]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };
    const onPointer = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) onClose();
    };
    document.addEventListener('keydown', onKey);
    // Deferred so the click that opened the menu does not immediately close it.
    const timer = window.setTimeout(() => document.addEventListener('mousedown', onPointer), 0);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
      window.clearTimeout(timer);
    };
  }, [onClose]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(context.text);
      setCopied(true);
      window.setTimeout(onClose, 550);
    } catch {
      onClose();
    }
  };

  const label =
    context.type === 'code'
      ? `code${context.codeLanguage ? ` · ${context.codeLanguage}` : ''}`
      : context.type === 'table'
        ? 'table'
        : 'text';

  const preview = context.text.length > 68 ? `${context.text.slice(0, 68)}…` : context.text;

  return (
    <div
      ref={menuRef}
      className="action-menu"
      role="dialog"
      aria-label="Selection actions"
      style={{
        left: `${placement.left}px`,
        top: `${placement.top}px`,
        visibility: placement.ready ? 'visible' : 'hidden',
      }}
      onMouseDown={(event) => event.stopPropagation()}
    >
      {mode === 'actions' ? (
        <>
          <p className="action-menu-quote">
            <span className="action-menu-kind">{label}</span>
            <span className="action-menu-preview">“{preview}”</span>
          </p>
          <div className="action-menu-row">
            <button type="button" onClick={() => onAction('highlight')} title="Save a highlight">
              <Highlighter size={14} />
              <span>Highlight</span>
            </button>
            <button type="button" onClick={() => setMode('note')} title="Attach a note">
              <MessageSquarePlus size={14} />
              <span>Note</span>
            </button>
            <button type="button" onClick={handleCopy} title="Copy to clipboard">
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button type="button" onClick={() => onAction('quote')} title="Copy as a quote">
              <Quote size={14} />
              <span>Quote</span>
            </button>
          </div>
        </>
      ) : (
        <form
          className="action-menu-note"
          onSubmit={(event) => {
            event.preventDefault();
            onAction('note', note.trim());
          }}
        >
          <label htmlFor="action-menu-note-input">Your note</label>
          <textarea
            id="action-menu-note-input"
            autoFocus
            rows={3}
            value={note}
            placeholder="Why does this matter?"
            onChange={(event) => setNote(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                onAction('note', note.trim());
              }
            }}
          />
          <div className="action-menu-note-actions">
            <button type="button" className="is-ghost" onClick={() => setMode('actions')}>
              <X size={14} /> Back
            </button>
            <button type="submit" className="is-primary" disabled={note.trim().length === 0}>
              Save note
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
