import { useMemo, useState } from 'react';
import { RotateCcw, TriangleAlert } from 'lucide-react';
import type { Experiment } from '../../config';

/* ---------------------------------------------------------------------------
   The model's assumptions, in one place and in the interface.

   A request is routed through at most two cache tiers. Each tier absorbs a
   share of what reaches it; whatever is left reaches PostgreSQL. The ratios
   are conditional on arrival, which is why a tier that goes down does not
   quietly keep "absorbing" traffic — its share is added to what the database
   must serve.
   ------------------------------------------------------------------------- */
const EDGE_HIT_RATIO = 0.72;
const REDIS_HIT_RATIO = 0.86;

type State = {
  traffic: number;
  cache: string;
  replication: boolean;
  failure: string;
};

interface Breakdown {
  edgeHits: number;
  redisHits: number;
  dbReads: number;
  dbPeers: number;
  perPeer: number;
  degraded: boolean;
  failureNote: string | null;
  lostTier: string | null;
}

function computeBreakdown(state: State): Breakdown {
  const traffic = state.traffic;

  const edgeEnabled = state.cache === 'redis+edge';
  const redisEnabled = state.cache === 'redis' || state.cache === 'redis+edge';

  // A failure takes the affected tier out of service for this model.
  const edgeDown = state.failure === 'network-partition' && edgeEnabled;
  const redisDown = state.failure === 'redis-down' && redisEnabled;

  const edgeLive = edgeEnabled && !edgeDown;
  const redisLive = redisEnabled && !redisDown;

  const edgeHits = edgeLive ? Math.round(traffic * EDGE_HIT_RATIO) : 0;
  const afterEdge = traffic - edgeHits;
  const redisHits = redisLive ? Math.round(afterEdge * REDIS_HIT_RATIO) : 0;
  const dbReads = traffic - edgeHits - redisHits;

  // What the database would have served with no failure at all. Derived from
  // the same ratios as the live figures, so the comparison in the failure note
  // can never disagree with the readout.
  const healthyRedisHits = redisEnabled ? Math.round(afterEdge * REDIS_HIT_RATIO) : 0;
  const healthyDbReads = traffic - (edgeEnabled ? Math.round(traffic * EDGE_HIT_RATIO) : 0) - healthyRedisHits;

  // Replica lag does not change how many reads arrive — it changes how many
  // nodes are eligible to answer them, so the primary absorbs everything.
  const replicasUseful = state.replication && state.failure !== 'replica-lag';
  const dbPeers = replicasUseful ? 2 : 1;

  let failureNote: string | null = null;
  let lostTier: string | null = null;

  switch (state.failure) {
    case 'redis-down':
      if (redisEnabled) {
        failureNote = `Redis is unavailable. Reads that would have been served from cache now reach PostgreSQL directly, so database reads rise from ${format(
          healthyDbReads,
        )} to ${format(dbReads)} per minute. Correctness is unaffected; latency is not.`;
        lostTier = 'Redis';
      }
      break;
    case 'replica-lag':
      if (state.replication) {
        failureNote = `Replicas are lagging, so consistency-sensitive reads are routed to the primary. The same ${format(
          dbReads,
        )} reads per minute now land on ${dbPeers} node instead of 2, doubling load per node.`;
      } else {
        failureNote =
          'Replica lag has no effect here: no replicas are configured, so the primary was already serving every read.';
      }
      break;
    case 'network-partition':
      failureNote = edgeEnabled
        ? `The edge tier is unreachable. Its ${format(
            edgeHits,
          )} cached reads per minute fall through to Redis and PostgreSQL, so the database now answers ${format(
            dbReads,
          )}.`
        : 'A network partition has no effect here: there is no edge tier to lose.';
      lostTier = edgeEnabled ? 'Edge' : null;
      break;
    default:
      break;
  }

  return {
    edgeHits,
    redisHits,
    dbReads,
    dbPeers,
    perPeer: Math.round(dbReads / dbPeers),
    degraded: Boolean(lostTier) || state.failure === 'replica-lag',
    failureNote,
    lostTier,
  };
}

function format(n: number) {
  return n.toLocaleString('en-US');
}

interface ExperimentHostProps {
  experiment: Experiment;
}

