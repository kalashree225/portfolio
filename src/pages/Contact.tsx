import { useState } from 'react';
import { ArrowUpRight, Check, Copy, Send } from 'lucide-react';
import { site } from '../config';
import { Reveal } from '../components/Reveal';
import { PageHead } from '../components/PageHead';
import { Pill, Pop, Swap } from '../components/motion/primitives';

const topics = ['Full-time role', 'Contract', 'Project', 'Question'] as const;

export default function Contact() {
  const [topic, setTopic] = useState<(typeof topics)[number]>('Project');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
    } catch {
      /* clipboard unavailable — still show feedback */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const subject = `[${topic}] ${name || 'Hello'} — via portfolio`;
    const body = `${message}\n\n— ${name} (${email})`;

    // 1) Optional form service (Formspree / Web3Forms). Configured in site.contactEndpoint.
    if (site.contactEndpoint) {
      setSending(true);
      try {
        await fetch(site.contactEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ name, email, topic, message }),
        });
      } catch {
        /* fall through to mailto even if the service fails */
      } finally {
        setSending(false);
      }
    }

    // 2) Mailto compose — real delivery path with no backend.
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <div className="page">
      <PageHead eyebrow="Contact" title="A thoughtful conversation starts here.">
        Open roles, engineering projects, or systems questions — pick a topic and
        send something concrete. I reply within 24–48 hours.
      </PageHead>

      <section className="container contact-section">
        <Reveal>
          <div className="contact-shell glass">
            <aside className="contact-rail">
              <div className="beacon-pill">
                <span className="beacon-dot" />
                <span>Open to AI &amp; software systems roles</span>
              </div>
              <div className="contact-email-row">
                <a className="contact-email-compact" href={`mailto:${site.email}`}>
                  {site.email}
                </a>
                <button
                  type="button"
                  className="icon-button"
                  onClick={handleCopyEmail}
                  aria-label="Copy email address"
                  title="Copy email"
                >
                  {copied ? (
                    <span className="success-icon">
                      <Check size={15} />
                    </span>
                  ) : (
                    <Copy size={15} />
                  )}
                </button>
              </div>
              {copied && (
                <Pop open={copied} origin="top left">
                  <span className="copy-note" role="status">
                    Copied to clipboard
                  </span>
                </Pop>
              )}
              <div className="contact-socials compact">
                <a href={site.github} target="_blank" rel="noopener noreferrer">
                  GitHub <ArrowUpRight size={14} />
                </a>
                <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
                  LinkedIn <ArrowUpRight size={14} />
                </a>
              </div>
              <dl className="contact-meta">
                <div>
                  <dt>Response</dt>
                  <dd>24–48 hours</dd>
                </div>
                <div>
                  <dt>Location</dt>
                  <dd>India · remote-friendly</dd>
                </div>
                <div>
                  <dt>Focus</dt>
                  <dd>AI, data &amp; backends</dd>
                </div>
              </dl>
              <div className="contact-checklist">
                <p>A good first message has</p>
                <ul>
                  <li>What you&apos;re hiring for or building</li>
                  <li>Timeline and scope in 2 lines</li>
                  <li>One link: spec, repo, or role</li>
                </ul>
              </div>
            </aside>

            <div className="contact-form-wrap">
              <Swap pane={sent ? 'success' : 'form'}>
                {sent ? (
                  <div className="contact-success">
                  <span className="success-icon">
                    <Check size={30} />
                  </span>
                  <h3>Your email app should be open</h3>
                  <p>
                    The message was composed to {site.email}
                    {site.contactEndpoint
                      ? ' and a copy was sent via the form service.'
                      : '. Just press send there — nothing to configure.'}
                  </p>
                  <button className="text-link" type="button" onClick={() => setSent(false)}>
                    Compose another <ArrowUpRight size={15} />
                  </button>
                </div>
              ) : (
                <form className="contact-form compact" onSubmit={handleSubmit}>
                  <div className="topic-row" role="group" aria-label="Message topic">
                    {topics.map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={topic === t ? 'active' : ''}
                        onClick={() => setTopic(t)}
                        aria-pressed={topic === t}
                      >
                        {topic === t && <Pill id="contact-topic-pill" />}
                        <span className="pill-label">{t}</span>
                      </button>
                    ))}
                  </div>
                  <div className="field-row">
                    <label htmlFor="contact-name">
                      Name
                      <input
                        id="contact-name"
                        name="name"
                        autoComplete="name"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </label>
                    <label htmlFor="contact-email">
                      Email
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </label>
                  </div>
                  <label htmlFor="contact-message">
                    Message
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={4}
                      placeholder="Role or project, timeline, and one useful link."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </label>
                  <button className="button button-dark compact-submit" type="submit" disabled={sending}>
                    <Send size={15} /> {sending ? 'Sending…' : 'Compose email'} <ArrowUpRight size={15} />
                  </button>
                  <p className="form-note">
                    Opens your email client addressed to {site.email}
                    {site.contactEndpoint ? ' + sends via form service.' : ' — no account or backend needed.'}
                  </p>
                </form>
              )}
              </Swap>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
