import { motion } from 'motion/react';
import { MapPin } from 'lucide-react';
import { resumeData } from '../config';
import { cinematicMotion } from '../lib/motion';

interface ResumeProfileCardProps {
  reducedMotion: boolean;
}

export function ResumeProfileCard({ reducedMotion }: ResumeProfileCardProps) {
  return (
    <motion.section
      className="resume-profile-card"
      aria-label="Professional profile card"
      initial={reducedMotion ? false : { opacity: 0, y: 14, rotateX: 3 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{
        duration: reducedMotion ? 0 : cinematicMotion.duration.section,
        ease: cinematicMotion.ease.enter,
      }}
    >
      <div className="resume-profile-art" aria-hidden="true">
        <span className="resume-profile-art-label">KS / 01</span>
        <svg viewBox="0 0 260 240" fill="none">
          <motion.path
            className="resume-profile-orbit"
            d="M32 120C32 66 76 26 130 26s98 40 98 94-44 94-98 94-98-40-98-94Z"
            initial={reducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: reducedMotion ? 0 : 0.9, ease: cinematicMotion.ease.enter }}
          />
          <motion.path
            className="resume-profile-orbit resume-profile-orbit--inner"
            d="M54 120c0-42 34-76 76-76s76 34 76 76-34 76-76 76-76-34-76-76Z"
            initial={reducedMotion ? { pathLength: 1, opacity: 0.5 } : { pathLength: 0, opacity: 0.2 }}
            animate={{ pathLength: 1, opacity: 0.7 }}
            transition={{ duration: reducedMotion ? 0 : 0.8, delay: reducedMotion ? 0 : 0.12, ease: cinematicMotion.ease.enter }}
          />
          <motion.path
            className="resume-profile-axis"
            d="M20 120h220M130 12v216"
            initial={reducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: reducedMotion ? 0 : 0.65, delay: reducedMotion ? 0 : 0.18, ease: cinematicMotion.ease.enter }}
          />
          <motion.circle
            className="resume-profile-disc"
            cx="130"
            cy="120"
            r="44"
            initial={reducedMotion ? { scale: 1 } : { scale: 0.78 }}
            animate={reducedMotion ? { scale: 1 } : { scale: [1, 1.035, 1] }}
            transition={reducedMotion ? { duration: 0 } : { duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.text
            className="resume-profile-monogram"
            x="130"
            y="137"
            textAnchor="middle"
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reducedMotion ? 0 : 0.35, delay: reducedMotion ? 0 : 0.38 }}
          >
            K.
          </motion.text>
          <motion.circle
            className="resume-profile-signal"
            cx="197"
            cy="75"
            r="5"
            animate={reducedMotion ? { y: 0 } : { y: [0, -5, 0] }}
            transition={reducedMotion ? { duration: 0 } : { duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </svg>
        <span className="resume-profile-art-foot">SYSTEMS / STUDIES</span>
      </div>

      <div className="resume-profile-copy">
        <div className="resume-profile-topline">
          <span>Professional profile</span>
          <span>2026</span>
        </div>
        <h2>{resumeData.name}</h2>
        <p className="resume-profile-role">{resumeData.role}</p>
        <p className="resume-profile-headline">{resumeData.headline}</p>
        <div className="resume-profile-meta">
          <span className="resume-profile-status">
            <i aria-hidden="true" />
            Open to opportunities
          </span>
          <span className="resume-profile-location">
            <MapPin size={13} aria-hidden="true" />
            {resumeData.location}
          </span>
        </div>
        <div className="resume-profile-disciplines" aria-label="Areas of practice">
          {resumeData.practiceAreas.slice(0, 3).map((area) => (
            <span key={area.title}>{area.title}</span>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
