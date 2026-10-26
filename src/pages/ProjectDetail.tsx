import { motion } from 'motion/react';
import { ArrowLeft, ArrowUpRight, BookOpen } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { articles, projects } from '../config';
import { PageHead } from '../components/PageHead';
import { DiagramRenderer } from '../components/writing/DiagramRenderer';
import { useGsapSite } from '../hooks/useGsapSite';
import { calm, cinematicMotion, useCalmReducedMotion } from '../lib/motion';

export default function ProjectDetail() {
  const reduced = useCalmReducedMotion();
  useGsapSite();
  const { slug } = useParams();
  const project = projects.find((item) => item.slug === slug);

  if (!project) {
    return (
      <div className="page">
        <PageHead eyebrow="Work" title="Project not found.">
          That record doesn&apos;t exist. The full index is one step back.
        </PageHead>
        <div className="container" style={{ paddingBottom: '90px' }}>
          <Link className="text-link" to="/work">
            Back to work <ArrowLeft size={16} />
          </Link>
        </div>
      </div>
    );
  }

  const next = projects[(projects.findIndex((item) => item.slug === slug) + 1) % projects.length];
  const relatedArticle = articles.find((a) => a.projectSlug === project.slug);

  return (
    <div className="page project-detail">
      <section className="project-hero container">
        <Link className="back-link" to="/work">
          <ArrowLeft size={15} /> All work
        </Link>
        <p className="eyebrow">
          {project.category} · {project.year}
        </p>
        <h1 className="display">
          {project.name}
          <em>.</em>
        </h1>
        <p className="project-lede">{project.description}</p>
        <div className="project-meta">
          <div>
            <span>Technology Stack</span>
            <strong>{project.stack.join(' · ')}</strong>
          </div>
          <a
            className="text-link"
            href={project.repo}
            target="_blank"
            rel="noopener noreferrer"
          >
            View repository <ArrowUpRight size={16} />
          </a>
        </div>
      </section>

      <motion.section
        className={`project-feature accent-${project.accent}${project.diagramId ? ' has-diagram' : ''}`}
        data-gsap="parallax"
        data-gsap-amount="40"
        initial={{ opacity: reduced ? 1 : 0, clipPath: reduced ? 'inset(0)' : 'inset(4% 0)' }}
        whileInView={{ opacity: 1, clipPath: 'inset(0)' }}
        viewport={{ once: true, margin: '-8% 0px' }}
        transition={calm({
          duration: cinematicMotion.duration.scene,
          ease: cinematicMotion.ease.enter,
        }, reduced)}
      >
        {project.diagramId ? (
          <DiagramRenderer diagramId={project.diagramId} />
        ) : (
          <span>{project.name.slice(0, 1)}</span>
        )}
      </motion.section>

      <section className="container detail-content">
        <div>
          <p className="eyebrow">The Architecture</p>
          <h2>{project.summary}</h2>
          {relatedArticle && (
            <div className="related-article-callout">
              <span className="eyebrow" style={{ marginBottom: '6px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <BookOpen size={13} /> Engineering Essay
              </span>
              <h3>{relatedArticle.title}</h3>
              <p>{relatedArticle.description}</p>
              <Link className="text-link" to={`/writing/notes/${relatedArticle.slug}`}>
                Read case note &amp; explore models <ArrowUpRight size={15} />
              </Link>
            </div>
          )}
        </div>
        <div className="detail-copy">
          <p>{project.description}</p>
          <ul>
            {project.details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
          <a
            className="button button-dark"
            href={project.repo}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open on GitHub <ArrowUpRight size={16} />
          </a>
        </div>
      </section>

      {projects.length > 1 && (
        <section className="container next-project">
          <p className="eyebrow">Next project</p>
          <Link to={`/work/${next.slug}`}>
            <span>{next.name}</span>
            <ArrowUpRight size={26} />
          </Link>
        </section>
      )}
    </div>
  );
}
