import { useCallback, useEffect, useRef, useState } from 'react';

/* ---------------------------------------------------------------------------
   Text annotations.

   An annotation is stored as a semantic anchor — the block it belongs to, the
   character offsets inside that block, and the quoted text as a fallback —
   rather than as canvas coordinates or a live DOM Range. That means it
   survives resizing, reflow, font loading, and theme changes, and it can be
   persisted and restored on a later visit.

   Highlights are painted by splitting text nodes and wrapping the relevant
   slice in a <mark>. Re-anchoring after a re-render uses the same stored
   offsets, so the result is stable.
   ------------------------------------------------------------------------- */

export type AnnotationKind = 'highlight' | 'note';

export interface Annotation {
  id: string;
  articleSlug: string;
  blockId: string;
  start: number;
  end: number;
  /** The exact text that was selected, used as a fallback anchor. */
  text: string;
  kind: AnnotationKind;
  note?: string;
  createdAt: number;
}

export interface SelectionInfo {
  blockId: string;
  start: number;
  end: number;
  text: string;
}

const STORAGE_PREFIX = 'portfolio-annotations:';

function readStored(articleSlug: string): Annotation[] {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + articleSlug);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is Annotation =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as Annotation).text === 'string' &&
        typeof (item as Annotation).blockId === 'string',
    );
  } catch {
    return [];
  }
}

function writeStored(articleSlug: string, annotations: Annotation[]) {
  try {
    if (annotations.length === 0) {
      localStorage.removeItem(STORAGE_PREFIX + articleSlug);
      return;
    }
    localStorage.setItem(STORAGE_PREFIX + articleSlug, JSON.stringify(annotations));
  } catch {
    /* storage unavailable — annotations stay in memory for this session */
  }
}

/** Character offset of a DOM boundary point measured inside a root element. */
function charOffsetIn(root: Node, node: Node, offset: number): number {
  let total = 0;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();
  while (current) {
    if (current === node) return total + offset;
    total += current.textContent?.length ?? 0;
    current = walker.nextNode();
  }
  // Boundary was an element, not a text node — measure up to its start.
  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element;
    const range = document.createRange();
    range.selectNodeContents(root);
    try {
      range.setEnd(element, offset);
      return range.toString().length;
    } catch {
      return total;
    }
  }
  return total;
}

/** Resolve a stored annotation back to a DOM Range inside the given block. */
function rangeForAnnotation(block: HTMLElement, annotation: Annotation): Range | null {
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    nodes.push(current as Text);
    current = walker.nextNode();
  }

  const place = (target: number): { node: Text; offset: number } | null => {
    let consumed = 0;
    for (const node of nodes) {
      const length = node.textContent?.length ?? 0;
      if (target <= consumed + length) {
        return { node, offset: Math.max(0, target - consumed) };
      }
      consumed += length;
    }
    return nodes.length > 0
      ? { node: nodes[nodes.length - 1], offset: nodes[nodes.length - 1].textContent?.length ?? 0 }
      : null;
  };

  const start = place(annotation.start);
  const end = place(annotation.end);
  if (!start || !end) return null;

  const range = document.createRange();
  try {
    range.setStart(start.node, start.offset);
    range.setEnd(end.node, end.offset);
  } catch {
    return null;
  }
  return range;
}

function unwrapMarks(container: HTMLElement) {
  container.querySelectorAll('mark[data-annotation-id]').forEach((mark) => {
    const parent = mark.parentNode;
    if (!parent) return;
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    parent.removeChild(mark);
  });
  container.normalize();
}

