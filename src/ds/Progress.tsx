import { cn } from '@/lib/cn';

export function ProgressBar({
  value,
  max = 100,
  label,
  tone = 'blue',
  size = 'md',
  showValue = false,
  className,
}: {
  value: number;
  max?: number;
  label?: string;
  tone?: 'blue' | 'sun' | 'mint';
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}) {
  const pct = max <= 0 ? 0 : Math.max(0, Math.min(100, (value / max) * 100));
  const tones = { blue: 'bg-blue-500', sun: 'bg-sun-400', mint: 'bg-mint-500' } as const;
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' } as const;
  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-baseline justify-between text-xs font-semibold text-ink-muted">
          <span>{label}</span>
          {showValue && (
            <span className="tabular-nums text-ink-soft">
              {Math.round(value)} / {max}
            </span>
          )}
        </div>
      )}
      <div
        className={cn('w-full overflow-hidden rounded-full bg-surface-sunk', heights[size])}
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={cn('h-full rounded-full transition-[width] duration-500 ease-out', tones[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function RingProgress({
  value,
  size = 64,
  stroke = 7,
  tone = '#2F62F0',
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  tone?: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EDF1F9" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (pct / 100) * c}
          style={{ transition: 'stroke-dashoffset .6s cubic-bezier(.22,1,.36,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

export function SkillBar({ label, value }: { label: string; value: number }) {
  const tone = value >= 75 ? 'mint' : value >= 50 ? 'blue' : 'sun';
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 text-sm text-ink-soft">{label}</span>
      <ProgressBar value={value} tone={tone} size="sm" className="flex-1" />
      <span className="w-10 shrink-0 text-right text-sm font-semibold tabular-nums text-ink">
        {Math.round(value)}%
      </span>
    </div>
  );
}
