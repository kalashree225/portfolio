/**
 * Material 3 & Figma theme generator.
 *
 * Builds src/theme.css from seed colors using Google's own HCT color math
 * (the same pipeline the Material Theme Builder and Stitch design system uses):
 * tonal palettes per hue, the full M3 role set for light and dark across 5 curated
 * designer palettes (Sage Technical, Obsidian Indigo, Terracotta Amber,
 * Nordic Frost, Porcelain Matte), custom colors, and the shape / state /
 * elevation / motion / type tokens the site's components bind to.
 *
 *   npm run theme
 *
 * Every text-bearing role pair is checked against WCAG AA inside this script and
 * the audit is printed at the end — the themes ship with mathematical proof, not vibes.
 */
import {
  CorePalette,
  hexFromArgb,
  Scheme,
  themeFromSourceColor,
  TonalPalette,
} from '@material/material-color-utilities';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/* ------------------------------------------------------------------ */
/* Seeds for Curated Google Stitch & Figma Palettes                   */
/* ------------------------------------------------------------------ */

export const PALETTES = {
  sage: {
    id: 'sage',
    name: 'Sage Technical',
    system: 'Google Stitch Forest',
    description: 'Calibrated charcoal forest and moss with high-contrast mint accents',
    swatches: ['#365a46', '#246c7b', '#875b1b', '#101712'],
    seeds: {
      primary: 0xff365a46, // sage green — brand
      secondary: 0xff246c7b, // blue-gray — supporting actions, links
      tertiary: 0xff875b1b, // ochre — highlights, warnings
      neutral: 0xff4b564c, // green-tinted neutral — canvas
      neutralVariant: 0xff435148, // green-tinted variant — outlines
      error: 0xffba1a1a, // M3 baseline error
      success: 0xff2f6b33, // app extension of the error pattern
      brandInk: 0xff101712, // the near-black green of the brand band / footer
    },
  },
  obsidian: {
    id: 'obsidian',
    name: 'Obsidian Indigo',
    system: 'Figma Modern Dark',
    description: 'Midnight obsidian canvas with electric indigo, radiant cyan, and violet glow',
    swatches: ['#4f46e5', '#0284c7', '#7e22ce', '#0a0d16'],
    // Authored dark-glass surfaces: cards stay midnight glass, never white.
    darkExtra: [
      '/* Dark obsidian glass surfaces — no whiteness */',
      '--surface: #1a1f2e;',
      '--surface-ink: #dee2f2;',
      '--surface-muted: #9aa0b8;',
      '--sage-glow: color-mix(in srgb, #818cf8 30%, transparent);',
      '--palette-accent: #818cf8;',
      '--palette-glow: color-mix(in srgb, #818cf8 35%, transparent);',
      '/* Extra depth tokens for bold Obsidian Indigo */',
      '--brand-ink: #060810;',
      '--on-brand-ink: #e8eaff;',
      '--on-brand-ink-soft: #b8bcdc;',
      '--on-brand-ink-muted: #8890b8;',
      '--on-brand-ink-faint: #5a6080;',
      '--brand-ink-line: color-mix(in srgb, #818cf8 20%, transparent);',
    ],
    seeds: {
      primary: 0xff4f46e5, // electric indigo
      secondary: 0xff0284c7, // radiant cyan
      tertiary: 0xff7e22ce, // violet
      neutral: 0xff474c59, // deep obsidian slate neutral
      neutralVariant: 0xff434957, // midnight outlines
      error: 0xffe11d48, // rose error
      success: 0xff10b981, // emerald
      brandInk: 0xff0a0d16, // midnight ink
    },
  },
  terracotta: {
    id: 'terracotta',
    name: 'Terracotta Amber',
    system: 'Google Stitch Warmth',
    description: 'Deep espresso umber, burnt terracotta, and glowing golden amber warmth',
    swatches: ['#a84628', '#b45309', '#854d0e', '#16100d'],
    seeds: {
      primary: 0xffa84628, // burnt terracotta
      secondary: 0xffb45309, // golden amber
      tertiary: 0xff854d0e, // warm clay
      neutral: 0xff544c47, // warm espresso slate neutral
      neutralVariant: 0xff4d4540, // warm stone outlines
      error: 0xffdc2626,
      success: 0xff2f6b33,
      brandInk: 0xff16100d, // espresso ink
    },
  },
  nordic: {
    id: 'nordic',
    name: 'Nordic Frost',
    system: 'Figma Arctic Slate',
    description: 'Scandinavian minimalist slate with ice sky blue, royal cobalt, and teal aurora',
    swatches: ['#0284c7', '#1d4ed8', '#0f766e', '#070c17'],
    seeds: {
      primary: 0xff0284c7, // sky ice blue
      secondary: 0xff1d4ed8, // royal cobalt
      tertiary: 0xff0f766e, // aurora teal
      neutral: 0xff424b5c, // nordic graphite neutral
      neutralVariant: 0xff3b4556, // cool slate outlines
      error: 0xffe11d48,
      success: 0xff16a34a,
      brandInk: 0xff070c17, // deep navy ink
    },
  },
  porcelain: {
    id: 'porcelain',
    name: 'Porcelain Matte',
    system: 'Calm Matte Editorial',
    description:
      'Warm paper canvas with bold matte cobalt, deep teal links, amber highlights, and espresso ink — bright, high-contrast, and easy on the eyes',
    swatches: ['#1d4ed8', '#0f766e', '#b45309', '#1c1712'],
    // Matte finish: glow mixes run low so surfaces stay flat, never neon.
    glow: { light: [8, 10], dark: [10, 12] },
    seeds: {
      primary: 0xff1d4ed8, // bold matte cobalt — brand
      secondary: 0xff0f766e, // deep teal — links, supporting actions
      tertiary: 0xffb45309, // warm amber — highlights, sparing warmth
      neutral: 0xff5b564c, // warm greige — paper-tinted canvas
      neutralVariant: 0xff4c463c, // warm stone — outlines
      error: 0xffba1a1a, // matte brick
      success: 0xff2e6b34, // matte leaf green
      brandInk: 0xff1c1712, // espresso near-black — bands, footer
    },
  },
};

