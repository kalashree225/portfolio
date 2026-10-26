/**
 * Regenerates public/resume.pdf from the site's own résumé component.
 *
 *   npm run resume:pdf
 *
 * The résumé lives in one place (src/config.ts -> resumeData, rendered by
 * src/components/ResumePaper.tsx). This script builds a single-page bundle of
 * that component and asks installed Edge or Chrome to print it, so editing the
 * résumé data and re-running this command is all that is needed to refresh the
 * downloadable document.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, statSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const buildDir = path.join(projectRoot, 'dist-print');
const htmlPath = path.join(buildDir, 'index.html');
const outputPath = path.join(projectRoot, 'public', 'resume.pdf');

const BROWSERS = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/microsoft-edge',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: false,
    ...options,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${path.basename(command)} exited with code ${result.status}`);
  }
}

const browser = BROWSERS.find((candidate) => existsSync(candidate));
if (!browser) {
  console.error(
    'No Edge or Chrome installation found. Install one, or print the résumé\n' +
      'manually: run `npm run dev`, open /print/resume, and print to PDF.',
  );
  process.exit(1);
}

console.log('› Building the résumé bundle…');
run(process.execPath, [
  path.join(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js'),
  'build',
  '--config',
  'vite.resume.config.ts',
]);

if (!existsSync(htmlPath)) {
  console.error(`Build did not produce ${htmlPath}`);
  process.exit(1);
}

mkdirSync(path.dirname(outputPath), { recursive: true });

console.log(`› Printing with ${path.basename(browser)}…`);
run(browser, [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  // ES modules and the stylesheet are loaded from file://, which Chromium
  // blocks by default — without this the print is a blank page.
  '--allow-file-access-from-files',
  '--no-pdf-header-footer',
  '--run-all-compositor-stages-before-draw',
  '--virtual-time-budget=10000',
  `--print-to-pdf=${outputPath}`,
  pathToFileURL(htmlPath).href,
]);

if (!existsSync(outputPath)) {
  console.error('The browser did not produce a PDF.');
  process.exit(1);
}

const { size } = statSync(outputPath);
if (size < 20_000) {
  console.error(
    `The generated PDF is only ${size} bytes, which usually means the page did not render. ` +
      'Check the /print/resume route.',
  );
  process.exit(1);
}

rmSync(buildDir, { recursive: true, force: true });

console.log(`✓ public/resume.pdf written (${(size / 1024).toFixed(1)} KB)`);
