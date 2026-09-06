import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { feedback } from '@/lib/feedback';

export interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  trailing?: ReactNode;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, hint, error, trailing, className, id, ...rest },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = error ? `${inputId}-err` : hint ? `${inputId}-hint` : undefined;
  return (
    <div className={cn('w-full', className)}>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold text-ink-soft">
        {label}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-12 w-full rounded-xl2 border-2 bg-white px-4 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-muted/70',
            error
              ? 'border-coral-400 focus:border-coral-500'
              : 'border-surface-sunk focus:border-blue-400',
            Boolean(trailing) && 'pr-12'
          )}
          {...rest}
        />
        {trailing && <div className="absolute inset-y-0 right-2 flex items-center">{trailing}</div>}
      </div>
      {error ? (
        <p id={`${inputId}-err`} role="alert" className="mt-1.5 text-sm font-medium text-coral-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-2">
      <span>
        <span className="block text-[15px] font-medium text-ink">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-ink-muted">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => {
          feedback('toggle');
          onChange(!checked);
        }}
        className={cn(
          'relative mt-0.5 h-7 w-12 shrink-0 rounded-full transition-colors',
          checked ? 'bg-blue-500' : 'bg-surface-sunk'
        )}
      >
        <span
          className={cn(
            'absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </label>
  );
}

export function OptionCard({
  selected,
  onSelect,
  title,
  description,
  icon,
  disabled,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        feedback('select');
        onSelect();
      }}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        'flex w-full items-center gap-4 rounded-xl2 border-2 bg-white p-4 text-left transition-all',
        selected
          ? 'border-blue-500 ring-4 ring-blue-100'
          : 'border-surface-sunk hover:border-blue-200',
        disabled && 'cursor-not-allowed opacity-50'
      )}
    >
      {icon && (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-ink">{title}</span>
        {description && <span className="mt-0.5 block text-sm text-ink-muted">{description}</span>}
      </span>
      <span
        className={cn(
          'h-5 w-5 shrink-0 rounded-full border-2',
          selected ? 'border-blue-500 bg-blue-500' : 'border-surface-sunk'
        )}
      >
        {selected && (
          <svg viewBox="0 0 20 20" className="h-full w-full text-white" fill="none" aria-hidden="true">
            <path d="M5.5 10.5l3 3 6-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </button>
  );
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex rounded-xl2 bg-surface-sunk p-1">
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => {
            feedback('select');
            onChange(o.value);
          }}
          className={cn(
            'rounded-xl px-4 py-2 text-sm font-semibold transition-all',
            value === o.value ? 'bg-white text-ink shadow-card' : 'text-ink-muted hover:text-ink'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Curseur accessible — utilisé pour le volume des sons.
 * Le retour sonore est joué à la fin du geste (et non à chaque pixel), pour que
 * l'utilisateur entende le niveau qu'il vient de choisir sans saturer l'oreille.
 */
export function Slider({
  value,
  onChange,
  onCommit,
  label,
  min = 0,
  max = 100,
  step = 5,
  format,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  onCommit?: (v: number) => void;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  format?: (v: number) => string;
  disabled?: boolean;
}) {
  const id = useId();
  const percent = max === min ? 0 : ((value - min) / (max - min)) * 100;
  return (
    <div className={cn('w-full', disabled && 'opacity-50')}>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-semibold text-ink-soft">
          {label}
        </label>
        <span className="text-sm font-semibold tabular-nums text-ink">
          {format ? format(value) : value}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        onPointerUp={() => onCommit?.(value)}
        onKeyUp={() => onCommit?.(value)}
        className="yumi-range w-full"
        style={{ ['--yumi-range-fill' as string]: `${percent}%` }}
      />
    </div>
  );
}
