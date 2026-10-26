import { motion } from 'motion/react';
import { ArrowUpRight, BrainCircuit, Database, PanelsTopLeft } from 'lucide-react';
import { Link } from 'react-router';
import { articles, projects, resumeData, site } from '../config';
import { M3Icon } from '../components/M3Icon';
import { ProjectDeck } from '../components/ProjectDeck';
import { Reveal } from '../components/Reveal';
import { SectionHeading } from '../components/SectionHeading';
import { calm, cinematicMotion, easings, useCalmReducedMotion } from '../lib/motion';
import { useGsapSite } from '../hooks/useGsapSite';

export default function Home() {
  const reduced = useCalmReducedMotion();
  useGsapSite();

  const enter = (delay: number) => ({
    initial: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 16 },
    animate: { opacity: 1, y: 0 },
    transition: calm({
      duration: cinematicMotion.duration.section,
      delay,
      ease: cinematicMotion.ease.enter,
    }, reduced),
  });
  const titleLine = (delay: number) => ({
    initial: { opacity: reduced ? 1 : 0, y: reduced ? 0 : '108%' },
    animate: { opacity: 1, y: 0 },
    transition: calm({
      duration: cinematicMotion.duration.hero,
      delay,
      ease: cinematicMotion.ease.enter,
    }, reduced),
  });

  return (
    <div className="page home-page">
      {/* The title leads; supporting details follow without delaying interaction. */}
      <section className="hero container full-screen">
        <div className="hero-copy">
          <motion.div className="beacon-pill" {...enter(0.04)}>
            <span className="beacon-dot" />
            <span>Open to AI &amp; software systems roles</span>
          </motion.div>
          <h1 className="display hero-title">
            <span className="hero-title-mask">
              <motion.span className="hero-title-line" {...titleLine(0.12)}>Complexity,</motion.span>
            </span>
            <span className="hero-title-mask">
              <motion.em className="hero-title-line" {...titleLine(0.24)}>made useful.</motion.em>
            </span>
          </h1>
          <motion.p className="hero-lede" {...enter(0.92)}>
            I&apos;m {site.name}, a developer working across intelligent backends, dependable data workflows, and clear product interfaces.
          </motion.p>
          <motion.div className="hero-actions" {...enter(1.04)}>
            <Link className="button button-dark" to="/work">
              Explore selected work <ArrowUpRight size={16} />
            </Link>
            <Link className="button button-outline" to="/about">
              A little about me <ArrowUpRight size={16} />
            </Link>
          </motion.div>
          <motion.p className="hero-location" {...enter(1.14)}>
            Independent developer <span aria-hidden="true">·</span> Bengaluru, India
          </motion.p>
        </div>

        {/* A small, deliberately technical visual language — not a stock hero image. */}
        <motion.div
          className="hero-visual"
          aria-hidden="true"
          initial={{ scale: reduced ? 1 : 1.035 }}
          animate={{ scale: 1 }}
          transition={calm({
            duration: cinematicMotion.duration.scene,
            delay: 0.24,
            ease: cinematicMotion.ease.camera,
          }, reduced)}
        >
          <div className="hero-visual-label">
            SYSTEMS / STUDIES <strong>KS—01</strong>
          </div>
          <svg className="hero-visual-map" viewBox="0 0 400 400" fill="none" aria-hidden="true">
            <motion.path d="M18 84H150L194 128H382" initial={{ pathLength: reduced ? 1 : 0, opacity: 0.35 }} animate={{ pathLength: 1, opacity: 1 }} transition={calm({ duration: 0.72, delay: 0.28, ease: easings.emphasized }, reduced)} />
            <motion.path d="M18 316H126L184 258H382" initial={{ pathLength: reduced ? 1 : 0, opacity: 0.35 }} animate={{ pathLength: 1, opacity: 1 }} transition={calm({ duration: 0.72, delay: 0.36, ease: easings.emphasized }, reduced)} />
            <motion.path d="M84 18V126L142 184V382" initial={{ pathLength: reduced ? 1 : 0, opacity: 0.35 }} animate={{ pathLength: 1, opacity: 1 }} transition={calm({ duration: 0.72, delay: 0.44, ease: easings.emphasized }, reduced)} />
            <motion.path d="M316 18V116L258 174V382" initial={{ pathLength: reduced ? 1 : 0, opacity: 0.35 }} animate={{ pathLength: 1, opacity: 1 }} transition={calm({ duration: 0.72, delay: 0.52, ease: easings.emphasized }, reduced)} />
            <motion.circle cx="200" cy="200" r="118" initial={{ pathLength: reduced ? 1 : 0, opacity: 0.35 }} animate={{ pathLength: 1, opacity: 1 }} transition={calm({ duration: 0.82, delay: 0.58, ease: easings.emphasized }, reduced)} />
            <motion.circle cx="200" cy="200" r="62" initial={{ pathLength: reduced ? 1 : 0, opacity: 0.25 }} animate={{ pathLength: 1, opacity: 1 }} transition={calm({ duration: 0.62, delay: 0.68, ease: easings.emphasized }, reduced)} />
            <motion.circle className="hero-map-ping" cx="258" cy="174" r="6" initial={{ opacity: 0, scale: reduced ? 1 : 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={calm({ duration: 0.3, delay: 0.78, ease: easings.standard }, reduced)} />
            <motion.circle className="hero-map-ping hero-map-ping--second" cx="142" cy="184" r="4" initial={{ opacity: 0, scale: reduced ? 1 : 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={calm({ duration: 0.3, delay: 0.86, ease: easings.standard }, reduced)} />
          </svg>
          <div className="hero-visual-core">
            K<span>.</span>
          </div>
          <div className="hero-visual-ring ring-a" />
          <div className="hero-visual-ring ring-b" />
          <div className="hero-visual-foot">
            <span>Understand</span>
            <span>Design</span>
            <span>Build</span>
          </div>
        </motion.div>

        <div className="scroll-cue">
          Down the page <span />
        </div>
      </section>

      {/* Selected work leads; the carousel remains keyboard- and touch-friendly. */}
      <section className="section work-deck-section">
        <div className="container section-topline">
          <Reveal>
            <SectionHeading
              eyebrow={`Selected work · 01—${String(projects.length).padStart(2, '0')}`}
              title="Built to be useful."
            >
              <span>Systems, tools, and interfaces shaped around real engineering questions.</span>
            </SectionHeading>
          </Reveal>
          <span className="section-index">PORTFOLIO / 2026</span>
        </div>
        <Reveal delay={120} y={40}>
          <ProjectDeck projects={projects} />
        </Reveal>
        <Reveal className="container" delay={100}>
          <Link className="text-link centered-link" to="/work">
            View all {projects.length} {projects.length === 1 ? 'project' : 'projects'} as large cards <ArrowUpRight size={16} />
          </Link>
        </Reveal>
      </section>

      {/* Practice areas */}
      <section className="dark-band">
        <div className="container capability-grid">
          <Reveal>
          <div>
            <p className="eyebrow light">What I care about</p>
            <h2>
              Useful over impressive.<br />
              <em>Clear over complex.</em>
            </h2>
          </div>
          </Reveal>
          <div className="capabilities">
            <Reveal delay={60}>
            <div className="cap-card">
              <span>01</span>
              <div className="cap-card-title">
                <M3Icon icon={BrainCircuit} label="AI and backend systems" />
                <h3>AI &amp; Backend Systems</h3>
              </div>
              <p>Services built to be dependable, observable, and ready for high-throughput operational workloads.</p>
            </div>
            </Reveal>
            <Reveal delay={140}>
            <div className="cap-card">
              <span>02</span>
              <div className="cap-card-title">
                <M3Icon icon={Database} label="Data and insight architecture" />
                <h3>Data &amp; Insight Architecture</h3>
              </div>
              <p>Turning raw data and signals into normalized schemas and structured workflows people can trust.</p>
            </div>
            </Reveal>
            <Reveal delay={220}>
            <div className="cap-card">
              <span>03</span>
              <div className="cap-card-title">
                <M3Icon icon={PanelsTopLeft} label="Interfaces and developer tooling" />
                <h3>Intuitive Interfaces &amp; Tooling</h3>
              </div>
              <p>Quiet, purposeful visual surfaces that bring transparency to complex backend domains.</p>
            </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* A compact index makes the broader portfolio legible without another card grid. */}
      <section className="intro-band">
        <div className="container intro-grid">
          <p className="eyebrow">A considered approach</p>
          <p className="intro-text">
            I build with curiosity and structure — making technical systems easier to trust, understand, and use.
          </p>
        </div>
        <div className="container signal-strip">
          <div>
            <strong data-gsap-count={projects.length}>{String(projects.length).padStart(2, '0')}</strong>
            <span>{projects.length === 1 ? 'Documented project' : 'Documented projects'}</span>
          </div>
          <div>
            <strong data-gsap-count={resumeData.practiceAreas.length}>{String(resumeData.practiceAreas.length).padStart(2, '0')}</strong>
            <span>Core practice areas</span>
          </div>
          <div>
            <strong data-gsap-count={articles.length}>{String(articles.length).padStart(2, '0')}</strong>
            <span>Written working notes</span>
          </div>
        </div>
      </section>

      {/* Closing invitation */}
      <section className="section container closing-cta">
        <Reveal>
          <div>
            <p className="eyebrow">Have a good question or problem?</p>
            <h2>
              Let&apos;s start <em>there.</em>
            </h2>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className="closing-cta-actions">
            <Link className="button button-dark" to="/contact">
              Get in touch <ArrowUpRight size={16} />
            </Link>
            <Link className="button button-outline" to="/writing">
              Read the notes <ArrowUpRight size={16} />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
