import { Mail, MapPin, ArrowUpRight } from 'lucide-react';
import { projectBySlug, resumeData, site } from '../config';

/**
 * The résumé document itself, with no chrome.
 *
 * Rendered in two places from one source: inside the on-screen canvas, and on
 * the standalone /print/resume route that headless Edge prints to
 * public/resume.pdf. Keeping one renderer means the downloadable PDF and the
 * on-screen résumé cannot drift apart.
 */
export function ResumePaper() {
  return (
    <div className="resume-paper" tabIndex={0}>
      <header className="resume-header">
        <div>
          <h1>{resumeData.name}</h1>
          <p className="resume-role">{resumeData.role}</p>
        </div>
        <div className="resume-contact">
          <a href={`mailto:${site.email}`}>
            <Mail size={13} /> {site.email}
          </a>
          <a href={site.github} target="_blank" rel="noopener noreferrer">
            <ArrowUpRight size={13} /> github.com/kalashree225
          </a>
          <span>
            <MapPin size={13} /> {resumeData.location}
          </span>
        </div>
      </header>

      <p className="resume-headline">{resumeData.headline}</p>
      <p className="resume-status">{resumeData.status}</p>

      <section className="resume-section">
        <h2>Summary</h2>
        <p>{resumeData.summary}</p>
      </section>

      <section className="resume-section">
        <h2>At a glance</h2>
        <dl className="resume-stats">
          {resumeData.stats.map((stat) => (
            <div key={stat.label}>
              <dt>{stat.value}</dt>
              <dd>{stat.label}</dd>
            </div>
          ))}
        </dl>
        <p className="resume-stats-note">
          These are counts of things that exist in the public repositories — not uptime or latency
          claims, which would need production telemetry to be meaningful.
        </p>
      </section>

      <section className="resume-section">
        <h2>Practice areas</h2>
        <div className="resume-practice">
          {resumeData.practiceAreas.map((area) => (
            <div key={area.title}>
              <h3>{area.title}</h3>
              <p>{area.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="resume-section">
        <h2>Selected work</h2>
        <div className="resume-work">
          {resumeData.selectedWork.map((item) => {
            const project = item.slug ? projectBySlug(item.slug) : undefined;
            return (
              <article key={item.title} className="resume-item">
                <header>
                  <h3>{item.title}</h3>
                  <span className="resume-item-kind">{item.kind}</span>
                  <span className="resume-item-period">{item.period}</span>
                </header>
                <p>{item.description}</p>
                <ul>
                  {item.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
                <div className="resume-item-foot">
                  <div className="resume-tech">
                    {item.tech.map((tech) => (
                      <span key={tech}>{tech}</span>
                    ))}
                  </div>
                  {project && (
                    <a
                      className="resume-repo"
                      href={project.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Repository <ArrowUpRight size={12} />
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="resume-section">
        <h2>Skills</h2>
        <dl className="resume-skills">
          <div>
            <dt>Languages</dt>
            <dd>{resumeData.skills.languages.join(' · ')}</dd>
          </div>
          <div>
            <dt>AI &amp; data</dt>
            <dd>{resumeData.skills.aiData.join(' · ')}</dd>
          </div>
          <div>
            <dt>Backend &amp; infrastructure</dt>
            <dd>{resumeData.skills.backendCloud.join(' · ')}</dd>
          </div>
          <div>
            <dt>Frontend &amp; tooling</dt>
            <dd>{resumeData.skills.frontendTools.join(' · ')}</dd>
          </div>
        </dl>
      </section>

      <section className="resume-section">
        <h2>How I work</h2>
        <div className="resume-principles">
          {resumeData.principles.map((principle) => (
            <div key={principle.title}>
              <h3>{principle.title}</h3>
              <p>{principle.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
