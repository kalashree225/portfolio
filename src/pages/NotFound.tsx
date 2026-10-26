import { ArrowLeft, ArrowUpRight, Compass } from 'lucide-react';
import { Link } from 'react-router';
import { PageHead } from '../components/PageHead';
import { Reveal } from '../components/Reveal';

export default function NotFound() {
  return (
    <div className="page not-found-page">
      <PageHead eyebrow="404 — Coordinate Unmapped" title="Page not found.">
        The requested URL does not match any route or documented project in this repository.
      </PageHead>

      <section className="section container" style={{ paddingBottom: '100px' }}>
        <Reveal>
          <div className="contact-shell not-found-shell" style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center', padding: '48px 32px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', background: 'var(--veil-strong)', color: 'var(--md-primary)', marginBottom: '24px' }}>
              <Compass size={28} />
            </div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '16px', fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
              Lost in the coordinate grid?
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '1rem', lineHeight: '1.6', maxWidth: '480px', margin: '0 auto 32px' }}>
              The record or essay you are looking for may have been moved, renamed, or never existed in the current build.
            </p>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link className="button button-dark" to="/">
                <ArrowLeft size={16} /> Return to Home
              </Link>
              <Link className="button button-outline" to="/work">
                Explore Projects <ArrowUpRight size={16} />
              </Link>
              <Link className="button button-outline" to="/writing">
                Read Essays <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
