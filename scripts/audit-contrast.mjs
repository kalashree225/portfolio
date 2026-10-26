/**
 * Component contrast audit.
 *
 * Loads every route in the real browser (installed Edge) in both themes and
 * checks the *effective* color pair of every text-bearing element against
 * WCAG. Effective background is resolved by walking ancestors until a
 * non-transparent background is found — the same logic an eye performs.
 *
 *   npm run audit:contrast
 */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';

const BASE = process.env.AUDIT_URL || 'http://localhost:3000';
const EDGE_PATHS = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
];
const edge = EDGE_PATHS.find((p) => existsSync(p));
if (!edge) {
  console.error('no Edge/Chrome found');
  process.exit(1);
}

const ROUTES = [
  '/',
  '/work',
  '/work/smartsense',
  '/about',
  '/writing',
  '/writing/notes/designing-a-production-api',
  '/writing/notes/etl-pipelines-people-trust',
  '/writing/concepts/api-gateway',
  '/contact',
];

function parseRgb(css) {
  const m = css && css.match(/rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?/);
  if (!m) return null;
  return {
    r: Number(m[1]),
    g: Number(m[2]),
    b: Number(m[3]),
    a: m[4] === undefined ? 1 : Number(m[4]),
  };
}

function luminance({ r, g, b }) {
  const lin = (v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function composite(fg, bg) {
  if (!fg) return bg;
  if (fg.a >= 1) return fg;
  const a = fg.a + bg.a * (1 - fg.a);
  if (a === 0) return { r: 0, g: 0, b: 0, a: 0 };
  return {
    r: (fg.r * fg.a + bg.r * bg.a * (1 - fg.a)) / a,
    g: (fg.g * fg.a + bg.g * bg.a * (1 - fg.a)) / a,
    b: (fg.b * fg.a + bg.b * bg.a * (1 - fg.a)) / a,
    a,
  };
}

const failures = [];
const summary = { checked: 0 };

async function auditRoute(page, route, theme) {
  await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.evaluate((t) => localStorage.setItem('portfolio-theme', t), theme);
  await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle0', timeout: 45000 });
  await new Promise((resolve) => setTimeout(resolve, 900));

  const issues = await page.evaluate(() => {
    const out = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const seen = new Set();
    let node;
    while ((node = walker.nextNode())) {
      const text = node.textContent.replace(/\s+/g, ' ').trim();
      if (text.length < 2) continue;
      const el = node.parentElement;
      if (!el) continue;
      const style = window.getComputedStyle(el);
      const fontSize = parseFloat(style.fontSize) || 16;
      const weight = parseInt(style.fontWeight, 10) || 400;
      const largeText = fontSize >= 24 || (fontSize >= 18.66 && weight >= 700);
      const min = largeText ? 3 : 4.5;

      const parse = (css) => {
        const m = css && css.match(/rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?/);
        if (!m) return null;
        return { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] };
      };
      const lin = (v) => {
        const c = v / 255;
        return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      };
      const lum = ({ r, g, b }) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
      const comp = (fg, bg) => {
        if (!fg) return bg;
        if (fg.a >= 1) return fg;
        const a = fg.a + bg.a * (1 - fg.a);
        if (a === 0) return { r: 0, g: 0, b: 0, a: 0 };
        return {
          r: (fg.r * fg.a + bg.r * bg.a * (1 - fg.a)) / a,
          g: (fg.g * fg.a + bg.g * bg.a * (1 - fg.a)) / a,
          b: (fg.b * fg.a + bg.b * bg.a * (1 - fg.a)) / a,
          a,
        };
      };

      // Resolve the effective background: climb ancestors, compositing every
      // translucent layer, until an opaque one is found. Only if the whole
      // chain is transparent (should not happen with the canvas in place)
      // fall back to the browser's white canvas.
      let bg = { r: 0, g: 0, b: 0, a: 0 };
      let cursor = el;
      while (cursor) {
        const s = window.getComputedStyle(cursor);
        const layer = parse(s.backgroundColor);
        if (layer && layer.a > 0) bg = comp(layer, bg);
        if (bg.a >= 1) break;
        cursor = cursor.parentElement;
      }
      if (bg.a === 0) bg = { r: 255, g: 255, b: 255, a: 1 };
      const fgColor = parse(window.getComputedStyle(el).color);
      if (!fgColor) continue;
      if (fgColor.a < 0.05) continue; // invisible text
      const eff = comp(fgColor, bg);
      const L1 = lum(eff);
      const L2 = lum(bg);
      const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      if (ratio < min) {
        const key = text.slice(0, 40);
        if (!seen.has(key)) {
          seen.add(key);
          out.push({
            text: key,
            el: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : ''),
            ratio: Math.round(ratio * 100) / 100,
            min,
            fg: `rgb(${Math.round(fgColor.r)},${Math.round(fgColor.g)},${Math.round(fgColor.b)},${fgColor.a.toFixed(2)})`,
            bg: `rgb(${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)},${bg.a.toFixed(2)})`,
            eff: `rgb(${Math.round(eff.r)},${Math.round(eff.g)},${Math.round(eff.b)})`,
          });
        }
      }
    }
    return out;
  });

  for (const issue of issues) {
    failures.push({ route, theme, ...issue });
  }
  summary.checked += 1;
  console.log(`${theme.padEnd(5)} ${route.padEnd(52)} ${issues.length} failing pairs`);
}

const browser = await puppeteer.launch({ executablePath: edge, headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1360, height: 900 });

for (const route of ROUTES) {
  await auditRoute(page, route, 'light');
}
for (const route of ROUTES) {
  await auditRoute(page, route, 'dark');
}
await browser.close();

console.log('');
console.log(`TEXT PAIRS BELOW WCAG (${failures.length}):`);
for (const f of failures) {
  console.log(`  ${f.theme.padEnd(5)} ${f.route.padEnd(52)} ${String(f.min).padStart(3)}  ${String(f.ratio).padStart(5)}  <${f.el}>  "${f.text}"`);
  console.log(`         fg=${f.fg}  bg=${f.bg}  eff=${f.eff}`);
}
if (failures.length > 0) process.exitCode = 1;
