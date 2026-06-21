import type { ReactNode } from 'react';

interface SectionCardProps {
  eyebrow?: string;
  title: string;
  description: string;
  tone?: 'accent' | 'default';
  actions?: ReactNode;
  children: ReactNode;
}

export default function SectionCard({
  eyebrow,
  title,
  description,
  tone = 'default',
  actions,
  children,
}: SectionCardProps) {
  return (
    <section
      className={`rounded-2xl border p-5 ${
        tone === 'accent'
          ? 'border-amber-500/20 bg-gradient-to-b from-amber-500/5 to-transparent'
          : 'border-white/10 bg-white/5'
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && (
            <p className="mb-1 text-[0.7rem] uppercase tracking-[0.12em] text-amber-400/70">
              {eyebrow}
            </p>
          )}
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-white/60">{description}</p>
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      {children}
    </section>
  );
}
