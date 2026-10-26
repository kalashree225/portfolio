import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
if (!existsSync(edge)) process.exit(1);
const browser = await puppeteer.launch({ executablePath: edge, headless: 'new' });
const page = await browser.newPage();
await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
await page.evaluate(() => localStorage.setItem('portfolio-theme', 'dark'));
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 900));
const probe = await page.evaluate(() => {
  const root = getComputedStyle(document.documentElement);
  const btn = document.querySelector('.button-dark');
  const outline = document.querySelector('.button-outline');
  const b = btn ? getComputedStyle(btn) : null;
  const o = outline ? getComputedStyle(outline) : null;
  return {
    signalStrong: root.getPropertyValue('--signal-strong').trim(),
    mdPrimary: root.getPropertyValue('--md-primary').trim(),
    mdOnPrimaryContainer: root.getPropertyValue('--md-on-primary-container').trim(),
    ink: root.getPropertyValue('--ink').trim(),
    canvas: root.getPropertyValue('--canvas').trim(),
    buttonDarkBg: b?.backgroundColor,
    buttonDarkColor: b?.color,
    buttonOutlineBg: o?.backgroundColor,
    buttonOutlineColor: o?.color,
  };
});
console.log(JSON.stringify(probe, null, 2));
await browser.close();