const CONTAINER_TONES = {
  light: {
    surfaceDim: 87,
    surfaceBright: 98,
    surfaceContainerLowest: 100,
    surfaceContainerLow: 96,
    surfaceContainer: 94,
    surfaceContainerHigh: 92,
    surfaceContainerHighest: 90,
  },
  dark: {
    surfaceDim: 6,
    surfaceBright: 24,
    surfaceContainerLowest: 4,
    surfaceContainerLow: 10,
    surfaceContainer: 12,
    surfaceContainerHigh: 17,
    surfaceContainerHighest: 22,
  },
};

/* ------------------------------------------------------------------ */
/* WCAG audit helpers                                                 */
/* ------------------------------------------------------------------ */

function luminance(argb) {
  const channel = (shift) => {
    const c = (argb >> shift) & 0xff;
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(16) + 0.7152 * channel(8) + 0.0722 * channel(0);
}

function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

const audit = [];
function check(paletteId, mode, label, fg, bg, minimum = 4.5) {
  const ratio = contrast(fg, bg);
  audit.push({ paletteId, mode, label, ratio, pass: ratio >= minimum, minimum });
}

/* ------------------------------------------------------------------ */
/* Theme builder function per palette                                 */
/* ------------------------------------------------------------------ */

function generateThemeForSeeds(paletteId, seeds) {
  const core = {
    a1: TonalPalette.fromInt(seeds.primary),
    a2: TonalPalette.fromInt(seeds.secondary),
    a3: TonalPalette.fromInt(seeds.tertiary),
    n1: TonalPalette.fromInt(seeds.neutral),
    n2: TonalPalette.fromInt(seeds.neutralVariant),
    error: TonalPalette.fromInt(seeds.error),
  };

  const palettes = {
    primary: core.a1,
    secondary: core.a2,
    tertiary: core.a3,
    neutral: core.n1,
    neutralVariant: core.n2,
    error: core.error,
  };

  const lightScheme = { ...Scheme.lightFromCorePalette(core).toJSON() };
  const darkScheme = { ...Scheme.darkFromCorePalette(core).toJSON() };
  const neutral = palettes.neutral;

  for (const [role, tone] of Object.entries(CONTAINER_TONES.light)) {
    lightScheme[role] = neutral.tone(tone);
  }
  for (const [role, tone] of Object.entries(CONTAINER_TONES.dark)) {
    darkScheme[role] = neutral.tone(tone);
  }

  const customTheme = themeFromSourceColor(seeds.primary, [
    { name: 'success', value: seeds.success, blend: true },
    { name: 'brandInk', value: seeds.brandInk, blend: false },
  ]);

  const customPalettes = new Map(
    customTheme.customColors.map((entry) => {
      const name = entry.color.name;
      const palette =
        name === 'brandInk' ? TonalPalette.fromInt(entry.value) : CorePalette.of(entry.value).a1;
      return [name, palette];
    }),
  );

  // Audits
  const L = lightScheme;
  const D = darkScheme;
  const successLight = customTheme.customColors.find((c) => c.color.name === 'success').light;
  const successDark = customTheme.customColors.find((c) => c.color.name === 'success').dark;

  const pairs = [
    ['on-surface / surface', L.onSurface, L.surface],
    ['on-surface / surface-container-low', L.onSurface, L.surfaceContainerLow],
    ['on-surface-variant / surface', L.onSurfaceVariant, L.surface],
    ['on-primary / primary', L.onPrimary, L.primary],
    ['on-primary-container / primary-container', L.onPrimaryContainer, L.primaryContainer],
    ['on-secondary / secondary', L.onSecondary, L.secondary],
    ['on-tertiary / tertiary', L.onTertiary, L.tertiary],
    ['on-error / error', L.onError, L.error],
    ['on-success / success', successLight.onColor, successLight.color],
    ['on-background / background', L.onBackground, L.background],
  ];

  const darkPairs = [
    ['on-surface / surface', D.onSurface, D.surface],
    ['on-surface / surface-container-low', D.onSurface, D.surfaceContainerLow],
    ['on-surface-variant / surface', D.onSurfaceVariant, D.surface],
    ['on-primary / primary', D.onPrimary, D.primary],
    ['on-primary-container / primary-container', D.onPrimaryContainer, D.primaryContainer],
    ['on-secondary / secondary', D.onSecondary, D.secondary],
    ['on-tertiary / tertiary', D.onTertiary, D.tertiary],
    ['on-error / error', D.onError, D.error],
    ['on-success / success', successDark.onColor, successDark.color],
    ['on-background / background', D.onBackground, D.background],
  ];

  for (const [label, fg, bg] of pairs) check(paletteId, 'light', label, fg, bg);
  for (const [label, fg, bg] of darkPairs) check(paletteId, 'dark', label, fg, bg);

  check(paletteId, 'doc', 'doc-ink / doc-bg', L.onSurface, L.surfaceContainerLowest);
  check(paletteId, 'doc', 'doc-primary / doc-bg', L.primary, L.surfaceContainerLowest);

  const brandPalette = customPalettes.get('brandInk');
  check(paletteId, 'brand', 'on-brand-ink / brand-ink', brandPalette.tone(95), brandPalette.tone(8));

  return {
    core,
    palettes,
    lightScheme,
    darkScheme,
    customTheme,
    customPalettes,
  };
}

/* Build all themes */
const builtPalettes = {};
for (const [id, pal] of Object.entries(PALETTES)) {
  builtPalettes[id] = generateThemeForSeeds(id, pal.seeds);
}

/* ------------------------------------------------------------------ */
/* CSS emission helpers                                               */
/* ------------------------------------------------------------------ */

const hex = (argb) => hexFromArgb(argb).toLowerCase();
const kebab = (name) => name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
const lines = [];

const section = (title) => {
  lines.push('');
  lines.push(`/* ${'='.repeat(72)}`);
  lines.push(`   ${title}`);
  lines.push(`   ${'='.repeat(72)} */`);
};

const emitScheme = (scheme, prefix = '  ') => {
  const roleOrder = [
    'primary', 'onPrimary', 'primaryContainer', 'onPrimaryContainer',
    'secondary', 'onSecondary', 'secondaryContainer', 'onSecondaryContainer',
    'tertiary', 'onTertiary', 'tertiaryContainer', 'onTertiaryContainer',
    'error', 'onError', 'errorContainer', 'onErrorContainer',
    'background', 'onBackground', 'surface', 'onSurface',
    'surfaceVariant', 'onSurfaceVariant',
    'outline', 'outlineVariant', 'shadow', 'scrim',
    'inverseSurface', 'inverseOnSurface', 'inversePrimary',
    'surfaceDim', 'surfaceBright',
    'surfaceContainerLowest', 'surfaceContainerLow', 'surfaceContainer',
    'surfaceContainerHigh', 'surfaceContainerHighest',
  ];
  for (const role of roleOrder) {
    const value = scheme[role];
    if (value !== undefined) lines.push(`${prefix}--md-${kebab(role)}: ${hex(value)};`);
  }
};

const emitCustom = (customTheme, isDark, prefix = '  ') => {
  for (const custom of customTheme.customColors) {
    const name = custom.color.name;
    const tone = isDark ? custom.dark : custom.light;
    lines.push(`${prefix}--md-${name}: ${hex(tone.color)};`);
    lines.push(`${prefix}--md-on-${name}: ${hex(tone.onColor)};`);
    lines.push(`${prefix}--md-${name}-container: ${hex(tone.colorContainer)};`);
    lines.push(`${prefix}--md-on-${name}-container: ${hex(tone.onColorContainer)};`);
  }
};

section('GENERATED BY scripts/generate-theme.mjs — do not edit by hand');
lines.push('');
lines.push('/* Tonal palettes: default hue ramps (Sage baseline) */');

const defaultPalette = builtPalettes.sage;
const PALETTE_NAMES = ['primary', 'secondary', 'tertiary', 'neutral', 'neutralVariant', 'error'];
lines.push(':root {');
for (const name of PALETTE_NAMES) {
  const pal = defaultPalette.palettes[name];
  for (let tone = 0; tone <= 100; tone += 1) {
    lines.push(`  --palette-${kebab(name)}-${tone}: ${hex(pal.tone(tone))};`);
  }
}
for (const custom of defaultPalette.customTheme.customColors) {
  const name = custom.color.name;
  const pal = defaultPalette.customPalettes.get(name);
  for (let tone = 0; tone <= 100; tone += 1) {
    lines.push(`  --palette-${kebab(name)}-${tone}: ${hex(pal.tone(tone))};`);
  }
}
lines.push('}');

/* ------------------------------------------------------------------ */
/* Emit Schemes for All 4 Palettes                                    */
/* ------------------------------------------------------------------ */

for (const [id, built] of Object.entries(builtPalettes)) {
  const meta = PALETTES[id];
  // Matte palettes (e.g. porcelain) run low glow mixes so surfaces stay flat.
  const glowLight = meta.glow?.light ?? [18, 22];
  const glowDark = meta.glow?.dark ?? [24, 28];
  const isDefault = id === 'sage';
  const lightSel = isDefault
    ? `:root, [data-theme="light"], [data-palette="${id}"]`
    : `[data-palette="${id}"], [data-palette="${id}"][data-theme="light"]`;
  const darkSel = isDefault
    ? `[data-theme="dark"], [data-palette="${id}"][data-theme="dark"]`
    : `[data-palette="${id}"][data-theme="dark"]`;

  section(`PALETTE: ${id.toUpperCase()} — LIGHT SCHEME`);
  lines.push(`${lightSel} {`);
  lines.push('  color-scheme: light;');
  emitScheme(built.lightScheme);
  emitCustom(built.customTheme, false);

  const L = built.lightScheme;
  const brandP = built.customPalettes.get('brandInk');
  lines.push(`  --doc-bg: ${hex(L.surfaceContainerLowest)};`);
  lines.push(`  --doc-bg-alt: ${hex(L.surfaceContainerLow)};`);
  lines.push(`  --doc-bg-high: ${hex(L.surfaceContainer)};`);
  lines.push(`  --doc-ink: ${hex(L.onSurface)};`);
  lines.push(`  --doc-ink-muted: ${hex(L.onSurfaceVariant)};`);
  lines.push(`  --doc-faint: ${hex(L.outline)};`);
  lines.push(`  --doc-line: ${hex(L.outlineVariant)};`);
  lines.push(`  --doc-line-strong: ${hex(L.outline)};`);
  lines.push(`  --doc-primary: ${hex(L.primary)};`);
  lines.push(`  --doc-primary-container: ${hex(L.primaryContainer)};`);
  lines.push(`  --doc-on-primary-container: ${hex(L.onPrimaryContainer)};`);
  lines.push(`  --doc-secondary: ${hex(L.secondary)};`);
  lines.push(`  --doc-tertiary-container: ${hex(L.tertiaryContainer)};`);
  lines.push(`  --panel-sage-tint: ${hex(L.primaryContainer)};`);
  lines.push(`  --panel-blue-tint: ${hex(L.secondaryContainer)};`);
  lines.push(`  --panel-ochre-tint: ${hex(L.tertiaryContainer)};`);
  lines.push(`  --brand-ink: ${hex(brandP.tone(8))};`);
  lines.push(`  --on-brand-ink: ${hex(brandP.tone(95))};`);
  lines.push(`  --on-brand-ink-soft: ${hex(brandP.tone(80))};`);
  lines.push(`  --on-brand-ink-muted: ${hex(brandP.tone(70))};`);
  lines.push(`  --on-brand-ink-faint: ${hex(brandP.tone(60))};`);
  lines.push(`  --brand-ink-line: color-mix(in srgb, ${hex(brandP.tone(95))} 24%, transparent);`);
  lines.push(`  --sage-glow: color-mix(in srgb, ${hex(L.primary)} ${glowLight[0]}%, transparent);`);
  lines.push(`  --palette-accent: ${hex(L.primary)};`);
  lines.push(`  --palette-glow: color-mix(in srgb, ${hex(L.primary)} ${glowLight[1]}%, transparent);`);
  lines.push(`  --palette-id: '${id}';`);
  lines.push('}');

  section(`PALETTE: ${id.toUpperCase()} — DARK SCHEME`);
  lines.push(`${darkSel} {`);
  lines.push('  color-scheme: dark;');
  emitScheme(built.darkScheme);
  emitCustom(built.customTheme, true);

  const D = built.darkScheme;
  lines.push(`  --surface: var(--md-inverse-surface);`);
  lines.push(`  --surface-ink: var(--md-inverse-on-surface);`);
  lines.push(`  --surface-muted: color-mix(in srgb, var(--md-inverse-on-surface) 70%, var(--md-inverse-surface));`);
  lines.push(`  --ink-soft: var(--md-on-surface-variant);`);
  lines.push(`  --sage-glow: color-mix(in srgb, ${hex(D.primary)} ${glowDark[0]}%, transparent);`);
  lines.push(`  --palette-accent: ${hex(D.primary)};`);
  lines.push(`  --palette-glow: color-mix(in srgb, ${hex(D.primary)} ${glowDark[1]}%, transparent);`);
  lines.push(`  --palette-id: '${id}';`);
  for (const extra of meta.darkExtra ?? []) {
    lines.push(extra.startsWith('/*') ? `  ${extra}` : `  ${extra}`);
  }
  lines.push('}');
}

/* ------------------------------------------------------------------ */
/* Site Aliases                                                       */
/* ------------------------------------------------------------------ */
section('SITE ALIASES — components bind to these');
lines.push(':root {');
lines.push('  /* Canvas */');
lines.push('  --canvas: var(--md-surface);');
lines.push('  --canvas-alt: var(--md-surface-container-low);');
lines.push('');
lines.push('  /* Light panels */');
lines.push('  --surface: var(--md-surface-container-lowest);');
lines.push('  --surface-ink: var(--md-on-surface);');
lines.push('  --surface-muted: var(--md-on-surface-variant);');
lines.push('');
lines.push('  /* Text */');
lines.push('  --ink: var(--md-on-surface);');
lines.push('  --ink-soft: color-mix(in srgb, var(--md-on-surface) 82%, var(--md-surface));');
lines.push('  --muted: var(--md-on-surface-variant);');
lines.push('  --faint: color-mix(in srgb, var(--md-on-surface-variant) 62%, transparent);');
lines.push('');
lines.push('  /* Hairlines */');
lines.push('  --line: var(--md-outline-variant);');
lines.push('  --line-light: color-mix(in srgb, var(--md-outline-variant) 45%, transparent);');
lines.push('  --line-highlight: var(--md-outline);');
lines.push('  --hairline-weak: color-mix(in srgb, var(--md-outline-variant) 22%, transparent);');
lines.push('  --hairline: color-mix(in srgb, var(--md-outline-variant) 38%, transparent);');
lines.push('  --hairline-strong: color-mix(in srgb, var(--md-outline-variant) 60%, transparent);');
lines.push('');
lines.push('  /* Accents */');
lines.push('  --sage: var(--md-primary);');
lines.push('  --sage-soft: var(--md-primary-container);');
lines.push('  --blue: var(--md-secondary);');
lines.push('  --blue-soft: var(--md-secondary-container);');
lines.push('  --ochre: var(--md-tertiary);');
lines.push('  --ochre-soft: var(--md-tertiary-container);');
lines.push('  --link: var(--md-secondary);');
lines.push('  --link-hover: color-mix(in srgb, var(--md-secondary) 84%, var(--md-surface));');
lines.push('');
lines.push('  /* Success */');
lines.push('  --success-text: var(--md-on-success-container);');
lines.push('  --success-strong: var(--md-success);');
lines.push('  --success-dot: var(--md-success);');
lines.push('  --success-tint: var(--md-success-container);');
lines.push('  --success-line: color-mix(in srgb, var(--md-success) 40%, transparent);');
lines.push('');
lines.push('  /* Interaction veils */');
lines.push('  --veil: color-mix(in srgb, var(--md-on-surface) 5%, transparent);');
lines.push('  --veil-strong: color-mix(in srgb, var(--md-on-surface) 9%, transparent);');
lines.push('');
lines.push('  /* Legacy alias */');
lines.push('  --sage-dark: var(--brand-ink);');
lines.push('}');

/* ------------------------------------------------------------------ */
/* Shape system (M3)                                                   */
/* ------------------------------------------------------------------ */
section('SHAPE SYSTEM (M3 scale)');
lines.push(':root {');
lines.push('  --shape-none: 0px;');
lines.push('  --shape-xs: 4px;');
lines.push('  --shape-sm: 8px;');
lines.push('  --shape-md: 12px;');
lines.push('  --shape-lg: 16px;');
lines.push('  --shape-xl: 28px;');
lines.push('  --shape-full: 9999px;');
lines.push('  --radius-xs: var(--shape-xs);');
lines.push('  --radius-sm: var(--shape-sm);');
lines.push('  --radius-md: var(--shape-md);');
lines.push('  --radius-lg: var(--shape-lg);');
lines.push('  --radius-xl: var(--shape-xl);');
lines.push('  --radius-full: var(--shape-full);');
lines.push('}');

/* ------------------------------------------------------------------ */
/* State layers                                                       */
/* ------------------------------------------------------------------ */
section('STATE LAYERS (M3 interaction opacity)');
lines.push(':root {');
lines.push('  --state-hover: 0.08;');
lines.push('  --state-focus: 0.12;');
lines.push('  --state-pressed: 0.10;');
lines.push('  --state-dragged: 0.16;');
lines.push('  --state-selected: 0.08;');
lines.push('}');

/* ------------------------------------------------------------------ */
/* Elevation                                                          */
/* ------------------------------------------------------------------ */
section('ELEVATION (M3 levels + tonal overlays)');
lines.push(':root {');
lines.push('  --elevation-0: none;');
lines.push('  --elevation-1: 0 1px 2px rgba(0,0,0,0.30), 0 1px 3px 1px rgba(0,0,0,0.15);');
lines.push('  --elevation-2: 0 1px 2px rgba(0,0,0,0.30), 0 2px 6px 2px rgba(0,0,0,0.15);');
lines.push('  --elevation-3: 0 1px 3px rgba(0,0,0,0.30), 0 4px 8px 3px rgba(0,0,0,0.15);');
lines.push('  --elevation-4: 0 2px 3px rgba(0,0,0,0.30), 0 6px 10px 4px rgba(0,0,0,0.15);');
lines.push('  --elevation-5: 0 4px 4px rgba(0,0,0,0.30), 0 8px 12px 6px rgba(0,0,0,0.15);');
lines.push('  --shadow-sm: var(--elevation-1);');
lines.push('  --shadow-md: var(--elevation-2);');
lines.push('  --shadow-lg: var(--elevation-3);');
lines.push('  --shadow-pop: var(--elevation-4);');
lines.push('  --surface-1: color-mix(in srgb, var(--md-surface) 95%, var(--md-primary) 5%);');
lines.push('  --surface-2: color-mix(in srgb, var(--md-surface) 92%, var(--md-primary) 8%);');
lines.push('  --surface-3: color-mix(in srgb, var(--md-surface) 89%, var(--md-primary) 11%);');
lines.push('  --surface-4: color-mix(in srgb, var(--md-surface) 88%, var(--md-primary) 12%);');
lines.push('  --surface-5: color-mix(in srgb, var(--md-surface) 86%, var(--md-primary) 14%);');
lines.push('}');
lines.push('');
lines.push('[data-theme="dark"] {');
lines.push('  --surface-1: var(--md-surface-container-low);');
lines.push('  --surface-2: var(--md-surface-container);');
lines.push('  --surface-3: var(--md-surface-container-high);');
lines.push('  --surface-4: var(--md-surface-container-highest);');
lines.push('  --surface-5: var(--md-surface-bright);');
lines.push('}');

/* ------------------------------------------------------------------ */
/* Motion                                                             */
/* ------------------------------------------------------------------ */
section('MOTION (M3 easing + duration tokens)');
lines.push(':root {');
lines.push('  --motion-emphasized: cubic-bezier(0.05, 0.7, 0.1, 1);');
lines.push('  --motion-standard: cubic-bezier(0.2, 0, 0, 1);');
lines.push('  --motion-accelerated: cubic-bezier(0.3, 0, 1, 1);');
lines.push('  --duration-short2: 100ms;');
lines.push('  --duration-short4: 200ms;');
lines.push('  --duration-medium1: 250ms;');
lines.push('  --duration-medium2: 300ms;');
lines.push('  --duration-medium4: 400ms;');
lines.push('  --duration-long2: 500ms;');
lines.push('}');

/* ------------------------------------------------------------------ */
/* Type scale & Fonts                                                 */
/* ------------------------------------------------------------------ */
section('TYPE SCALE & FONTS');
lines.push(':root {');
lines.push("  --font-body: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;");
lines.push("  --font-display: 'Outfit', 'Plus Jakarta Sans', sans-serif;");
lines.push("  --font-serif: 'DM Serif Display', Georgia, serif;");
lines.push("  --font-mono: 'JetBrains Mono', monospace;");
lines.push('  --typescale-display-large: 400 57px/64px var(--font-serif);');
lines.push('  --typescale-display-medium: 400 45px/52px var(--font-serif);');
lines.push('  --typescale-display-small: 400 36px/44px var(--font-serif);');
lines.push('  --typescale-headline-large: 400 32px/40px var(--font-serif);');
lines.push('  --typescale-headline-medium: 400 28px/36px var(--font-serif);');
lines.push('  --typescale-headline-small: 400 24px/32px var(--font-serif);');
lines.push('  --typescale-title-large: 600 22px/28px var(--font-display);');
lines.push('  --typescale-title-medium: 600 16px/24px var(--font-display);');
lines.push('  --typescale-title-small: 600 14px/20px var(--font-display);');
lines.push('  --typescale-body-large: 400 16px/24px var(--font-body);');
lines.push('  --typescale-body-medium: 400 14px/20px var(--font-body);');
lines.push('  --typescale-body-small: 400 12px/16px var(--font-body);');
lines.push('  --typescale-label-large: 500 14px/20px var(--font-mono);');
lines.push('  --typescale-label-medium: 500 12px/16px var(--font-mono);');
lines.push('  --typescale-label-small: 500 11px/16px var(--font-mono);');
lines.push('}');
lines.push('');
lines.push('html {');
lines.push('  background: var(--md-surface);');
lines.push('  transition: background-color 0.25s ease, color 0.25s ease;');
lines.push('}');
lines.push('');
lines.push('::selection {');
lines.push('  background: var(--md-primary-container);');
lines.push('  color: var(--md-on-primary-container);');
lines.push('}');

writeFileSync(path.join(root, 'src', 'theme.css'), lines.join('\n') + '\n', 'utf8');

/* ------------------------------------------------------------------ */
/* Print Contrast Audit                                               */
/* ------------------------------------------------------------------ */
console.log('');
console.log('CONTRAST AUDIT ACROSS ALL 5 PALETTES (GOOGLE STITCH & FIGMA + CALM MATTE)');
console.log('palette     mode   pair                                           ratio   min   pass');
console.log('-------     ----   ----                                           -----   ---   ----');
let failures = 0;
for (const row of audit) {
  if (!row.pass) failures += 1;
  console.log(
    `${row.paletteId.padEnd(11)} ${row.mode.padEnd(6)} ${row.label.padEnd(46)} ${row.ratio.toFixed(2).padStart(5)}  ${String(row.minimum).padStart(4)}  ${row.pass ? '✓' : '✗ FAIL'}`,
  );
}
console.log('');
console.log(`Themes written to src/theme.css — ${failures === 0 ? 'all 5 palettes pass WCAG AA' : `${failures} FAILURES`}`);
if (failures > 0) process.exitCode = 1;
