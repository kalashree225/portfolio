import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ActionMenu, type SelectionAction } from './ActionMenu';
import { charOffsetIn, type SelectionInfo } from '../../hooks/useArticleAnnotations';

interface ActiveSelection extends SelectionInfo {
  rect: DOMRect;
  type: 'text' | 'code' | 'table';
  codeLanguage?: string;
}

interface ContentSelectionProps {
  children: ReactNode;
  /** Called when a reader acts on a selection. Absent = menu not shown. */
  onAction?: (action: SelectionAction, selection: SelectionInfo, note?: string) => void;
  enabled?: boolean;
}

/**
 * Tracks text selection inside the article and surfaces the action menu.
 *
 * Selections that start and end inside the same `[data-block-id]` are turned
 * into character offsets, which is what makes an annotation survive a reflow.
 * Selections spanning blocks are ignored rather than silently mis-anchored.
 */
export function ContentSelection({ children, onAction, enabled = true }: ContentSelectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<ActiveSelection | null>(null);

  const clearNativeSelection = useCallback(() => {
    const current = window.getSelection();
    if (current && !current.isCollapsed) current.removeAllRanges();
  }, []);

  useEffect(() => {
    // Nothing to clear when the menu is disabled: the hook is not subscribed,
    // and any leftover selection state is dropped on the next read.
    if (!enabled) return;

    const readSelection = () => {
      const native = window.getSelection();
      if (!native || native.isCollapsed || native.rangeCount === 0) {
        setSelection(null);
        return;
      }

      const range = native.getRangeAt(0);
      const container = containerRef.current;
      if (!container || !container.contains(range.commonAncestorContainer)) {
        setSelection(null);
        return;
      }

      const text = native.toString().replace(/\s+/g, ' ').trim();
      if (text.length < 2) {
        setSelection(null);
        return;
      }

      const startElement =
        range.startContainer.nodeType === 1
          ? (range.startContainer as Element)
          : range.startContainer.parentElement;

      const block = startElement?.closest<HTMLElement>('[data-block-id]');
      if (!block) {
        setSelection(null);
        return;
      }

      // Only anchor selections that live inside one block.
      const endElement =
        range.endContainer.nodeType === 1
          ? (range.endContainer as Element)
          : range.endContainer.parentElement;
      if (endElement?.closest('[data-block-id]') !== block) {
        setSelection(null);
        return;
      }

      const code = startElement?.closest('pre code');
      const table = startElement?.closest('table');

      setSelection({
        rect: range.getBoundingClientRect(),
        type: code ? 'code' : table ? 'table' : 'text',
        codeLanguage: code?.getAttribute('data-language') ?? undefined,
        blockId: block.dataset.blockId ?? '',
        start: charOffsetIn(block, range.startContainer, range.startOffset),
        end: charOffsetIn(block, range.endContainer, range.endOffset),
        text,
      });
    };

    document.addEventListener('selectionchange', readSelection);
    return () => document.removeEventListener('selectionchange', readSelection);
  }, [enabled]);

  const close = useCallback(() => {
    clearNativeSelection();
    setSelection(null);
  }, [clearNativeSelection]);

  return (
    <div ref={containerRef} className="article-selection-container">
      {children}
      {enabled && onAction && selection && selection.blockId && (
        <ActionMenu
          context={{
            type: selection.type,
            text: selection.text,
            blockId: selection.blockId,
            codeLanguage: selection.codeLanguage,
          }}
          position={{
            x: selection.rect.left + selection.rect.width / 2,
            y: selection.rect.top,
          }}
          onAction={(action, note) => {
            onAction(
              action,
              {
                blockId: selection.blockId,
                start: selection.start,
                end: selection.end,
                text: selection.text,
              },
              note,
            );
            close();
          }}
          onClose={close}
        />
      )}
    </div>
  );
}
