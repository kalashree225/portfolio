/* ============================================================================
   CONTENT SOURCE OF TRUTH

   Editorial rule for this file: every number, date, and claim here must be
   something the author can defend. Where a real metric does not exist, the
   content says what was actually built instead of inventing a figure.

   - Projects: real repositories, really written.
   - Articles: written essays with block content, linked to the project they
     came from. `date` is optional and only set when a piece was actually
     finished; without it the piece is an undated working note.
   - Notes: ideas that are NOT written yet. They never carry a date.
   - Résumé: figures are counts of things in this repository, not uptime or
     latency claims.
   ========================================================================== */

export type ProjectCategory = 'AI & backend' | 'Data' | 'Tools' | 'Frontend';

export interface Project {
  slug: string;
  name: string;
  category: ProjectCategory;
  year: string;
  summary: string;
  description: string;
  stack: string[];
  repo: string;
  accent: string;
  featured?: boolean;
  diagramId?: string;
  details: string[];
}

export const projects: Project[] = [
  {
    slug: 'stockledger',
    name: 'StockLedger',
    category: 'AI & backend',
    year: '2026',
    summary: 'A dependable inventory and order management system designed around clear domain logic.',
    description: 'A backend-first product system with a focus on explicit data models, migrations, worker processes, and testable behavior.',
    stack: ['Python', 'PostgreSQL', 'Alembic', 'Workers'],
    repo: 'https://github.com/kalashree225/stockledger',
    accent: 'ochre',
    diagramId: 'transaction-boundary',
    details: ['Inventory and order workflows', 'Database migration discipline', 'Worker-based processing'],
  },
];

export const site = {
  name: 'Kalashree',
  title: 'Kalashree — AI, data & software systems',
  description: 'A portfolio of thoughtful AI, data, backend, and frontend projects.',
  email: 'hello@kalashree.dev',
  github: 'https://github.com/kalashree225',
  linkedin: 'https://www.linkedin.com/in/kalashree',
  // Optional form endpoint (Formspree / Web3Forms). Leave empty to use
  // mailto-compose only. Example: 'https://formspree.io/f/xxxxxx'
  contactEndpoint: '',
};

/* ---------------------------------------------------------------------------
   IDEAS — questions that do not have a written answer yet.
   These deliberately have no date and no body. They are the honest backlog.
   ------------------------------------------------------------------------- */

export type NoteStatus = 'Planned' | 'Drafting';

export interface Note {
  slug: string;
  title: string;
  question: string;
  status: NoteStatus;
  category: ProjectCategory;
  /** Optional: an idea can come from a project, but does not have to. */
  projectSlug?: string;
  angle: string;
  /** The smallest useful thing that would turn the idea into evidence. */
  implementation: string;
  outline: string[];
}

export const notes: Note[] = [
  {
    slug: 'idempotent-writes',
    title: 'Writes that survive a double click',
    question: 'What should happen when the same request arrives three times?',
    status: 'Drafting',
    category: 'AI & backend',
    angle: 'Idempotency keys, replay safety, and why retries need a ledger rather than optimism.',
    implementation:
      'A request-key ledger plus a replay test proving the second and third calls return the first result without writing again.',
    outline: [
      'Where the key is generated, and who owns it',
      'Storing the response alongside the key',
      'What to do when the first attempt is still running',
    ],
  },
  {
    slug: 'cache-miss-cost',
    title: 'What a cache miss actually costs',
    question: 'When does a cache stop paying for its own complexity?',
    status: 'Planned',
    category: 'AI & backend',
    angle: 'A latency budget for hit ratios, invalidation, and the reads that should never be cached.',
    implementation:
      'A deterministic calculator mapping hit ratio and origin latency to a p95 estimate, with every assumption printed beside the result.',
    outline: [
      'Separating cache latency from origin latency',
      'The hit ratio where the cache stops earning its keep',
      'Why writes should never enter the cache path',
    ],
  },
  {
    slug: 'evaluation-gates',
    title: 'Evaluation gates that fail loudly',
    question: 'How do you stop a wrong number from reaching a dashboard?',
    status: 'Planned',
    category: 'Data',
    angle: 'Row counts, null ratios, drift, and referential checks as a blocking step rather than a report.',
    implementation:
      'A small Python gate runner that halts a render on the first failed check and prints the failing window and threshold.',
    outline: [
      'Choosing checks that catch real breakage',
      'Thresholds that do not cry wolf',
      'Making a failed gate easy to diagnose',
    ],
  },
  {
    slug: 'document-schema-discipline',
    title: 'Schema discipline without migrations',
    question: 'How do you evolve documents when there is no migration step?',
    status: 'Planned',
    category: 'Data',
    angle: 'Versioned documents, validation rules, and backfills in a MongoDB-shaped store.',
    implementation:
      'A version field, a JSON schema validator, and a resumable backfill script that upgrades old documents one batch at a time.',
    outline: [
      'What a document version buys you',
      'Validation at the boundary, not in every reader',
      'Backfills that can be stopped and resumed',
    ],
  },
  {
    slug: 'interface-is-a-contract',
    title: 'The interface is part of the API contract',
    question: 'Who owns the error state when a request fails?',
    status: 'Planned',
    category: 'Frontend',
    angle: 'Typed error envelopes and interface states that match what the backend can actually return.',
    implementation:
      'One typed error shape rendered through a shared component, exercised by three failure fixtures in the test suite.',
    outline: [
      'A single error envelope instead of ad-hoc messages',
      'Loading, empty, and failed as first-class states',
      'Keeping retries honest in the interface',
    ],
  },
];

