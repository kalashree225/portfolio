/**
 * GitHub Pages serves 404.html for unknown paths instead of falling back to
 * index.html. Copying the built SPA shell there lets React Router resolve deep
 * links such as /portfolio/work/stockledger when the page is opened directly.
 */
import { copyFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(projectRoot, 'dist');
const indexPath = path.join(distDir, 'index.html');
const notFoundPath = path.join(distDir, '404.html');

if (!existsSync(indexPath)) {
  console.error('dist/index.html not found. Run `npm run build` first.');
  process.exit(1);
}

copyFileSync(indexPath, notFoundPath);
console.log('Created dist/404.html for GitHub Pages SPA routing.');
