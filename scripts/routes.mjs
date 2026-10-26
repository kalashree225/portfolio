/**
 * Public routes used by the GitHub Pages build.
 *
 * GitHub Pages has no SPA rewrite rule, so a request for /portfolio/work would
 * normally return 404.html. The build writes a small static HTML shell for each
 * route below, giving search engines a 200 response and a route-specific title.
 *
 * Keep this list in sync with src/config.ts when projects, articles, or
 * concepts are added.
 */

export const SITE_ORIGIN = 'https://kalashree225.github.io';
export const SITE_BASE = '/portfolio';
export const SITE_URL = `${SITE_ORIGIN}${SITE_BASE}`;

export const routes = [
  {
    path: '/',
    title: 'Kalashree — AI, Data & Software Systems',
    description:
      'Portfolio and interactive résumé of Kalashree — building intelligent systems, dependable backends, and clear interfaces.',
    changefreq: 'monthly',
    priority: 1.0,
  },
  {
    path: '/work',
    title: 'Work — Kalashree',
    description:
      'Selected AI, data, backend, and frontend projects, including StockLedger.',
    changefreq: 'monthly',
    priority: 0.9,
  },
  {
    path: '/about',
    title: 'About — Kalashree',
    description:
      'Background, technical philosophy, and working principles of Kalashree, a developer building AI, data, and software systems.',
    changefreq: 'yearly',
    priority: 0.7,
  },
  {
    path: '/writing',
    title: 'Writing — Kalashree',
    description:
      'Engineering notes on production APIs, data pipelines, transaction boundaries, and diagrams as structured data.',
    changefreq: 'monthly',
    priority: 0.9,
  },
  {
    path: '/contact',
    title: 'Contact — Kalashree',
    description:
      'Get in touch with Kalashree about AI, data, backend, and software systems work.',
    changefreq: 'yearly',
    priority: 0.6,
  },
  {
    path: '/work/stockledger',
    title: 'StockLedger — Kalashree',
    description:
      'StockLedger is a dependable inventory and order management system built around explicit data models, migrations, worker processes, and testable behavior.',
    changefreq: 'monthly',
    priority: 0.8,
  },
  {
    path: '/writing/notes/designing-a-production-api',
    title: 'Designing a Production API — Kalashree',
    description:
      'Where the boundaries belong in an API that has to keep serving when one of its dependencies stops answering.',
    changefreq: 'yearly',
    priority: 0.8,
  },
  {
    path: '/writing/notes/etl-pipelines-people-trust',
    title: 'ETL Pipelines People Can Trust — Kalashree',
    description:
      'Why contract-first semantic layers, and not more monitoring, are what stop a data pipeline from being quietly wrong.',
    changefreq: 'yearly',
    priority: 0.8,
  },
  {
    path: '/writing/notes/transactional-boundaries-prevent-drift',
    title: 'Transactional Boundaries That Prevent Drift — Kalashree',
    description:
      'How the same five units get sold twice, and why the fix is drawing the transaction boundary correctly rather than adding retries.',
    changefreq: 'yearly',
    priority: 0.8,
  },
  {
    path: '/writing/notes/diagrams-as-data',
    title: 'Diagrams as Data — Kalashree',
    description:
      'Treating architecture diagrams as structured nodes and edges instead of exported images, and what that buys in a web interface.',
    changefreq: 'yearly',
    priority: 0.8,
  },
  {
    path: '/writing/concepts/api-gateway',
    title: 'API Gateway — Kalashree',
    description:
      'The single entry point for client requests. Owns authentication, routing, rate limiting, and request identity — and no business logic.',
    changefreq: 'yearly',
    priority: 0.6,
  },
  {
    path: '/writing/concepts/redis-caching',
    title: 'Cache Tiers and Invalidation — Kalashree',
    description:
      'Edge caches for anonymous reads, Redis for authenticated reads. Versioned keys, because invalidating by deletion does not survive concurrency.',
    changefreq: 'yearly',
    priority: 0.6,
  },
  {
    path: '/writing/concepts/postgresql',
    title: 'PostgreSQL — Kalashree',
    description:
      'The source of truth. Explicit transaction boundaries, row locks for concurrent writers, and typed schemas that make drift visible early.',
    changefreq: 'yearly',
    priority: 0.6,
  },
  {
    path: '/writing/concepts/rate-limiting',
    title: 'Rate Limiting — Kalashree',
    description:
      'A token bucket per tenant at the gateway, with headers that tell a client what happened rather than failing silently.',
    changefreq: 'yearly',
    priority: 0.6,
  },
  {
    path: '/writing/concepts/etl',
    title: 'ETL Pipelines — Kalashree',
    description:
      'Normalising many source shapes into one schema, then exposing that schema through contracts instead of raw tables.',
    changefreq: 'yearly',
    priority: 0.6,
  },
  {
    path: '/writing/concepts/semantic-layer',
    title: 'Semantic Layer — Kalashree',
    description:
      'Typed views with descriptions, units, and freshness expectations, so consumers depend on a contract rather than a physical table.',
    changefreq: 'yearly',
    priority: 0.6,
  },
  {
    path: '/writing/concepts/evaluation',
    title: 'Evaluation Gates — Kalashree',
    description:
      'Automated checks — row counts, null ratios, drift, referential integrity — that run before any visualisation is allowed to render.',
    changefreq: 'yearly',
    priority: 0.6,
  },
  {
    path: '/writing/concepts/transactions',
    title: 'Explicit Transaction Boundaries — Kalashree',
    description:
      'The read and the decision and the write all inside one transaction. Locking the row for the decision is what serialises concurrent writers.',
    changefreq: 'yearly',
    priority: 0.6,
  },
  {
    path: '/writing/concepts/alembic',
    title: 'Migration Discipline — Kalashree',
    description:
      'Each migration compatible with both the previous and the next release, so a rolling deploy never meets a schema it cannot read.',
    changefreq: 'yearly',
    priority: 0.6,
  },
  {
    path: '/writing/concepts/worker-queues',
    title: 'Background Workers — Kalashree',
    description:
      'Receipts, notifications, and report generation moved outside the transaction, so the lock stays short and the API stays fast.',
    changefreq: 'yearly',
    priority: 0.6,
  },
  {
    path: '/writing/concepts/dependency-graphs',
    title: 'Dependency Graphs — Kalashree',
    description:
      'Showing how parts of a system reference each other. Useful right up to the point where the graph becomes a hairball and needs filtering instead of drawing.',
    changefreq: 'yearly',
    priority: 0.6,
  },
  {
    path: '/writing/concepts/diagrams-as-structured-data',
    title: 'Diagrams as Structured Data — Kalashree',
    description:
      'Nodes and edges with grid coordinates, rendered to SVG at read time, so a diagram inherits theme and scales without a second asset.',
    changefreq: 'yearly',
    priority: 0.6,
  },
];