export function ExperimentHost({ experiment }: ExperimentHostProps) {
  const [state, setState] = useState<State>(() => {
    const initial = { ...experiment.initialState } as State;
    return initial;
  });

  const breakdown = useMemo(() => computeBreakdown(state), [state]);

  const set = (id: string, value: unknown) => setState((prev) => ({ ...prev, [id]: value }));
  const reset = () => setState({ ...experiment.initialState } as State);

  const dbShare = state.traffic > 0 ? (breakdown.dbReads / state.traffic) * 100 : 0;
  const edgeShare = state.traffic > 0 ? (breakdown.edgeHits / state.traffic) * 100 : 0;
  const redisShare = state.traffic > 0 ? (breakdown.redisHits / state.traffic) * 100 : 0;

  return (
    <section className="experiment" aria-labelledby={`exp-${experiment.id}-title`}>
      <header className="experiment-head">
        <p className="eyebrow">Interactive model</p>
        <h3 id={`exp-${experiment.id}-title`}>{experiment.title}</h3>
        <p className="experiment-desc">{experiment.description}</p>
      </header>

      <div className="experiment-body">
        <div className="experiment-controls">
          {experiment.controls.map((control) => (
            <div className="experiment-control" key={control.id}>
              <label htmlFor={`${experiment.id}-${control.id}`}>
                <span className="control-label">{control.label}</span>
                {control.hint && <span className="control-hint">{control.hint}</span>}
              </label>

              {control.type === 'range' && (
                <>
                  <input
                    id={`${experiment.id}-${control.id}`}
                    type="range"
                    min={control.min}
                    max={control.max}
                    step={control.step}
                    value={Number(state[control.id as keyof State])}
                    onChange={(e) => set(control.id, Number(e.target.value))}
                  />
                  <output className="control-output">
                    {format(Number(state[control.id as keyof State]))}
                  </output>
                </>
              )}

              {control.type === 'select' && (
                <select
                  id={`${experiment.id}-${control.id}`}
                  value={String(state[control.id as keyof State])}
                  onChange={(e) => set(control.id, e.target.value)}
                >
                  {control.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}

              {control.type === 'toggle' && (
                <button
                  id={`${experiment.id}-${control.id}`}
                  type="button"
                  role="switch"
                  aria-checked={Boolean(state[control.id as keyof State])}
                  className={`toggle-switch ${state[control.id as keyof State] ? 'is-on' : ''}`}
                  onClick={() => set(control.id, !state[control.id as keyof State])}
                >
                  <span className="toggle-knob" />
                </button>
              )}
            </div>
          ))}

          <button className="experiment-reset" type="button" onClick={reset}>
            <RotateCcw size={14} /> Reset to defaults
          </button>
        </div>

        <div className="experiment-readout">
          <div className="experiment-bar" role="img" aria-label={`Read traffic split: edge ${edgeShare.toFixed(0)} percent, cache ${redisShare.toFixed(0)} percent, database ${dbShare.toFixed(0)} percent`}>
            {edgeShare > 0 && (
              <span className="bar-seg seg-edge" style={{ width: `${edgeShare}%` }}>
                <i>{edgeShare >= 12 ? 'edge' : ''}</i>
              </span>
            )}
            {redisShare > 0 && (
              <span className="bar-seg seg-redis" style={{ width: `${redisShare}%` }}>
                <i>{redisShare >= 12 ? 'cache' : ''}</i>
              </span>
            )}
            <span className="bar-seg seg-db" style={{ width: `${Math.max(dbShare, 0)}%` }}>
              <i>{dbShare >= 12 ? 'database' : ''}</i>
            </span>
          </div>

          <dl className="experiment-metrics">
            <div>
              <dt>Reads per minute</dt>
              <dd>{format(state.traffic)}</dd>
            </div>
            <div>
              <dt>Served by edge cache</dt>
              <dd>{format(breakdown.edgeHits)}</dd>
            </div>
            <div>
              <dt>Served by Redis</dt>
              <dd>{format(breakdown.redisHits)}</dd>
            </div>
            <div className="metric-db">
              <dt>Reaching PostgreSQL</dt>
              <dd>{format(breakdown.dbReads)}</dd>
            </div>
            <div>
              <dt>Database nodes answering</dt>
              <dd>{breakdown.dbPeers}</dd>
            </div>
            <div>
              <dt>Reads per database node</dt>
              <dd>{format(breakdown.perPeer)}</dd>
            </div>
          </dl>

          {breakdown.failureNote && (
            <p className={`experiment-note ${breakdown.degraded ? 'is-degraded' : ''}`}>
              {breakdown.degraded && <TriangleAlert size={14} />}
              <span>{breakdown.failureNote}</span>
            </p>
          )}

          <details className="experiment-model">
            <summary>How these numbers are produced</summary>
            <p>{experiment.model}</p>
            <ul className="experiment-math">
              <li>
                edge: {format(state.traffic)} × {(EDGE_HIT_RATIO * 100).toFixed(0)}% ={' '}
                <strong>{format(breakdown.edgeHits)}</strong>
              </li>
              <li>
                redis: {format(state.traffic - breakdown.edgeHits)} ×{' '}
                {(REDIS_HIT_RATIO * 100).toFixed(0)}% = <strong>{format(breakdown.redisHits)}</strong>
              </li>
              <li>
                database: {format(state.traffic)} − {format(breakdown.edgeHits)} −{' '}
                {format(breakdown.redisHits)} = <strong>{format(breakdown.dbReads)}</strong>
              </li>
            </ul>
          </details>
        </div>
      </div>
    </section>
  );
}
