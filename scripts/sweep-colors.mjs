// Literal → token sweep for index.css. Exact-string replaces, ordered so
// longer strings win. Run after the theme generator.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(root, 'src', 'index.css');

let css = readFileSync(file, 'utf8');
const before = css.length;

const table = [
  // --- light-green hairline borders (canvas-side) → hairline tiers ---
  ['rgba(188, 207, 187, 0.14)', 'var(--hairline-weak)'],
  ['rgba(188, 207, 187, 0.15)', 'var(--hairline-weak)'],
  ['rgba(188, 207, 187, 0.16)', 'var(--hairline-weak)'],
  ['rgba(188, 207, 187, 0.18)', 'var(--hairline-weak)'],
  ['rgba(188, 207, 187, 0.2)', 'var(--hairline-weak)'],
  ['rgba(188, 207, 187, 0.22)', 'var(--hairline-weak)'],
  ['rgba(188, 207, 187, 0.25)', 'var(--hairline)'],
  ['rgba(188, 207, 187, 0.28)', 'var(--hairline)'],
  ['rgba(188, 207, 187, 0.3)', 'var(--hairline)'],
  ['rgba(188, 207, 187, 0.32)', 'var(--hairline)'],
  ['rgba(188, 207, 187, 0.35)', 'var(--hairline-strong)'],
  ['rgba(188, 207, 187, 0.4)', 'var(--hairline-strong)'],
  ['rgba(188, 207, 187, 0.42)', 'var(--hairline-strong)'],
  ['rgba(188, 207, 187, 0.45)', 'var(--hairline-strong)'],
  ['rgba(188, 207, 187, 0.5)', 'var(--hairline-strong)'],

  // --- sage tints (ambient orbs, glows, washes) → primary mixes ---
  ['rgba(106, 124, 105, 0.02)', 'color-mix(in srgb, var(--md-primary) 2%, transparent)'],
  ['rgba(106, 124, 105, 0.04)', 'color-mix(in srgb, var(--md-primary) 4%, transparent)'],
  ['rgba(106, 124, 105, 0.12)', 'color-mix(in srgb, var(--md-primary) 12%, transparent)'],
  ['rgba(106, 124, 105, 0.16)', 'color-mix(in srgb, var(--md-primary) 16%, transparent)'],
  ['rgba(106, 124, 105, 0.17)', 'color-mix(in srgb, var(--md-primary) 17%, transparent)'],
  ['rgba(106, 124, 105, 0.18)', 'color-mix(in srgb, var(--md-primary) 18%, transparent)'],
  ['rgba(106, 124, 105, 0.2)', 'color-mix(in srgb, var(--md-primary) 20%, transparent)'],
  ['rgba(106, 124, 105, 0.25)', 'color-mix(in srgb, var(--md-primary) 25%, transparent)'],
  ['rgba(102, 119, 129, 0.2)', 'color-mix(in srgb, var(--md-secondary) 20%, transparent)'],
  ['rgba(168, 138, 90, 0.22)', 'color-mix(in srgb, var(--md-tertiary) 22%, transparent)'],
  ['rgba(168, 138, 90, 0.24)', 'color-mix(in srgb, var(--md-tertiary) 24%, transparent)'],

  // --- deep-olive grid lines / ghosts on light panels → panel ink mixes ---
  ['rgba(52, 66, 54, 0.1)', 'color-mix(in srgb, var(--surface-ink) 10%, transparent)'],
  ['rgba(52, 66, 54, 0.12)', 'color-mix(in srgb, var(--surface-ink) 12%, transparent)'],
  ['rgba(52, 66, 54, 0.14)', 'color-mix(in srgb, var(--surface-ink) 14%, transparent)'],
  ['rgba(52, 66, 54, 0.16)', 'color-mix(in srgb, var(--surface-ink) 16%, transparent)'],
  ['rgba(52, 66, 54, 0.17)', 'color-mix(in srgb, var(--surface-ink) 17%, transparent)'],
  ['rgba(52, 66, 54, 0.22)', 'color-mix(in srgb, var(--surface-ink) 22%, transparent)'],
  ['rgba(52, 66, 54, 0.24)', 'color-mix(in srgb, var(--surface-ink) 24%, transparent)'],
  ['rgba(52, 66, 54, 0.28)', 'color-mix(in srgb, var(--surface-ink) 28%, transparent)'],

  // --- white veils (dark-surface fills) → state-layer veils ---
  ['rgba(255, 255, 255, 0.03)', 'var(--veil)'],
  ['rgba(255, 255, 255, 0.045)', 'var(--veil)'],
  ['rgba(255, 255, 255, 0.05)', 'var(--veil)'],
  ['rgba(255, 255, 255, 0.075)', 'var(--veil-strong)'],

  // --- dark-band / footer white lines → brand ink hairlines ---
  ['rgba(255, 255, 255, 0.1)', 'var(--brand-ink-line)'],
  ['rgba(255, 255, 255, 0.12)', 'var(--brand-ink-line)'],
  ['rgba(255, 255, 255, 0.2)', 'var(--brand-ink-line)'],
  ['rgba(255, 255, 255, 0.22)', 'var(--brand-ink-line)'],
  ['rgba(255, 255, 255, 0.28)', 'var(--brand-ink-line)'],
  ['rgba(255, 255, 255, 0.5)', 'color-mix(in srgb, var(--on-brand-ink) 50%, transparent)'],

  // --- shadows → M3 elevation levels ---
  ['0 10px 30px rgba(0, 0, 0, 0.3)', 'var(--elevation-2)'],
  ['0 10px 30px rgba(23, 32, 25, 0.12)', 'var(--elevation-1)'],
  ['0 20px 60px rgba(0, 0, 0, 0.4)', 'var(--elevation-3)'],
  ['0 10px 30px rgba(0, 0, 0, 0.22)', 'var(--elevation-2)'],
  ['0 24px 55px rgba(0, 0, 0, 0.4)', 'var(--elevation-4)'],
  ['20px 24px 60px rgba(0, 0, 0, 0.45), 0 0 30px var(--sage-glow)', 'var(--elevation-4), 0 0 30px var(--sage-glow)'],
  ['24px 30px 70px rgba(0, 0, 0, 0.55), 0 0 45px var(--sage-glow)', 'var(--elevation-5), 0 0 45px var(--sage-glow)'],
  ['-18px 0 46px -22px rgba(0, 0, 0, 0.5)', '-18px 0 46px -22px color-mix(in srgb, var(--md-scrim) 50%, transparent)'],
  ['0 40px 90px -30px rgba(0, 0, 0, 0.7)', '0 40px 90px -30px color-mix(in srgb, var(--md-scrim) 70%, transparent)'],
  ['rgba(6, 10, 7, 0.72)', 'color-mix(in srgb, var(--md-scrim) 72%, transparent)'],

  // --- surface-tinted blur layers ---
  ['rgba(15, 20, 17, 0.88)', 'color-mix(in srgb, var(--md-surface) 88%, transparent)'],
  ['rgba(15, 20, 17, 0.98)', 'color-mix(in srgb, var(--md-surface) 96%, transparent)'],
  ['rgba(31, 37, 32, 0.9)', 'color-mix(in srgb, var(--surface-ink) 90%, transparent)'],
  ['rgba(22, 29, 24, 0.6)', 'color-mix(in srgb, var(--surface-ink) 60%, transparent)'],

  // --- success ---
  ['#4ade80', 'var(--success-dot)'],
  ['rgba(74, 222, 128, 0.7)', 'color-mix(in srgb, var(--md-success) 70%, transparent)'],
  ['rgba(74, 222, 128, 0.15)', 'color-mix(in srgb, var(--md-success) 15%, transparent)'],

  // --- fixed light panel washes ---
  ['#b9cbb8', 'var(--panel-sage-tint)'],
  ['#efe7d7', 'var(--panel-ochre-tint)'],

  // --- dark band / footer fixed light text → on-brand-ink roles ---
  ['#f5f3ee', 'var(--on-brand-ink)'],
  ['#f3f5f0', 'var(--on-brand-ink)'],
  ['#eef2ea', 'var(--on-brand-ink)'],
  ['#e3ebe0', 'var(--on-brand-ink-soft)'],
  ['#cbd8c8', 'var(--on-brand-ink-soft)'],
  ['#c4d2c1', 'var(--on-brand-ink-soft)'],
  ['#bccab9', 'var(--on-brand-ink-muted)'],
  ['#b5c7b3', 'var(--on-brand-ink-muted)'],
  ['#aabb9f', 'var(--on-brand-ink-faint)'],

  // --- note-card (light container surface) ---
  ['color: #f2f4ef;', 'color: var(--ink);'],

  // --- résumé document → fixed light doc tokens ---
  ['#f6f7f2', 'var(--doc-bg)'],
  ['#1b211c', 'var(--doc-ink)'],
  ['#2c342d', 'var(--doc-ink)'],
  ['#47514a', 'var(--doc-ink-muted)'],
  ['#3c463e', 'var(--doc-ink-muted)'],
  ['#5e685f', 'var(--doc-ink-muted)'],
  ['#6e7972', 'var(--doc-faint)'],
  ['#c2c8ba', 'var(--doc-line)'],
  ['#d9ddd1', 'var(--doc-bg-high)'],
  ['#e1e4d8', 'var(--doc-bg-high)'],
  ['#365a46', 'var(--doc-primary)'],
  ['#24402f', 'var(--doc-primary)'],
  ['#1f5f6c', 'var(--doc-secondary)'],
];

let applied = 0;
const missing = [];
for (const [from, to] of table) {
  if (css.includes(from)) {
    css = css.split(from).join(to);
    applied += 1;
  } else {
    missing.push(from);
  }
}

writeFileSync(file, css, 'utf8');
console.log(`sweep: ${applied}/${table.length} replacements applied, ${css.length - before} bytes delta`);
if (missing.length > 0) {
  console.log('not found (already swept or context changed):');
  for (const m of missing) console.log(`  ${m}`);
}
