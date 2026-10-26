import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const EDGE_PATHS = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];
const edge = EDGE_PATHS.find((p) => existsSync(p));
const browser = await puppeteer.launch({ executablePath: edge, headless: 'new' });
const page = await browser.newPage();
await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
await page.evaluate(() => localStorage.setItem('portfolio-theme', 'dark'));
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 900));
const probe = await page.evaluate(() => {
  const root = getComputedStyle(document.documentElement);
  const body = getComputedStyle(document.body);
  const shell = getComputedStyle(document.querySelector('.site-shell'));
  return {
    theme: document.documentElement.dataset.theme,
    rootMdSurface: root.getPropertyValue('--md-surface').trim(),
    rootCanvas: root.getPropertyValue('--canvas').trim(),
    rootInk: root.getPropertyValue('--ink').trim(),
    bodyBg: body.backgroundColor,
    bodyColor: body.color,
    shellBg: shell.backgroundColor,
    rootPrimary: root.getPropertyValue('--md-primary').trim(),
    rootOnSurface: root.getPropertyValue('--md-on-surface').trim(),
  };
});
console.log(JSON.stringify(probe, null, 2));
await browser.close();
