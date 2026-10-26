import { useEffect } from 'react';
import { ResumePaper } from '../components/ResumePaper';
import { resumeData } from '../config';

/**
 * Headless print target.
 *
 * Exists so `npm run resume:pdf` can render the résumé with the real
 * stylesheet and hand it to headless Edge, producing public/resume.pdf from
 * the same component the site displays. Deliberately outside SiteLayout: no
 * header, footer, or ambient background belongs in a printed document.
 */
export default function PrintResume() {
  useEffect(() => {
    document.documentElement.classList.add('is-print-route');
    document.title = `${resumeData.name} — Résumé`;
    return () => document.documentElement.classList.remove('is-print-route');
  }, []);

  return (
    <div className="print-resume-page">
      <ResumePaper />
    </div>
  );
}
