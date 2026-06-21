import type { ReactNode } from 'react';

interface PillProps {
  children: ReactNode;
  variant?: 'accent' | 'success' | 'warning' | 'default';
}

const variantStyles: Record<string, string> = {
  accent: 'border-amber-500/40 text-amber-300 bg-amber-500/10',
  success: 'border-green-500/40 text-green-300 bg-green-500/10',
  warning: 'border-red-500/40 text-red-300 bg-red-500/10',
  default: 'border-white/30 text-white/80 bg-white/10',
};

export default function Pill({ children, variant = 'default' }: PillProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]}`}
    >
      {children}
    </span>
  );
}
