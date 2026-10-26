import { useMemo } from 'react';
import { motion } from 'motion/react';
import { diagramById, type Diagram, type DiagramNode } from '../../config';
import { calm, durations, easings, useCalmReducedMotion } from '../../lib/motion';

/* ---------------------------------------------------------------------------
   Grid geometry. Diagrams are authored on a column/row grid, so the renderer
   owns all pixel spacing: the same diagram works at 320px and at 1440px.
   ------------------------------------------------------------------------- */
const COL_W = 116;
const COL_GAP = 16;
const ROW_H = 68;
const ROW_GAP = 22;
const PAD = 18;

const colX = (col: number) => PAD + col * (COL_W + COL_GAP);
const rowY = (row: number) => PAD + row * (ROW_H + ROW_GAP);

interface Box {
  node: DiagramNode;
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Edges route orthogonally from a source to a target. When the source sits to
 * the left we leave from the right edge and enter the left edge; when the flow
 * goes backwards or straight down we leave from the bottom instead.
 */
function edgePath(from: Box, to: Box): string {
  const forward = to.x - (from.x + from.w) > 12;

  if (forward) {
    const sx = from.x + from.w;
    const sy = from.y + from.h / 2;
    const tx = to.x;
    const ty = to.y + to.h / 2;
    const mid = sx + Math.max(18, (tx - sx) / 2);
    return `M ${sx} ${sy} H ${mid} V ${ty} H ${tx}`;
  }

  const sx = from.x + from.w / 2;
  const sy = from.y + from.h;
  const tx = to.x + to.w / 2;
  const ty = to.y;
  const mid = sy + Math.max(16, (ty - sy) / 2);
  return `M ${sx} ${sy} V ${mid} H ${tx} V ${ty}`;
}

function edgeLabelPos(from: Box, to: Box) {
  const forward = to.x - (from.x + from.w) > 12;
  if (forward) {
    const sx = from.x + from.w;
    const tx = to.x;
    return { x: sx + Math.max(18, (tx - sx) / 2), y: from.y + from.h / 2 - 7 };
  }
  const sx = from.x + from.w / 2;
  const sy = from.y + from.h;
  const ty = to.y;
  return { x: sx + 6, y: sy + Math.max(16, (ty - sy) / 2) - 5 };
}

function DiagramFigure({ diagram }: { diagram: Diagram }) {
  const boxes = useMemo<Box[]>(
    () =>
      diagram.nodes.map((node) => {
        const colSpan = node.colSpan ?? 1;
        const rowSpan = node.rowSpan ?? 1;
        return {
          node,
          x: colX(node.col),
          y: rowY(node.row),
          w: colSpan * COL_W + (colSpan - 1) * COL_GAP,
          h: rowSpan * ROW_H + (rowSpan - 1) * ROW_GAP,
        };
      }),
    [diagram],
  );

  const byId = useMemo(() => new Map(boxes.map((b) => [b.node.id, b])), [boxes]);

  const width = Math.max(...boxes.map((b) => b.x + b.w)) + PAD;
  const height = Math.max(...boxes.map((b) => b.y + b.h)) + PAD;

  const markerId = `dgr-arrow-${diagram.id}`;
  const reduced = useCalmReducedMotion();
  const edgeKinds = Array.from(
    new Set(diagram.edges.map((e) => (e.style === 'dashed' ? 'optional path' : 'primary path'))),
  );

  return (
    <figure className="diagram-figure" data-diagram-id={diagram.id} data-diagram-status={diagram.status}>
      <div className="diagram-frame">
        <svg
          className="diagram-svg"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`${diagram.title}. ${diagram.caption}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <marker
              id={markerId}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path className="diagram-arrowhead" d="M 0 1 L 9 5 L 0 9 z" />
            </marker>
          </defs>

          <g className="diagram-edges">
            {diagram.edges.map((edge, i) => {
              const from = byId.get(edge.from);
              const to = byId.get(edge.to);
              if (!from || !to) return null;
              const label = edge.label ? edgeLabelPos(from, to) : null;
              return (
                <g key={`${edge.from}-${edge.to}-${i}`} className="diagram-edge">
                  <motion.path
                    className={`diagram-edge-path ${edge.style === 'dashed' ? 'is-optional' : ''}`}
                    d={edgePath(from, to)}
                    markerEnd={`url(#${markerId})`}
                    initial={reduced ? false : { pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    viewport={{ once: true, margin: '-10% 0px' }}
                    transition={calm(
                      { duration: durations.medium4, ease: easings.calm, delay: 0.3 + i * 0.08 },
                      reduced,
                    )}
                  />
                  {edge.label && label && (
                    <motion.text
                      className="diagram-edge-label"
                      x={label.x}
                      y={label.y}
                      initial={reduced ? false : { opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true, margin: '-10% 0px' }}
                      transition={calm(
                        { duration: durations.short4, delay: 0.5 + i * 0.08 },
                        reduced,
                      )}
                    >
                      {edge.label}
                    </motion.text>
                  )}
                </g>
              );
            })}
          </g>

          <g className="diagram-nodes">
            {boxes.map((box, i) => (
              <motion.g
                key={box.node.id}
                className={`diagram-node role-${box.node.role ?? 'neutral'}`}
                data-node-id={box.node.id}
                initial={reduced ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10% 0px' }}
                transition={calm(
                  { duration: durations.medium1, ease: easings.calm, delay: i * 0.06 },
                  reduced,
                )}
              >
                <rect x={box.x} y={box.y} width={box.w} height={box.h} rx="2" />
                <text className="diagram-node-label" x={box.x + 13} y={box.y + 27}>
                  {box.node.label}
                </text>
                {box.node.sublabel && (
                  <text className="diagram-node-sublabel" x={box.x + 13} y={box.y + 47}>
                    {box.node.sublabel}
                  </text>
                )}
              </motion.g>
            ))}
          </g>
        </svg>
      </div>

      <figcaption className="diagram-caption">
        <span className="diagram-title">{diagram.title}</span>
        <p>{diagram.caption}</p>
        <div className="diagram-legend">
          <span className="diagram-legend-item">
            <i className="diagram-swatch is-primary" /> primary path
          </span>
          {edgeKinds.includes('optional path') && (
            <span className="diagram-legend-item">
              <i className="diagram-swatch is-optional" /> optional path
            </span>
          )}
          <span className="diagram-legend-item">
            <i className="diagram-swatch is-model" />
            {diagram.status === 'model' ? 'model, not a screenshot' : 'sketch'}
          </span>
        </div>
      </figcaption>
    </figure>
  );
}

interface DiagramRendererProps {
  diagramId: string;
  /** Optional override so a block can carry its own title. */
  title?: string;
}

export function DiagramRenderer({ diagramId }: DiagramRendererProps) {
  const diagram = diagramById(diagramId);

  if (!diagram) {
    return (
      <div className="diagram-missing" role="note">
        Diagram <code>{diagramId}</code> is referenced by this article but is not defined.
      </div>
    );
  }

  return <DiagramFigure diagram={diagram} />;
}
