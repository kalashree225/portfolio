import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

describe('fixed light Material 3 theme', () => {
  const themeCss = readFileSync(path.resolve(__dirname, 'theme.css'), 'utf8');
  const entryHtml = readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

  it('keeps the shared typography tokens', () => {
    expect(themeCss).toContain('--typescale-display-large');
    expect(themeCss).toContain('--font-serif');
    expect(themeCss).toContain('--font-mono');
  });

  it('boots directly into the fixed light palette', () => {
    expect(entryHtml).toContain('data-theme="light"');
    expect(entryHtml).toContain('data-palette="porcelain"');
    expect(entryHtml).not.toContain('portfolio-theme');
    expect(entryHtml).not.toContain('portfolio-palette');
  });

  it('defines the selected porcelain light-scheme roles', () => {
    expect(themeCss).toContain('color-scheme: light;');
    expect(themeCss).toContain('[data-palette="porcelain"]');
    expect(themeCss).toContain('--md-primary:');
    expect(themeCss).toContain('--md-surface:');
    expect(themeCss).toContain('--md-on-surface:');
    expect(themeCss).toContain('--doc-bg:');
    expect(themeCss).toContain('--doc-ink:');
  });

  it('defines essential site aliases bridged to Material 3 tokens', () => {
    expect(themeCss).toContain('--canvas: var(--md-surface);');
    expect(themeCss).toContain('--surface: var(--md-surface-container-lowest);');
    expect(themeCss).toContain('--ink: var(--md-on-surface);');
    expect(themeCss).toContain('--line: var(--md-outline-variant);');
    expect(themeCss).toContain('--sage: var(--md-primary);');
    expect(themeCss).toContain('--blue: var(--md-secondary);');
    expect(themeCss).toContain('--ochre: var(--md-tertiary);');
  });

  it('porcelain matte runs low glow mixes so surfaces stay flat', () => {
    expect(themeCss).toContain("--palette-id: 'porcelain';");
    expect(themeCss).toContain('--sage-glow: color-mix(in srgb, #2151da 8%, transparent);');
    expect(themeCss).toContain('--palette-glow: color-mix(in srgb, #2151da 10%, transparent);');
  });
});
