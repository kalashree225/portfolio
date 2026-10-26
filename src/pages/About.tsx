import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router';
import { PageHead } from '../components/PageHead';
import { useGsapSite } from '../hooks/useGsapSite';

export default function About() {
  useGsapSite();
  return (
    <div className="page">
      <PageHead eyebrow="About" title="Curious by nature. Structured by practice.">
        I&apos;m a developer building useful systems at the intersection of AI, data engineering, backend architecture, and clean product design.
      </PageHead>

      <section className="section container about-grid">
        <div className="portrait" data-gsap="parallax" data-gsap-amount="50">
          <span>K</span>
        </div>
        <div className="about-copy">
          <p>
            I like the part of software where abstract ideas turn into dependable reality: the backend architecture needs to hold under load, the data schemas need to make sense, and the interface needs to clarify rather than distract.
          </p>
          <p>
            My work moves between deep technical systems design and careful human presentation. I build systems that are observable, reproducible, and respectful of the people using and maintaining them.
          </p>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '30px', flexWrap: 'wrap' }}>
            <Link className="button button-dark" to="/work">
              Explore my work <ArrowUpRight size={16} />
            </Link>
            <Link className="text-link" to="/contact">
              Start a conversation <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="section soft-band">
        <div className="container principles">
          <div>
            <p className="eyebrow">Working principles</p>
            <h2>
              Small details<br />
              <em>compound.</em>
            </h2>
          </div>
          <div className="principle-list">
            <div>
              <span>01</span>
              <h3>Make the model clear</h3>
              <p>Good systems start with language, boundaries, and an honest understanding of the problem.</p>
            </div>
            <div>
              <span>02</span>
              <h3>Leave room to improve</h3>
              <p>Build a solid first version without closing the door on better questions later.</p>
            </div>
            <div>
              <span>03</span>
              <h3>Respect the reader</h3>
              <p>Technical work should be understandable to the people who have to use and maintain it.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
