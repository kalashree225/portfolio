import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import {
  ArrowRightLeft,
  ChevronDown,
  FileText,
  Pen,
  Search,
} from 'lucide-react';
import { Pill, Pop } from '../motion/primitives';

type Mode = 'read' | 'explore' | 'annotate';

const MODE_KEYS: Record<string, Mode> = { r: 'read', e: 'explore', a: 'annotate' };

interface ArticleToolbarProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  interactive: boolean;
  onSearch?: () => void;
  /** Jump targets offered by the overflow menu. */
  sections?: { id: string; text: string }[];
  onJump?: (id: string) => void;
}

export function ArticleToolbar({
  mode,
  onModeChange,
  interactive,
  onSearch,
  sections = [],
  onJump,
}: ArticleToolbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Single-key mode switching, ignored while the reader is typing.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent | globalThis.KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) {
        return;
      }
      if (event.key === 'Escape') {
        setMenuOpen(false);
        return;
      }
      const next = MODE_KEYS[event.key.toLowerCase()];
      if (!next) return;
      if (next === 'explore' && !interactive) return;
      // Annotating is the only mode that wants the mouse, so don't steal it
      // from a reader who is simply reading.
      onModeChange(next);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [interactive, onModeChange]);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, [menuOpen]);

  return (
    <div className="article-toolbar" role="toolbar" aria-label="Article actions">
      <div className="toolbar-left">
        <button className="toolbar-btn" onClick={onSearch} aria-label="Find in article (⌘F)">
          <Search size={15} />
          <span className="toolbar-btn-label">Find</span>
        </button>
      </div>

      <div className="toolbar-center">
        <div className="mode-tabs" role="tablist" aria-label="Reading mode">
          <button
            role="tab"
            aria-selected={mode === 'read'}
            className={`mode-tab ${mode === 'read' ? 'active' : ''}`}
            onClick={() => onModeChange('read')}
            title="Read mode (R)"
          >
            {mode === 'read' && <Pill id="mode-pill" />}
            <FileText size={14} />
            <span>Read</span>
          </button>
          {interactive && (
            <button
              role="tab"
              aria-selected={mode === 'explore'}
              className={`mode-tab ${mode === 'explore' ? 'active' : ''}`}
              onClick={() => onModeChange('explore')}
              title="Explore the interactive models (E)"
            >
              {mode === 'explore' && <Pill id="mode-pill" />}
              <ArrowRightLeft size={14} />
              <span>Explore</span>
            </button>
          )}
          <button
            role="tab"
            aria-selected={mode === 'annotate'}
            className={`mode-tab ${mode === 'annotate' ? 'active' : ''}`}
            onClick={() => onModeChange('annotate')}
            title="Annotate: select text to highlight it or leave a note (A)"
          >
            {mode === 'annotate' && <Pill id="mode-pill" />}
            <Pen size={14} />
            <span>Annotate</span>
          </button>
        </div>
      </div>

      <div className="toolbar-right">
        {sections.length > 0 && (
          <div className="toolbar-menu" ref={menuRef}>
            <button
              className="toolbar-btn"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-haspopup="true"
              aria-label="Jump to section"
            >
              <ChevronDown size={15} />
            </button>
            {menuOpen && (
              <Pop open={menuOpen} className="toolbar-dropdown" origin="top right">
                <div role="menu">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      role="menuitem"
                      onClick={() => {
                        onJump?.(section.id);
                        setMenuOpen(false);
                      }}
                    >
                      {section.text}
                    </button>
                  ))}
                </div>
              </Pop>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
