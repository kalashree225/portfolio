import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Download, Printer, X } from 'lucide-react';
import { ResumePaper } from './ResumePaper';
import { ResumeProfileCard } from './ResumeProfileCard';
import { resumeData } from '../config';
import { calm, durations, easings, useCalmReducedMotion } from '../lib/motion';

interface ResumeCanvasProps {
  open: boolean;
  onClose: () => void;
}

export function ResumeCanvas({ open, onClose }: ResumeCanvasProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduced = useCalmReducedMotion();

  // Escape closes, focus moves into the canvas, and the page behind it stops
  // scrolling so the overlay behaves like a dialog rather than a panel.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence initial={false}>
      {open && (
        <div className="resume-overlay" role="dialog" aria-modal="true" aria-labelledby="resume-title">
          <motion.div
            className="resume-backdrop"
            onClick={onClose}
            exit={{ opacity: 0 }}
            transition={calm({ duration: durations.short4, ease: easings.standard }, reduced)}
          />

          <motion.div
            className="resume-canvas"
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.985 }}
            transition={calm({ duration: durations.medium2, ease: easings.calm }, reduced)}
          >
            <div className="resume-toolbar">
              <div className="resume-toolbar-title">
                <span className="resume-toolbar-dot" />
                <span id="resume-title">{resumeData.name} — Résumé</span>
              </div>
              <div className="resume-toolbar-actions">
                <a
                  className="resume-tool-btn"
                  href={`${import.meta.env.BASE_URL}resume.pdf`}
                  download={`${resumeData.name}-Resume.pdf`}
                >
                  <Download size={15} /> <span>Download PDF</span>
                </a>
                <button className="resume-tool-btn" onClick={() => window.print()}>
                  <Printer size={15} /> <span>Print</span>
                </button>
                <button
                  className="resume-tool-btn is-close"
                  onClick={onClose}
                  ref={closeRef}
                  aria-label="Close résumé"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="resume-scroll-area">
              <ResumeProfileCard reducedMotion={reduced} />
              <ResumePaper />
            </div>
        </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
