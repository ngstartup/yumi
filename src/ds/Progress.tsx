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
  // Le remplissage est bombé et légèrement lumineux, la piste est creusée :
  // l'œil comprend l'avancement avant de lire le pourcentage.
  const tones = {
    blue: 'bg-gradient-to-b from-blue-400 to-blue-600 shadow-[inset_0_1px_0_rgba(255,255,255,.45),0_0_10px_-2px_rgba(47,98,240,.7)]',
    sun: 'bg-gradient-to-b from-sun-300 to-sun-400 shadow-[inset_0_1px_0_rgba(255,255,255,.6),0_0_10px_-2px_rgba(255,190,31,.8)]',
    mint: 'bg-gradient-to-b from-mint-400 to-mint-600 shadow-[inset_0_1px_0_rgba(255,255,255,.45),0_0_10px_-2px_rgba(16,185,129,.7)]',
  } as const;
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
        className={cn('w-full overflow-hidden rounded-full bg-surface-sunk shadow-groove', heights[size])}
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
  // Un dégradé par instance : deux anneaux sur le même écran ne doivent pas se
  // partager un identifiant SVG, sinon le second efface le premier.
  const gid = `yumi-ring-${Math.round(size)}-${tone.replace(/[^a-z0-9]/gi, '')}`;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={tone} stopOpacity="0.75" />
            <stop offset="100%" stopColor={tone} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EDF1F9" strokeWidth={stroke} />
        {/* Le fond de la rainure : un filet sombre au centre de la piste. */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(11,27,52,.13)"
          strokeWidth={Math.max(1, stroke / 3.5)}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gid})`}
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
