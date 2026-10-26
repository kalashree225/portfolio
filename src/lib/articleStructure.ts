import type { Article, ArticleBlock } from '../config';

/**
 * Article structure helpers.
 *
 * These live outside ArticleRenderer so that component modules export only
 * components (React Fast Refresh requires it), and so the table of contents,
 * the renderer, and any future reader view derive headings from one function.
 */

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export interface TocEntry {
  id: string;
  text: string;
}

/** Headings double as the table of contents, so both derive from one pass. */
export function tocFor(article: Article): TocEntry[] {
  return article.blocks
    .filter((block): block is ArticleBlock => block.type === 'heading' && block.content.length > 0)
    .map((block) => ({ id: slugifyHeading(block.content), text: block.content }));
}

/** Approximate word count of a block, including table rows when present. */
export function blockWordCount(block: ArticleBlock): number {
  const body = block.content ? block.content.trim().split(/\s+/).filter(Boolean).length : 0;
  const rows = Array.isArray(block.meta?.rows)
    ? (block.meta.rows as string[][]).reduce(
        (total, row) => total + row.join(' ').trim().split(/\s+/).filter(Boolean).length,
        0,
      )
    : 0;
  return body + rows;
}
