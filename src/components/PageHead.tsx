import type { ReactNode } from 'react';
import { Reveal } from './Reveal';

export function PageHead({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <section className="container page-head">
      <Reveal>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="page-title">{title}</h1>
        {children && <p className="page-lede">{children}</p>}
      </Reveal>
    </section>
  );
}
