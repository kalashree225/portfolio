# Kalashree — Systems, Data & Engineering Portfolio

A personal portfolio and interactive technical writing system for **Kalashree**, focused on AI backends, distributed data pipelines, and clear developer tools.

Built with a Material 3-inspired editorial aesthetic: a Rosewater & Mulberry dark theme, restrained frosted-glass surfaces, soft lilac lighting, responsive data-driven SVG diagrams, in-browser reading modes with persistent text annotations, and a headless Chromium résumé PDF generation pipeline. The home page leads with selected work, then practice areas and verified portfolio counts.

---

## ✦ Core Design Principles

1. **Defensible by Design**: Every number, date, and claim on this site is something the author can defend. Rather than inventing uptime or throughput claims, "at a glance" metrics reflect real repository artifacts, documented architectures, and written engineering notes.
2. **Material 3, editorially composed**: A plum-toned dark canvas, translucent elevated surfaces, rose primary actions, and muted lilac accents keep the interface legible without flattening its personality. Serif display typography (`DM Serif Display`), body prose (`Plus Jakarta Sans`), and technical labels (`JetBrains Mono`) establish a clear hierarchy. Light mode remains available from the navigation.
3. **Diagrams as Data**: Architectural topologies are defined as structured node and edge graphs (`DiagramNode[]`, `DiagramEdge[]`) rendered as dynamic inline SVG with responsive coordinates and automatic theme inheritance.
4. **Interactive Writing System**: Essays feature three reader modes: **Read**, **Explore** (interactive simulation models), and **Annotate** (semantic text highlights and sticky notes saved across sessions).
5. **Single Source of Truth for Résumé**: The on-screen résumé modal and the downloadable `public/resume.pdf` share the exact same component (`ResumePaper`), compiled headlessly with Edge/Chromium to guarantee zero drift.

---

## ✦ Pages & Route Structure

| Route | View | Description |
|---|---|---|
| `/` | `Home` | Branded hero, selected-project deck, practice areas, and verified portfolio counts |
| `/work` | `Work` | Category-filterable project index across AI & backend, Data, Tools, and Frontend |
| `/work/:slug` | `ProjectDetail` | Detailed case study with interactive system topology diagram, architecture breakdown, and link to engineering essay |
| `/about` | `About` | Background, technical philosophy, and working principles |
| `/writing` | `Writing` | Technical hub: written engineering notes, concept graph, implementation backlog, and curated reading paths |
| `/writing/notes/:slug` | `Article` | Full essay with table of contents, reading progress, interactive model, and annotation tools |
| `/writing/concepts/:slug` | `Concept` | Concept deep-dive with interconnected articles and bidirectional relationships |
| `/contact` | `Contact` | Contact channel with copyable email, social links, and structured inquiry composer |
| `/print/resume` | `PrintResume` | Isolated print layout consumed by the headless PDF generation script |

---

## ✦ Documented Project

- **StockLedger**: High-concurrency inventory and order management system with strict transaction boundaries and asynchronous worker offloading.

---

## ✦ Writing & Interactive Systems

- **Reading Modes**:
  - **Read** (Key: `R`): Uncluttered long-form prose with responsive section tracking.
  - **Explore** (Key: `E`): Embedded deterministic simulation models (e.g. cache hit/miss behavior and failover under load).
  - **Annotate** (Key: `A`): DOM-offset-based highlight and marginalia system stored in `localStorage`. Survives window resizing and font reflow.
- **Interactive Models**: Deterministic arithmetic engines with transparent mathematical formulas rather than synthetic or random telemetry.

---

## ✦ Tech Stack

- **Runtime & UI**: React 19, TypeScript, React Router 7
- **Styling**: Vanilla CSS token ramp (`theme.css` + `index.css`) with Material 3 role tokens and Material Color Utilities
- **Bundler & Tooling**: Vite 7, ESLint 9
- **Headless Printing**: Puppeteer Core / Microsoft Edge headless driver
- **Typography**: Google Fonts (*DM Serif Display*, *Plus Jakarta Sans*, *JetBrains Mono*, *Outfit*)

---

## ✦ Development & Scripts

### Prerequisites

- Node.js 18+
- npm or pnpm
- Google Chrome or Microsoft Edge (for PDF résumé generation)

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) (or `http://localhost:3000` depending on port assignment).

### Typecheck & Production Build

```bash
npm run build
```

### Automated Test Suite

Runs the Vitest suite validating data integrity, diagram linkage, word count math, and theme contrast compliance:

```bash
npm test
```

### Code Quality & Linting

```bash
npm run lint
```

### Google Stitch & Figma Theme Generator

Regenerates all 4 curated designer colorways (Sage Technical, Obsidian Indigo, Terracotta Amber, Nordic Frost) using Google's HCT color math with automated WCAG AA contrast audits:

```bash
npm run theme
```

### Headless Résumé PDF Generation

Compiles the print target bundle and renders a fresh `public/resume.pdf` using headless Chromium:

```bash
npm run resume:pdf
```

### Deploy to GitHub Pages

This repository is configured for a GitHub Pages project site at
`https://kalashree225.github.io/portfolio/`.

1. In the GitHub repository, open **Settings → Pages** and set
   **Build and deployment → Source** to **GitHub Actions**.
2. Commit and push to `main`.
3. The workflow in `.github/workflows/deploy.yml` installs dependencies, runs
   `npm run build:pages`, and publishes `dist/`.
4. Every later push to `main` redeploys automatically. You can also start a
   deployment from the **Actions** tab with **Run workflow**.

`npm run build:pages` runs the normal production build and copies
`dist/index.html` to `dist/404.html`, so direct links to routes such as
`/portfolio/work/stockledger` still load the React app on Pages.

The production base path is set in `vite.config.ts` to `/portfolio/`. If the
repository is renamed or the site moves to a custom domain, update that value
(and the router basename follows it automatically).

---

## ✦ Content Customization

All primary data lives in `src/config.ts`:
- **`site`**: Name, email, GitHub profile, LinkedIn profile, contact endpoint.
- **`projects`**: Project metadata, technology stacks, descriptions, and diagram associations.
- **`articles`**: Written essays, block contents, associated project links, and concept tags.
- **`diagrams`**: Node-and-edge coordinate models for inline SVG architecture diagrams.
- **`resumeData`**: Practice areas, core skills, selected work, and engineering principles.