function paintAnnotation(container: HTMLElement, annotation: Annotation, onOpenNote: (id: string) => void) {
  const block = container.querySelector<HTMLElement>(`[data-block-id="${annotation.blockId}"]`);
  if (!block) return;

  const range = rangeForAnnotation(block, annotation);
  if (!range) return;

  const mark = document.createElement('mark');
  mark.dataset.annotationId = annotation.id;
  mark.className = annotation.kind === 'note' ? 'annotation-mark is-note' : 'annotation-mark';
  if (annotation.note) {
    mark.title = annotation.note;
    mark.tabIndex = 0;
    mark.setAttribute('role', 'button');
    mark.setAttribute('aria-label', `Note: ${annotation.note}`);
    mark.addEventListener('click', () => onOpenNote(annotation.id));
    mark.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onOpenNote(annotation.id);
      }
    });
  }

  try {
    range.surroundContents(mark);
  } catch {
    // surroundContents throws when the range spans element boundaries (a link
    // or inline code inside the selection). Highlight the start node's share
    // of the range rather than painting nothing at all.
    const startNode = range.startContainer;
    if (startNode.nodeType !== 3) return;
    const fallback = document.createRange();
    const available = (startNode.textContent?.length ?? 0) - range.startOffset;
    fallback.setStart(startNode, range.startOffset);
    fallback.setEnd(startNode, range.startOffset + available);
    try {
      fallback.surroundContents(mark);
    } catch {
      /* give up quietly — the annotation is still listed in the workspace */
    }
  }
}

export interface UseArticleAnnotations {
  annotations: Annotation[];
  add: (selection: SelectionInfo, kind: AnnotationKind, note?: string) => Annotation;
  remove: (id: string) => void;
  updateNote: (id: string, note: string) => void;
  clear: () => void;
  /** Attach to the element that contains the article blocks. */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** The annotation whose note is currently open, if any. */
  openNoteId: string | null;
  setOpenNoteId: (id: string | null) => void;
}

export function useArticleAnnotations(articleSlug: string): UseArticleAnnotations {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);
  const [paintToken, setPaintToken] = useState(0);

  // Load persisted annotations once the article is known.
  useEffect(() => {
    setAnnotations(readStored(articleSlug));
  }, [articleSlug]);

  // Repaint whenever the annotation set or the article changes. The cleanup
  // captures the node it actually observed, so a late unmount cannot unwrap
  // marks out of a different element.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    unwrapMarks(container);
    annotations.forEach((annotation) => paintAnnotation(container, annotation, setOpenNoteId));

    return () => unwrapMarks(container);
  }, [annotations, articleSlug, paintToken]);

  // Text nodes get added asynchronously (fonts, diagrams, experiment panels).
  // Re-anchor once when the content settles so offsets stay accurate.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return;
    let timer: number | undefined;
    const observer = new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setPaintToken((n) => n + 1), 180);
    });
    observer.observe(container);
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  const persist = useCallback(
    (next: Annotation[]) => {
      setAnnotations(next);
      writeStored(articleSlug, next);
    },
    [articleSlug],
  );

  const add = useCallback(
    (selection: SelectionInfo, kind: AnnotationKind, note?: string) => {
      const annotation: Annotation = {
        id:
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `a-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        articleSlug,
        blockId: selection.blockId,
        start: selection.start,
        end: selection.end,
        text: selection.text,
        kind,
        note,
        createdAt: Date.now(),
      };
      setAnnotations((prev) => {
        const next = [...prev, annotation];
        writeStored(articleSlug, next);
        return next;
      });
      return annotation;
    },
    [articleSlug],
  );

  const remove = useCallback(
    (id: string) => persist(annotations.filter((a) => a.id !== id)),
    [annotations, persist],
  );

  const updateNote = useCallback(
    (id: string, note: string) =>
      persist(
        annotations.map((a) => (a.id === id ? { ...a, note, kind: note ? 'note' : a.kind } : a)),
      ),
    [annotations, persist],
  );

  const clear = useCallback(() => persist([]), [persist]);

  return {
    annotations,
    add,
    remove,
    updateNote,
    clear,
    containerRef,
    openNoteId,
    setOpenNoteId,
  };
}

export { charOffsetIn };
