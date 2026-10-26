import { describe, it, expect } from 'vitest';
import {
  projects,
  articles,
  diagrams,
  experiments,
  concepts,
  notes,
  resumeData,
  site,
  wordCountFor,
  readingTimeFor,
  articleBySlug,
  conceptBySlug,
  diagramById,
  experimentById,
  projectBySlug,
} from './config';

describe('Site Configuration & Defensible Rules', () => {
  it('site metadata has valid contact and repository details', () => {
    expect(site.name).toBe('Kalashree');
    expect(site.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    expect(site.github).toMatch(/^https:\/\/github\.com\//);
    expect(site.title).toBeTruthy();
    expect(site.description).toBeTruthy();
  });

  it('all projects have unique slugs and required fields', () => {
    const slugs = new Set<string>();
    expect(projects.length).toBeGreaterThan(0);

    for (const project of projects) {
      expect(slugs.has(project.slug)).toBe(false);
      slugs.add(project.slug);

      expect(project.name.trim()).toBeTruthy();
      expect(project.summary.trim()).toBeTruthy();
      expect(project.description.trim()).toBeTruthy();
      expect(project.stack.length).toBeGreaterThan(0);
      expect(project.details.length).toBeGreaterThan(0);
      expect(project.repo).toMatch(/^https:\/\/github\.com\/kalashree225\//);
      expect(project.accent).toBeTruthy();

      if (project.diagramId) {
        const diagram = diagramById(project.diagramId);
        expect(diagram, `Diagram ${project.diagramId} for project ${project.slug} must exist`).toBeDefined();
      }
    }
  });

  it('all diagrams have valid nodes, coordinates, and edges', () => {
    const diagramIds = new Set<string>();
    for (const diagram of diagrams) {
      expect(diagramIds.has(diagram.id)).toBe(false);
      diagramIds.add(diagram.id);

      expect(diagram.title).toBeTruthy();
      expect(diagram.nodes.length).toBeGreaterThan(0);

      const nodeIds = new Set(diagram.nodes.map((n) => n.id));
      for (const node of diagram.nodes) {
        expect(node.col).toBeGreaterThanOrEqual(0);
        expect(node.row).toBeGreaterThanOrEqual(0);
        expect(node.label).toBeTruthy();
      }

      for (const edge of diagram.edges) {
        expect(nodeIds.has(edge.from), `Edge from '${edge.from}' must reference existing node in diagram ${diagram.id}`).toBe(true);
        expect(nodeIds.has(edge.to), `Edge to '${edge.to}' must reference existing node in diagram ${diagram.id}`).toBe(true);
      }
    }
  });

  it('all experiments have valid controls and default states', () => {
    for (const exp of experiments) {
      expect(exp.id).toBeTruthy();
      expect(exp.title).toBeTruthy();
      expect(exp.model).toBeTruthy();
      expect(exp.controls.length).toBeGreaterThan(0);

      for (const ctrl of exp.controls) {
        expect(ctrl.id in exp.initialState).toBe(true);
      }
    }
  });

  it('all articles have valid content blocks and trace back to projects or concepts', () => {
    const articleSlugs = new Set<string>();
    for (const article of articles) {
      expect(articleSlugs.has(article.slug)).toBe(false);
      articleSlugs.add(article.slug);

      expect(article.title).toBeTruthy();
      expect(article.blocks.length).toBeGreaterThan(0);

      if (article.projectSlug) {
        const project = projectBySlug(article.projectSlug);
        expect(project, `Project ${article.projectSlug} referenced by article ${article.slug} must exist`).toBeDefined();
      }

      for (const block of article.blocks) {
        if (block.type === 'diagram') {
          const diagId = block.meta?.diagramId as string;
          expect(diagramById(diagId), `Diagram ${diagId} in article ${article.slug} must exist`).toBeDefined();
        }
        if (block.type === 'interactive') {
          const expId = block.meta?.experimentId as string;
          expect(experimentById(expId), `Experiment ${expId} in article ${article.slug} must exist`).toBeDefined();
        }
      }
    }
  });

  it('notes represent an honest unwritten backlog with questions, builds, and outlines', () => {
    for (const note of notes) {
      expect(note.question).toBeTruthy();
      expect(note.status).toMatch(/^(Drafting|Planned)$/);
      expect(note.implementation.trim()).toBeTruthy();
      expect(note.outline.length).toBeGreaterThan(0);
      if (note.projectSlug) {
        const project = projectBySlug(note.projectSlug);
        expect(project, `Note projectSlug ${note.projectSlug} must exist`).toBeDefined();
      }
    }
  });

  it('concepts define bidirectional technical relationship graph', () => {
    expect(concepts.length).toBeGreaterThan(0);
    for (const concept of concepts) {
      expect(concept.slug).toBeTruthy();
      expect(concept.title).toBeTruthy();
      expect(concept.description).toBeTruthy();
      expect(concept.relations.length).toBeGreaterThan(0);
    }
  });

  it('resume figures reflect verifiable repository counts', () => {
    expect(resumeData.selectedWork.length).toBe(projects.length);
    const projectsStat = resumeData.stats.find((s) => s.label.toLowerCase().includes('documented'));
    expect(projectsStat?.value).toBe(String(projects.length).padStart(2, '0'));

    const essaysStat = resumeData.stats.find((s) => s.label.toLowerCase().includes('written'));
    expect(essaysStat?.value).toBe(String(articles.length).padStart(2, '0'));
  });

  it('wordCountFor and readingTimeFor calculate word counts accurately', () => {
    const sampleBlocks = [
      { id: '1', type: 'paragraph' as const, content: 'Five words in this sentence.' },
      { id: '2', type: 'heading' as const, content: 'Two words' },
    ];
    expect(wordCountFor(sampleBlocks)).toBe(7);
    expect(readingTimeFor(sampleBlocks)).toBe('7 words');
  });

  it('lookup helpers return matching records or undefined', () => {
    expect(projectBySlug('stockledger')?.name).toBe('StockLedger');
    expect(projectBySlug('nonexistent')).toBeUndefined();
    expect(articleBySlug('designing-a-production-api')?.title).toBe('Designing a Production API');
    expect(articleBySlug('nonexistent')).toBeUndefined();
    expect(conceptBySlug('postgresql')?.title).toBe('PostgreSQL');
    expect(diagramById('api-architecture-v1')?.status).toBe('model');
    expect(experimentById('cache-behavior-demo')?.title).toBe('Cache behaviour under load');
  });
});
