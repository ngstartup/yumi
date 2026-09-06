import { forwardRef, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { feedback, type FeedbackEvent } from '@/lib/feedback';

type Variant = 'primary' | 'secondary' | 'ghost' | 'sun' | 'success' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-blue-500 text-white shadow-press hover:bg-blue-600 active:translate-y-[2px] active:shadow-none disabled:bg-blue-200',
  secondary:
    'bg-white text-ink border-2 border-surface-sunk shadow-press hover:border-blue-200 hover:text-blue-600 active:translate-y-[2px] active:shadow-none',
  ghost: 'bg-transparent text-ink-soft hover:bg-surface-sunk',
  sun: 'bg-sun-400 text-ink shadow-press hover:bg-sun-300 active:translate-y-[2px] active:shadow-none',
  success:
    'bg-mint-500 text-white shadow-press hover:bg-mint-600 active:translate-y-[2px] active:shadow-none',
  danger:
    'bg-coral-500 text-white shadow-press hover:bg-coral-600 active:translate-y-[2px] active:shadow-none',
};

const SIZES: Record<Size, string> = {
  sm: 'h-10 px-4 text-sm rounded-xl',
  md: 'h-12 px-5 text-[15px] rounded-xl2',
  lg: 'h-14 px-7 text-base rounded-xl2',
};

const BASE =
  'inline-flex select-none items-center justify-center gap-2 font-semibold tracking-tight transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:translate-y-0';

/** Retour sensoriel par défaut, déduit du rôle du bouton. `null` le désactive
 *  (utile quand l'écran joue déjà un son plus expressif juste après). */
const VARIANT_FEEDBACK: Record<Variant, FeedbackEvent> = {
  primary: 'tap',
  secondary: 'tap',
  ghost: 'tap',
  sun: 'tap',
  success: 'success',
  danger: 'warning',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  feedbackEvent?: FeedbackEvent | null;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    block,
    loading,
    icon,
    className,
    children,
    disabled,
    feedbackEvent,
    onClick,
    ...rest
  },
  ref
) {
  const cue = feedbackEvent === undefined ? VARIANT_FEEDBACK[variant] : feedbackEvent;

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    if (cue) feedback(cue);
    onClick?.(e);
  }

  return (
    <button
      ref={ref}
      className={cn(BASE, VARIANTS[variant], SIZES[size], block && 'w-full', className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      onClick={handleClick}
      {...rest}
    >
      {loading ? <Spinner /> : icon}
      {children}
    </button>
  );
});

export function ButtonLink({
  to,
  variant = 'primary',
  size = 'md',
  block,
  className,
  children,
  onClick,
  ...rest
}: {
  to: string;
  variant?: Variant;
  size?: Size;
  block?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<React.ComponentProps<typeof Link>, 'to' | 'className'>) {
  return (
    <Link
      to={to}
      className={cn(BASE, VARIANTS[variant], SIZES[size], block && 'w-full', className)}
      onClick={(e) => {
        feedback('navigate');
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Chargement"
      className={cn(
        'inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent align-[-2px]',
        className
      )}
    />
  );
}

export function IconButton({
  label,
  children,
  className,
  onClick,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={(e) => {
        feedback('tap');
        onClick?.(e);
      }}
      className={cn(
        'inline-flex h-11 w-11 items-center justify-center rounded-xl text-ink-soft transition-colors hover:bg-surface-sunk hover:text-ink',
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
