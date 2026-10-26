import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { ArrowUpRight, FileText, Menu, X } from 'lucide-react';
import { articleBySlug, conceptBySlug, projectBySlug, site } from '../config';
import { ResumeCanvas } from './ResumeCanvas';
import { Reveal } from './Reveal';
import { Expand, Pill } from './motion/primitives';

const links = [
  { label: 'Home', to: '/' },
  { label: 'Work', to: '/work' },
  { label: 'About', to: '/about' },
  { label: 'Writing', to: '/writing' },
  { label: 'Contact', to: '/contact' },
];

export function SiteLayout() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });

    const pathname = location.pathname.replace(/\/+$/, '') || '/';
    const segments = pathname.split('/').filter(Boolean);
    let title = site.title;

    if (pathname === '/work') {
      title = `Work — ${site.name}`;
    } else if (segments[0] === 'work' && segments[1]) {
      const project = projectBySlug(segments[1]);
      title = project ? `${project.name} — ${site.name}` : `Work — ${site.name}`;
    } else if (pathname === '/about') {
      title = `About — ${site.name}`;
    } else if (pathname === '/writing') {
      title = `Writing — ${site.name}`;
    } else if (segments[0] === 'writing' && segments[1] === 'notes' && segments[2]) {
      const article = articleBySlug(segments[2]);
      title = article ? `${article.title} — ${site.name}` : `Writing — ${site.name}`;
    } else if (segments[0] === 'writing' && segments[1] === 'concepts' && segments[2]) {
      const concept = conceptBySlug(segments[2]);
      title = concept ? `${concept.title} — ${site.name}` : `Writing — ${site.name}`;
    } else if (pathname === '/contact') {
      title = `Contact — ${site.name}`;
    }

    document.title = title;
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    // Read the real scroll position once on mount, so the header is correct
    // when a deep page is reloaded part-way down.
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className="site-shell" data-design-system="material-3">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="container header-inner">
          <div className="nav-rail">
            <Link className="wordmark" to="/" aria-label="Kalashree home">
              <span className="wordmark-mark">K<span>.</span></span>
              <span className="wordmark-copy">
                <strong>Kalashree</strong>
                <small>AI / DATA / SYSTEMS</small>
              </span>
            </Link>
            <nav className="desktop-nav" aria-label="Primary navigation">
              {links.map((link) => (
                <NavLink key={link.to} to={link.to} end={link.to === '/'}>
                  {({ isActive }) => (
                    <>
                      <span className="nav-link-label">{link.label}</span>
                      {isActive && <Pill id="nav-underline" className="nav-underline" />}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="nav-actions" aria-label="Utility actions">
            <button
              className="resume-trigger"
              onClick={() => setResumeOpen(true)}
              aria-haspopup="dialog"
            >
              <FileText size={14} />
              <span className="nav-action-label">Résumé</span>
            </button>
          </div>
          <button
            className="menu-button"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <Expand open={open} className="mobile-menu open">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'} onClick={() => setOpen(false)}>
              {link.label}
            </NavLink>
          ))}
          <button
            className="mobile-resume-action"
            onClick={() => {
              setOpen(false);
              setResumeOpen(true);
            }}
          >
            <FileText size={16} />
            <span>Résumé</span>
          </button>
        </Expand>
      </header>

      <main className="route-content" id="main" key={location.pathname}>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container footer-content">
          {/* Top Hero Section */}
          <Reveal>
            <div className="footer-hero">
            <div className="footer-headline-wrap">
              <span className="footer-badge">
                <span className="footer-badge-dot"></span>
                AVAILABLE FOR NEW INITIATIVES
              </span>
              <h2 className="footer-headline">
                Let&apos;s build something <em>dependable.</em>
              </h2>
              <p className="footer-sub">
                Translating complex machine intelligence, data pipelines, and distributed backends into clean, resilient software.
              </p>
            </div>

            <div className="footer-cta-action">
              <a className="footer-cta-card glass glass-interactive" href={`mailto:${site.email}`}>
                <div className="footer-cta-info">
                  <span className="footer-cta-label">Direct Communication</span>
                  <span className="footer-cta-email">{site.email}</span>
                </div>
                <span className="footer-cta-arrow" aria-hidden="true">
                  <ArrowUpRight size={20} />
                </span>
              </a>
            </div>
            </div>
          </Reveal>

          {/* Bottom Bar: Copyright, Tech Stack, Status */}
          <div className="footer-bottom-bar">
            <div className="footer-brand-meta">
              <Link className="footer-wordmark" to="/" aria-label="Home">
                K<span>.</span>
              </Link>
              <span className="footer-copy">
                © {new Date().getFullYear()} {site.name} · Engineered with care and defensible metrics.
              </span>
            </div>

            <div className="footer-meta-right">
              <span className="footer-system-tag">
                <span className="footer-status-dot"></span>
                Porcelain Matte · All Systems Operational
              </span>
              <button
                className="footer-top-btn"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                aria-label="Scroll back to top"
              >
                Top ↑
              </button>
            </div>
          </div>
        </div>
      </footer>

      <ResumeCanvas open={resumeOpen} onClose={() => setResumeOpen(false)} />
    </div>
  );
}
