import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Card({
  children,
  className,
  as: As = 'div',
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'li';
  padded?: boolean;
}) {
  return (
    <As className={cn('rounded-xl2 bg-white shadow-card ring-1 ring-surface-sunk', padded && 'p-5', className)}>
      {children}
    </As>
  );
}

export function SectionTitle({
  children,
  action,
  className,
}: {
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-3 flex items-baseline justify-between gap-3', className)}>
      <h2 className="font-display text-lg font-bold tracking-tight text-ink">{children}</h2>
      {action}
    </div>
  );
}

export function Chip({
  children,
  tone = 'blue',
  className,
}: {
  children: ReactNode;
  tone?: 'blue' | 'sun' | 'mint' | 'coral' | 'neutral';
  className?: string;
}) {
  const tones = {
    blue: 'bg-blue-50 text-blue-700 ring-blue-100',
    sun: 'bg-sun-50 text-sun-800 ring-sun-100',
    mint: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    coral: 'bg-rose-50 text-rose-700 ring-rose-100',
    neutral: 'bg-surface-sunk text-ink-soft ring-transparent',
  } as const;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1',
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatTile({
  label,
  value,
  sub,
  icon,
  tone = 'blue',
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  icon?: ReactNode;
  tone?: 'blue' | 'sun' | 'mint' | 'neutral';
}) {
  const tones = {
    blue: 'text-blue-600',
    sun: 'text-sun-600',
    mint: 'text-emerald-600',
    neutral: 'text-ink-soft',
  } as const;
  return (
    <div className="rounded-xl2 bg-white p-4 shadow-card ring-1 ring-surface-sunk">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
        {icon && <span className={tones[tone]}>{icon}</span>}
        {label}
      </div>
      <div className="mt-1 font-display text-2xl font-bold tabular-nums text-ink">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-ink-muted">{sub}</div>}
    </div>
  );
}

export function EmptyState({
  title,
  text,
  action,
  illustration,
}: {
  title: string;
  text?: string;
  action?: ReactNode;
  illustration?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl2 bg-surface-alt px-6 py-10 text-center">
      {illustration}
      <p className="mt-3 font-display text-base font-semibold text-ink">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-ink-muted">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