/* ============================================================================
   DIAGRAMS
   Diagrams are data, not pictures: nodes, edges, and annotations that the
   DiagramRenderer draws as inline SVG. Keeping them as data means they stay
   legible on any screen, inherit theme colors, and can be inspected by the
   selection tools.

   `status: 'model'` means this is the shape the project converged on, drawn
   from the implementation — not a screenshot of a running deployment.
   ========================================================================== */

export interface DiagramNode {
  id: string;
  label: string;
  sublabel?: string;
  /** 12-column grid coordinates, so the layout scales with the container. */
  col: number;
  row: number;
  colSpan?: number;
  rowSpan?: number;
  role?: 'neutral' | 'signal' | 'muted' | 'accent';
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
  style?: 'solid' | 'dashed';
}

export interface Diagram {
  id: string;
  title: string;
  caption: string;
  status: 'model' | 'sketch';
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export const diagrams: Diagram[] = [
  {
    id: 'api-architecture-v1',
    title: 'Request path through a production API',
    caption:
      'A model of the request path: the gateway owns cross-cutting concerns, handlers own business logic, and the datastore is the only hard dependency.',
    status: 'model',
    nodes: [
      { id: 'client', label: 'Client', sublabel: 'browser / service', col: 0, row: 1, colSpan: 2, role: 'muted' },
      { id: 'edge', label: 'Edge cache', sublabel: 'anonymous reads', col: 3, row: 0, colSpan: 3, role: 'neutral' },
      { id: 'gateway', label: 'API gateway', sublabel: 'auth · limits · ids', col: 3, row: 2, colSpan: 3, role: 'signal' },
      { id: 'handler', label: 'Handlers', sublabel: 'business logic', col: 7, row: 2, colSpan: 2, role: 'signal' },
      { id: 'redis', label: 'Redis', sublabel: 'authenticated reads', col: 7, row: 0, colSpan: 2, role: 'accent' },
      { id: 'postgres', label: 'PostgreSQL', sublabel: 'source of truth', col: 7, row: 3, colSpan: 3, role: 'accent' },
      { id: 'workers', label: 'Workers', sublabel: 'async work', col: 10, row: 1, colSpan: 2, role: 'muted' },
    ],
    edges: [
      { from: 'client', to: 'edge', label: 'read' },
      { from: 'client', to: 'gateway', label: 'write' },
      { from: 'edge', to: 'handler', style: 'dashed', label: 'hit' },
      { from: 'gateway', to: 'handler' },
      { from: 'handler', to: 'redis', style: 'dashed' },
      { from: 'handler', to: 'postgres' },
      { from: 'redis', to: 'postgres', style: 'dashed', label: 'miss' },
      { from: 'handler', to: 'workers', style: 'dashed' },
    ],
  },
  {
    id: 'etl-contract-flow',
    title: 'Contract-first ETL flow',
    caption:
      'Ingestion is only half the pipeline. The semantic layer is the contract, and evaluation runs before anything is allowed to render.',
    status: 'model',
    nodes: [
      { id: 'sources', label: 'Sources', sublabel: 'csv · json · api', col: 0, row: 1, colSpan: 2, role: 'muted' },
      { id: 'ingest', label: 'Normalise', sublabel: 'one schema', col: 2, row: 1, colSpan: 2, role: 'neutral' },
      { id: 'store', label: 'PostgreSQL', sublabel: 'typed tables', col: 5, row: 1, colSpan: 2, role: 'accent' },
      { id: 'semantic', label: 'Semantic layer', sublabel: 'contract · units · SLA', col: 8, row: 0, colSpan: 4, role: 'signal' },
      { id: 'eval', label: 'Evaluation gate', sublabel: 'counts · nulls · drift', col: 8, row: 2, colSpan: 4, role: 'signal' },
      { id: 'consumers', label: 'Consumers', sublabel: 'dashboards · features', col: 5, row: 3, colSpan: 4, role: 'muted' },
    ],
    edges: [
      { from: 'sources', to: 'ingest' },
      { from: 'ingest', to: 'store' },
      { from: 'store', to: 'semantic', label: 'expose' },
      { from: 'semantic', to: 'eval', label: 'check' },
      { from: 'eval', to: 'consumers', label: 'pass' },
      { from: 'store', to: 'consumers', style: 'dashed', label: 'blocked' },
    ],
  },
  {
    id: 'transaction-boundary',
    title: 'One transaction per stock mutation',
    caption:
      'Every path that changes stock enters the same boundary. Reads outside a transaction are what let two orders both believe five units exist.',
    status: 'model',
    nodes: [
      { id: 'order-a', label: 'Order A', sublabel: 'reserve 2', col: 0, row: 0, colSpan: 3, role: 'muted' },
      { id: 'order-b', label: 'Order B', sublabel: 'reserve 2', col: 0, row: 2, colSpan: 3, role: 'muted' },
      { id: 'boundary', label: 'BEGIN', sublabel: 'transaction boundary', col: 4, row: 1, colSpan: 3, role: 'signal' },
      { id: 'lock', label: 'SELECT … FOR UPDATE', sublabel: 'serialises writers', col: 8, row: 1, colSpan: 4, role: 'accent' },
      { id: 'commit', label: 'COMMIT', sublabel: 'stock consistent', col: 4, row: 2, colSpan: 3, role: 'neutral' },
      { id: 'workers', label: 'Worker', sublabel: 'receipt · notify', col: 8, row: 3, colSpan: 4, role: 'muted' },
    ],
    edges: [
      { from: 'order-a', to: 'boundary' },
      { from: 'order-b', to: 'boundary' },
      { from: 'boundary', to: 'lock' },
      { from: 'lock', to: 'commit' },
      { from: 'commit', to: 'workers', style: 'dashed', label: 'after' },
    ],
  },
  {
    id: 'annotation-layer',
    title: 'How the annotation layer is stacked',
    caption:
      'The drawing surface is a transparent canvas over the article. Text stays selectable underneath, which is why selection and annotation can coexist.',
    status: 'model',
    nodes: [
      { id: 'article', label: 'Article DOM', sublabel: 'selectable text', col: 1, row: 0, colSpan: 5, role: 'neutral' },
      { id: 'canvas', label: 'Canvas overlay', sublabel: 'pen · highlight · text', col: 1, row: 1, colSpan: 5, role: 'signal' },
      { id: 'history', label: 'History stack', sublabel: 'undo · redo', col: 1, row: 2, colSpan: 5, role: 'muted' },
      { id: 'store', label: 'Workspace store', sublabel: 'localStorage', col: 7, row: 1, colSpan: 4, role: 'accent' },
      { id: 'export', label: 'Export', sublabel: 'json · print', col: 7, row: 2, colSpan: 4, role: 'muted' },
    ],
    edges: [
      { from: 'article', to: 'canvas', label: 'over' },
      { from: 'canvas', to: 'history' },
      { from: 'history', to: 'store', style: 'dashed' },
      { from: 'store', to: 'export' },
    ],
  },
];

/* ============================================================================
   EXPERIMENTS
   Deterministic teaching models, not fabricated telemetry. Each experiment
   computes its output from the control values using arithmetic that is shown
   in the interface, so a reader can check the result by hand.
   ========================================================================== */

export interface ExperimentControl {
  id: string;
  type: 'range' | 'select' | 'toggle';
  label: string;
  hint?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  default: unknown;
}

export interface Experiment {
  id: string;
  title: string;
  description: string;
  /** Plain-language explanation of exactly how outputs are derived. */
  model: string;
  controls: ExperimentControl[];
  initialState: Record<string, unknown>;
}

export const experiments: Experiment[] = [
  {
    id: 'cache-behavior-demo',
    title: 'Cache behaviour under load',
    description:
      'A deterministic model of where read traffic goes once a cache sits in front of the database, and what happens when that cache disappears.',
    model:
      'Each request either hits a cache or falls through to PostgreSQL. Hit ratios are fixed assumptions (edge 0.72, Redis 0.86), stated in the readout so you can recompute every number by hand. Under a failure mode, the affected layer stops absorbing traffic and its share lands on PostgreSQL.',
    controls: [
      { id: 'traffic', type: 'range', label: 'Traffic', hint: 'requests per minute', min: 10000, max: 100000, step: 10000, default: 50000 },
      { id: 'cache', type: 'select', label: 'Cache layer', hint: 'how many tiers absorb reads', options: ['none', 'redis', 'redis+edge'], default: 'redis' },
      { id: 'replication', type: 'toggle', label: 'Read replicas', hint: 'spread database reads across two nodes', default: false },
      { id: 'failure', type: 'select', label: 'Failure mode', hint: 'what breaks', options: ['none', 'redis-down', 'replica-lag', 'network-partition'], default: 'none' },
    ],
    initialState: { traffic: 50000, cache: 'redis', replication: false, failure: 'none' },
  },
];

/* ============================================================================
   ARTICLES
   ========================================================================== */

export type ArticleBlockType =
  | 'paragraph'
  | 'heading'
  | 'code'
  | 'quote'
  | 'table'
  | 'callout'
  | 'diagram'
  | 'interactive';

export interface ArticleBlock {
  id: string;
  type: ArticleBlockType;
  content: string;
  meta?: Record<string, unknown>;
}

export interface ConceptRelation {
  target: string;
  type:
    | 'related-to'
    | 'prerequisite-for'
    | 'alternative-to'
    | 'explains'
    | 'expands-on'
    | 'tradeoff-of'
    | 'implementation-of';
}

export interface ArticleConcept {
  slug: string;
  title: string;
  description: string;
  relatedArticles: string[];
  relations: ConceptRelation[];
}

export interface Article {
  slug: string;
  title: string;
  description: string;
  /** Set only when the piece was actually finished. Undated = working note. */
  date?: string;
  updated?: string;
  topics: ProjectCategory[];
  featured: boolean;
  interactive: boolean;
  /** The project this piece came out of, so every essay traces to real work. */
  projectSlug?: string;
  concepts: string[];
  blocks: ArticleBlock[];
}

export const articles: Article[] = [
  {
    slug: 'designing-a-production-api',
    title: 'Designing a Production API',
    description:
      'Where the boundaries belong in an API that has to keep serving when one of its dependencies stops answering.',
    topics: ['AI & backend', 'Data'],
    featured: true,
    interactive: true,
    concepts: ['api-gateway', 'redis-caching', 'postgresql', 'rate-limiting'],
    blocks: [
      {
        id: 'intro',
        type: 'paragraph',
        content:
          'An API that works in development and an API that survives production differ in one respect: the second one has decided, in advance, what it does when a dependency stops answering. Framework choice barely enters into it. What matters is where you draw the boundaries, and which side of each boundary owns a failure.',
      },
      { id: 'architecture', type: 'heading', content: 'The shape everything converges on' },
      {
        id: 'arch-para',
        type: 'paragraph',
        content:
          'Most APIs I have built end up with the same three parts: a thin layer that handles cross-cutting concerns, stateless handlers that hold the actual logic, and a datastore that is the only component allowed to be authoritative. Every one of those parts fails differently, and the design is really about deciding which failures are survivable.',
      },
      {
        id: 'api-diagram',
        type: 'diagram',
        content: '',
        meta: { diagramId: 'api-architecture-v1' },
      },
      { id: 'gateway', type: 'heading', content: 'The gateway should be boring' },
      {
        id: 'gateway-para',
        content:
          'The gateway authenticates, applies rate limits, attaches a request id, and logs. It should not know what a customer is. The moment business logic leaks upward, every future change has to be made in two places, and the cross-cutting layer becomes the hardest thing in the system to test.',
        type: 'paragraph',
      },
      {
        id: 'gateway-code',
        type: 'code',
        content: `// Crossing-cutting concerns, in the order they matter.
app.use(requestId());          // so every later log line is traceable
app.use(authenticate());       // reject before doing any work
app.use(rateLimit({ windowMs: 60_000, max: 1_000 }));
app.use(logging());

// No business logic here. Handlers own that.`,
        meta: { language: 'javascript' },
      },
      {
        id: 'gateway-callout',
        type: 'callout',
        content:
          'A useful test: if you deleted every handler and replaced them with stubs, the gateway should still work exactly the same way.',
        meta: { variant: 'note' },
      },
      { id: 'caching', type: 'heading', content: 'Caching is a decision about staleness' },
      {
        id: 'caching-para',
        type: 'paragraph',
        content:
          'Caching is not a performance setting; it is a decision about how stale a response is allowed to be, made per read path. Anonymous reads tolerate a slow-changing edge cache. Authenticated reads usually tolerate a short Redis window. Writes tolerate nothing, and caching them is where correctness goes to die.',
      },
      {
        id: 'caching-para-2',
        type: 'paragraph',
        content:
          'Invalidation is the part people skip. Versioned cache keys tied to the entity mutation are the least clever approach that works: instead of hunting down entries to delete, you change the key so the old entries can no longer be found.',
      },
      {
        id: 'cache-experiment',
        type: 'interactive',
        content: '',
        meta: { experimentId: 'cache-behavior-demo' },
      },
      { id: 'failure', type: 'heading', content: 'Design around the weakest dependency' },
      {
        id: 'failure-para',
        type: 'paragraph',
        content:
          'Two dependencies, two completely different failure stories. When the cache goes down, reads should degrade: serve the source of truth directly, accept the latency, and say so in a response header. When the datastore goes down, there is nothing to degrade to — the API is down, and pretending otherwise only produces wrong answers faster.',
      },
      {
        id: 'failure-table',
        type: 'table',
        content: '',
        meta: {
          caption: 'Failure modes and the honest response to each',
          columns: ['Dependency', 'Effect on reads', 'Effect on writes', 'Correct response'],
          rows: [
            ['Cache unavailable', 'Slower, still correct', 'Unaffected', 'Bypass cache, serve truth, add a stale/miss header'],
            ['Replica lag', 'Possibly stale', 'Unaffected', 'Route consistency-sensitive reads to the primary'],
            ['Datastore unavailable', 'Fail', 'Fail', 'Return 503 and stop accepting work'],
          ],
        },
      },
      {
        id: 'failure-callout',
        type: 'callout',
        content:
          'Availability claims are usually written about the happy path and then quietly falsified by the weakest dependency. Write the dependency list first, then state availability in terms of it.',
        meta: { variant: 'warning' },
      },
      { id: 'takeaway', type: 'heading', content: 'What I would keep' },
      {
        id: 'takeaway-para',
        type: 'paragraph',
        content:
          'Three habits survived every rewrite: keep the cross-cutting layer free of domain knowledge, make cache staleness an explicit per-path decision, and design the failure response before the feature. None of them are architectural novelties, which is rather the point — they are the parts that keep working when the system is under load.',
      },
    ],
  },
  {
    slug: 'etl-pipelines-people-trust',
    title: 'ETL Pipelines People Can Trust',
    description:
      'Why contract-first semantic layers, and not more monitoring, are what stop a data pipeline from being quietly wrong.',
    topics: ['Data'],
    featured: true,
    interactive: false,
    concepts: ['etl', 'semantic-layer', 'evaluation', 'postgresql'],
    blocks: [
      {
        id: 'intro',
        type: 'paragraph',
        content:
          'Data pipelines fail quietly. An upstream field changes shape, the load still succeeds, and three weeks later somebody notices the chart has been wrong the whole time. Nothing threw an exception, because nothing that happened was technically an error.',
      },
      {
        id: 'intro-para-2',
        type: 'paragraph',
        content:
          'This is the problem I kept running into while building data pipelines, and the fix that actually helped was not more monitoring. It was making the data describe itself.',
      },
      { id: 'semantic', type: 'heading', content: 'The semantic layer is the contract' },
      {
        id: 'semantic-para',
        type: 'paragraph',
        content:
          'Instead of letting consumers read raw tables, expose typed views with explicit contracts. Every column carries a description, a unit, and a freshness expectation. Dashboards, feature jobs, and notebooks all depend on the contract rather than on the physical table, which means the tables are free to be reorganised without breaking anything downstream.',
      },
      {
        id: 'etl-diagram',
        type: 'diagram',
        content: '',
        meta: { diagramId: 'etl-contract-flow' },
      },
      {
        id: 'semantic-callout',
        type: 'callout',
        content:
          'A cheap test of whether a semantic layer is real: can a new consumer answer "what unit is this in, and how old is it allowed to be?" without opening the pipeline source?',
      },
      { id: 'eval', type: 'heading', content: 'Evaluate before you visualise' },
      {
        id: 'eval-para',
        type: 'paragraph',
        content:
          'Before a chart is allowed to render, run the checks: row counts within an expected band, null ratios below a threshold, distribution drift against the previous window, referential integrity across joins. If a check fails, the pipeline stops and says so. A stopped pipeline is an inconvenience; a confidently rendered wrong chart is a decision made on bad evidence.',
      },
      {
        id: 'eval-code',
        type: 'code',
        content: `# Gates that run before anything renders.
checks = [
    row_count_within("orders", low=0.85, high=1.15),   # vs previous window
    null_ratio_below("orders.customer_id", 0.001),
    drift_within("orders.total", sigma=3),
    referential_integrity("orders.customer_id", "customers.id"),
]

failed = [c for c in checks if not c.passed]
if failed:
    halt_pipeline(failed)   # no silent corruption`,
        meta: { language: 'python' },
      },
      {
        id: 'eval-table',
        type: 'table',
        content: '',
        meta: {
          caption: 'Checks worth running, and what each one catches',
          columns: ['Check', 'Catches', 'Fails when'],
          rows: [
            ['Row-count band', 'Dropped or duplicated loads', 'Volume leaves an expected range'],
            ['Null ratio', 'Broken joins, schema changes', 'A required field starts arriving empty'],
            ['Distribution drift', 'Upstream semantic changes', 'A value shifts beyond a set tolerance'],
            ['Referential integrity', 'Orphaned records', 'A foreign key points at nothing'],
          ],
        },
      },
      { id: 'evidence', type: 'heading', content: 'Evidence-first communication' },
      {
        id: 'evidence-para',
        type: 'paragraph',
        content:
          'The last mile is the least technical and the most neglected. An insight is only useful if the reader can see where it came from: which window, which filters, which rows, which assumptions. A number presented without its provenance asks to be trusted rather than checked, and in a data product that is a design failure, not a presentation preference.',
      },
      {
        id: 'evidence-para-2',
        type: 'paragraph',
        content:
          'So every data surface I build is designed to show the query behind the view. It costs screen space and it makes the interface busier than a clean dashboard would be. It also means the answer can be audited, which is the entire reason the tool exists.',
      },
    ],
  },
  {
    slug: 'transactional-boundaries-prevent-drift',
    title: 'Transactional Boundaries That Prevent Drift',
    description:
      'How the same five units get sold twice, and why the fix is drawing the transaction boundary correctly rather than adding retries.',
    topics: ['AI & backend'],
    featured: false,
    interactive: false,
    projectSlug: 'stockledger',
    concepts: ['transactions', 'postgresql', 'alembic', 'worker-queues'],
    blocks: [
      {
        id: 'intro',
        type: 'paragraph',
        content:
          'Stock drift is the quiet failure mode of inventory systems. Two orders arrive close together, both read "five in stock", both decide they can be filled, and the warehouse discovers the problem later with a customer waiting. The database never reported an error, because from its point of view nothing went wrong.',
      },
      {
        id: 'intro-diagram',
        type: 'diagram',
        content: '',
        meta: { diagramId: 'transaction-boundary' },
      },
      { id: 'boundary', type: 'heading', content: 'The boundary is the design decision' },
      {
        id: 'boundary-para',
        type: 'paragraph',
        content:
          'The instinct is to treat this as a concurrency bug and reach for optimistic locking or retries. But the retry only helps if the read and the write are already inside the same transaction. If the application reads stock, makes a decision, and writes later, no amount of retrying will close the window, because the window is the gap you opened.',
      },
      {
        id: 'boundary-para-2',
        type: 'paragraph',
        content:
          'Every mutation — reserve, release, confirm, adjust — happens inside one transaction, and the inventory row is locked for the duration. Concurrent writers queue instead of racing. The rule that makes it hold is negative and easy to check: the application never reads stock outside a transaction.',
      },
      {
        id: 'boundary-code',
        type: 'code',
        content: `with db.transaction():
    # Lock the row for the whole decision, not just the write.
    stock = (
        db.query(Inventory)
        .filter(Inventory.sku == sku)
        .with_for_update()
        .one()
    )

    if stock.available < quantity:
        raise InsufficientStock(sku)

    stock.available -= quantity
    db.add(StockMovement(sku=sku, delta=-quantity, reason="reserve"))
    # Commit releases the lock. The next order reads the new value.`,
        meta: { language: 'python' },
      },
      {
        id: 'boundary-callout',
        type: 'callout',
        content:
          'A lock held for a decision is a lock held for a millisecond. A lock held across a network call to a payment provider is an outage waiting to happen — so anything slow belongs outside the boundary.',
        meta: { variant: 'warning' },
      },
      { id: 'workers', type: 'heading', content: 'What belongs outside the boundary' },
      {
        id: 'workers-para',
        type: 'paragraph',
        content:
          'The transaction should contain only what must be atomic: the read, the decision, the stock movement. Sending a receipt, notifying a warehouse, generating a report — all of that is slow, all of it can fail independently, and none of it needs to be atomic with the stock change. Moving it to workers keeps the lock short and makes the API\'s response time depend on the database rather than on an email provider.',
      },
      {
        id: 'migrations',
        type: 'heading',
        content: 'Migrations are part of correctness',
      },
      {
        id: 'migrations-para',
        type: 'paragraph',
        content:
          'A schema change rolled out while old application instances are still running is its own class of drift. Alembic migrations are written so that each one is compatible with both the previous and the next release: add the column, deploy code that writes to it, then remove the old one in a later migration. It is slower than editing the model and hoping, and it is the difference between a deploy and an incident.',
      },
      {
        id: 'takeaway',
        type: 'heading',
        content: 'The rule worth keeping',
      },
      {
        id: 'takeaway-para',
        type: 'paragraph',
        content:
          'Draw the transaction around the decision, not around the write. Everything that must be true simultaneously goes inside; everything slow goes outside. Most consistency bugs I have written were really boundary-placement mistakes that looked like concurrency problems.',
      },
    ],
  },
  {
    slug: 'diagrams-as-data',
    title: 'Diagrams as Data',
    description:
      'Treating architecture diagrams as structured nodes and edges instead of exported images, and what that buys in a web interface.',
    topics: ['Tools', 'Frontend'],
    featured: false,
    interactive: false,
    concepts: ['dependency-graphs', 'api-gateway'],
    blocks: [
      {
        id: 'intro',
        type: 'paragraph',
        content:
          'The diagrams on this site are not images. They are lists of nodes with grid coordinates and lists of edges with optional labels, rendered to SVG at read time. That decision came out of building this site’s diagram renderer, where the diagram had to respond to the reader rather than sit there being a picture.',
      },
      { id: 'why', type: 'heading', content: 'What images cannot do' },
      {
        id: 'why-para',
        type: 'paragraph',
        content:
          'An exported PNG carries the colors it was exported with. In a site with a light and a dark theme, that means either two exports that drift apart or one that looks wrong half the time. Structured diagrams take their stroke and fill from CSS variables, so they are simply correct in both themes, and they stay sharp at any zoom level without a second asset.',
      },
      {
        id: 'annotation-diagram',
        type: 'diagram',
        content: '',
        meta: { diagramId: 'annotation-layer' },
      },
      { id: 'structure', type: 'heading', content: 'The shape of the data' },
      {
        id: 'structure-para',
        type: 'paragraph',
        content:
          'A node needs an id, a label, an optional sublabel, and a position on a grid. An edge needs two node ids and an optional label. That is enough to express most architecture sketches, and small enough that writing one by hand is faster than opening a drawing tool.',
      },
      {
        id: 'structure-code',
        type: 'code',
        content: `{
  id: 'gateway',
  label: 'API gateway',
  sublabel: 'auth · limits · ids',
  col: 3, row: 2, colSpan: 3,
  role: 'signal',
}

// …and the edge is just the relationship:
{ from: 'client', to: 'gateway', label: 'write' }`,
        meta: { language: 'typescript' },
      },
      {
        id: 'structure-callout',
        type: 'callout',
        content:
          'Grid coordinates instead of pixels. The renderer owns the spacing, so the same diagram works at 320px and at 1440px without a second layout.',
        meta: { variant: 'note' },
      },
      { id: 'tradeoffs', type: 'heading', content: 'Where this gets worse' },
      {
        id: 'tradeoffs-para',
        type: 'paragraph',
        content:
          'Hand-placed grid coordinates do not scale to a real dependency graph with two hundred nodes — that needs a layout algorithm, and the coordinates should be computed rather than authored. For a sketch that explains one decision to one reader, authoring the layout is worth it, because automatic layout optimises for fitting on screen rather than for being understood.',
      },
      {
        id: 'tradeoffs-para-2',
        type: 'paragraph',
        content:
          'The other cost is honest: a structured diagram cannot express everything a designer can draw. There is no free-form curve, no hand-drawn arrow, no annotation placed at an angle. What it gives up in expressiveness it returns in consistency, and for technical diagrams that has been the right trade every time so far.',
      },
    ],
  },
];

export const concepts: ArticleConcept[] = [
  {
    slug: 'api-gateway',
    title: 'API Gateway',
    description:
      'The single entry point for client requests. Owns authentication, routing, rate limiting, and request identity — and no business logic.',
    relatedArticles: ['designing-a-production-api', 'diagrams-as-data'],
    relations: [
      { target: 'rate-limiting', type: 'related-to' },
      { target: 'redis-caching', type: 'related-to' },
    ],
  },
  {
    slug: 'redis-caching',
    title: 'Cache Tiers and Invalidation',
    description:
      'Edge caches for anonymous reads, Redis for authenticated reads. Versioned keys, because invalidating by deletion does not survive concurrency.',
    relatedArticles: ['designing-a-production-api'],
    relations: [
      { target: 'api-gateway', type: 'related-to' },
      { target: 'postgresql', type: 'related-to' },
    ],
  },
  {
    slug: 'postgresql',
    title: 'PostgreSQL',
    description:
      'The source of truth. Explicit transaction boundaries, row locks for concurrent writers, and typed schemas that make drift visible early.',
    relatedArticles: [
      'designing-a-production-api',
      'transactional-boundaries-prevent-drift',
      'etl-pipelines-people-trust',
    ],
    relations: [
      { target: 'transactions', type: 'implementation-of' },
      { target: 'redis-caching', type: 'related-to' },
    ],
  },
  {
    slug: 'rate-limiting',
    title: 'Rate Limiting',
    description:
      'A token bucket per tenant at the gateway, with headers that tell a client what happened rather than failing silently.',
    relatedArticles: ['designing-a-production-api'],
    relations: [{ target: 'api-gateway', type: 'related-to' }],
  },
  {
    slug: 'etl',
    title: 'ETL Pipelines',
    description:
      'Normalising many source shapes into one schema, then exposing that schema through contracts instead of raw tables.',
    relatedArticles: ['etl-pipelines-people-trust'],
    relations: [
      { target: 'semantic-layer', type: 'related-to' },
      { target: 'evaluation', type: 'prerequisite-for' },
    ],
  },
  {
    slug: 'semantic-layer',
    title: 'Semantic Layer',
    description:
      'Typed views with descriptions, units, and freshness expectations, so consumers depend on a contract rather than a physical table.',
    relatedArticles: ['etl-pipelines-people-trust'],
    relations: [
      { target: 'etl', type: 'related-to' },
      { target: 'postgresql', type: 'implementation-of' },
    ],
  },
  {
    slug: 'evaluation',
    title: 'Evaluation Gates',
    description:
      'Automated checks — row counts, null ratios, drift, referential integrity — that run before any visualisation is allowed to render.',
    relatedArticles: ['etl-pipelines-people-trust'],
    relations: [{ target: 'etl', type: 'related-to' }],
  },
  {
    slug: 'transactions',
    title: 'Explicit Transaction Boundaries',
    description:
      'The read and the decision and the write all inside one transaction. Locking the row for the decision is what serialises concurrent writers.',
    relatedArticles: ['transactional-boundaries-prevent-drift'],
    relations: [
      { target: 'postgresql', type: 'implementation-of' },
      { target: 'worker-queues', type: 'related-to' },
    ],
  },
  {
    slug: 'alembic',
    title: 'Migration Discipline',
    description:
      'Each migration compatible with both the previous and the next release, so a rolling deploy never meets a schema it cannot read.',
    relatedArticles: ['transactional-boundaries-prevent-drift'],
    relations: [
      { target: 'postgresql', type: 'related-to' },
      { target: 'transactions', type: 'related-to' },
    ],
  },
  {
    slug: 'worker-queues',
    title: 'Background Workers',
    description:
      'Receipts, notifications, and report generation moved outside the transaction, so the lock stays short and the API stays fast.',
    relatedArticles: ['transactional-boundaries-prevent-drift'],
    relations: [{ target: 'transactions', type: 'related-to' }],
  },
  {
    slug: 'dependency-graphs',
    title: 'Dependency Graphs',
    description:
      'Showing how parts of a system reference each other. Useful right up to the point where the graph becomes a hairball and needs filtering instead of drawing.',
    relatedArticles: ['diagrams-as-data'],
    relations: [
      { target: 'diagrams-as-structured-data', type: 'related-to' },
      { target: 'api-gateway', type: 'related-to' },
    ],
  },
  {
    slug: 'diagrams-as-structured-data',
    title: 'Diagrams as Structured Data',
    description:
      'Nodes and edges with grid coordinates, rendered to SVG at read time, so a diagram inherits theme and scales without a second asset.',
    relatedArticles: ['diagrams-as-data'],
    relations: [{ target: 'dependency-graphs', type: 'related-to' }],
  },
];

/* ============================================================================
   RÉSUMÉ
   Figures below are counts of things that exist in this repository. There are
   deliberately no uptime, latency, or scale claims, because there is no
   production telemetry behind them.
   ========================================================================== */

export interface ResumeProject {
  title: string;
  kind: string;
  period: string;
  description: string;
  bullets: string[];
  tech: string[];
  slug?: string;
}

export const resumeData = {
  name: 'Kalashree',
  role: 'AI, Data & Backend Systems Engineer',
  status: 'Open to full-time roles and focused contract work',
  location: 'India · open to remote',
  headline: 'Building dependable AI services, resilient data pipelines, and clear product interfaces.',
  summary:
    'Software engineer working across intelligent backends, data workflows, and product surfaces. My approach is anchored in clarity: make AI models genuinely useful, make backend services observable and robust, and make interfaces remove friction rather than add it. Everything listed here links to a repository you can read.',
  stats: [
    { value: '01', label: 'Documented Projects' },
    { value: '04', label: 'Written Essays' },
    { value: '04', label: 'Practice Areas' },
    { value: '18', label: 'Stacks & Tools Listed' },
  ],
  practiceAreas: [
    { title: 'AI & Backend Systems', detail: 'Service boundaries, async data flow, and observability for long-running workloads.' },
    { title: 'Data & Insight Architecture', detail: 'Ingestion, normalisation, semantic contracts, and evaluation gates.' },
    { title: 'Interfaces & Developer Tools', detail: 'Interfaces that make complex backend behaviour legible to the people using it.' },
    { title: 'Systems Documentation', detail: 'Writing the decision down: case studies, diagrams, and engineering notes.' },
  ],
  skills: {
    languages: ['Python', 'TypeScript', 'JavaScript', 'SQL', 'HTML5 / Modern CSS'],
    aiData: ['LLM Orchestration', 'FastAPI', 'ETL Pipelines', 'Pandas & NumPy', 'Vector Workflows', 'Model Evaluation'],
    backendCloud: ['MongoDB', 'REST Architectures', 'Linux / Bash'],
    frontendTools: ['React 19', 'Vite', 'React Router', 'Git Workflows'],
  },
  selectedWork: [
    {
      title: 'StockLedger',
      kind: 'Inventory & order system',
      period: '2026',
      slug: 'stockledger',
      description: 'An inventory and order system built around explicit domain logic and explicit transaction boundaries.',
      bullets: [
        'Kept every stock mutation inside a single transaction with the inventory row locked for the decision, so concurrent orders cannot oversell.',
        'Managed schema changes with Alembic migrations written to be compatible across a rolling deploy.',
        'Moved receipts, notifications, and reporting to workers so the transaction lock stays short.',
      ],
      tech: ['Python', 'PostgreSQL', 'Alembic', 'Workers'],
    },
  ] as ResumeProject[],
  principles: [
    {
      title: 'Useful over impressive',
      detail: 'The best architecture is the simplest one that reliably solves the problem in front of you.',
    },
    {
      title: 'Explicit over implicit',
      detail: 'Clear schemas, strict boundaries, and predictable APIs prevent the regressions that are hardest to find.',
    },
    {
      title: 'Respect the reader',
      detail: 'Code and interfaces are read by people. Naming, layout, and documentation are part of the product.',
    },
  ],
};

/* ---------------------------------------------------------------------------
   Derived helpers — computed, never hand-written, so counts cannot go stale.
   ------------------------------------------------------------------------- */

/** Approximate word count of the prose in an article's blocks. */
export function wordCountFor(blocks: ArticleBlock[]): number {
  return blocks.reduce((total, block) => {
    const body = block.content ? block.content.trim().split(/\s+/).filter(Boolean).length : 0;
    const rows = Array.isArray(block.meta?.rows)
      ? (block.meta.rows as string[][]).reduce(
          (total2, row) => total2 + row.join(' ').trim().split(/\s+/).filter(Boolean).length,
          0,
        )
      : 0;
    return total + body + rows;
  }, 0);
}

/**
 * Word count, not a reading-time estimate.
 *
 * These pieces are short enough that rounding to "1 min" or "2 min" hides the
 * difference between them, and a word count is something a reader can check.
 */
export function readingTimeFor(blocks: ArticleBlock[]): string {
  return `${wordCountFor(blocks).toLocaleString('en-US')} words`;
}

export const articleBySlug = (slug: string) => articles.find((a) => a.slug === slug);
export const conceptBySlug = (slug: string) => concepts.find((c) => c.slug === slug);
export const diagramById = (id: string) => diagrams.find((d) => d.id === id);
export const experimentById = (id: string) => experiments.find((e) => e.id === id);
export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);
