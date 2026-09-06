import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useT } from '@/i18n';
import { Button, Field, useToast } from '@/ds';
import { Fox } from '@/mascot';
import { useApp } from '@/state/store';
import { AuthFailure } from '@/auth/types';
import { localAuth } from '@/auth/localAuth';

const ERROR_KEY: Record<string, string> = {
  email_invalid: 'auth.errors.emailInvalid',
  email_taken: 'auth.errors.emailTaken',
  password_short: 'auth.errors.passwordShort',
  name_required: 'auth.errors.nameRequired',
  credentials: 'auth.errors.credentials',
  unknown_email: 'auth.errors.unknownEmail',
};

function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  expression = 'encouraging',
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  expression?: 'encouraging' | 'happy' | 'thinking';
}) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-alt">
      <header className="mx-auto w-full max-w-md px-5 py-5">
        <Link to="/" className="inline-flex items-center gap-2">
          <Fox size={32} />
          <span className="font-display text-lg font-extrabold tracking-tight text-ink">Yumi</span>
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 pb-12">
        <div className="mb-6 flex items-center gap-4">
          <Fox size={64} expression={expression} />
          <div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
          </div>
        </div>
        <div className="rounded-xl2 bg-white p-6 shadow-card ring-1 ring-surface-sunk">{children}</div>
        {footer && <div className="mt-5 text-center text-sm text-ink-muted">{footer}</div>}
      </main>
    </div>
  );
}

export function SignUpPage() {
  const t = useT();
  const navigate = useNavigate();
  const signUp = useApp((s) => s.signUp);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signUp(form);
      navigate('/onboarding', { replace: true });
    } catch (err) {
      setError(err instanceof AuthFailure ? t(ERROR_KEY[err.code]) : t('common.error'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title={t('auth.signUpTitle')}
      subtitle={t('auth.signUpSub')}
      footer={
        <>
          {t('auth.hasAccount')}{' '}
          <Link to="/signin" className="font-semibold text-blue-600 hover:underline">
            {t('auth.signIn')}
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={t('auth.firstName')}
            value={form.firstName}
            autoComplete="given-name"
            required
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          />
          <Field
            label={t('auth.lastName')}
            value={form.lastName}
            autoComplete="family-name"
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />
        </div>
        <Field
          label={t('auth.email')}
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Field
          label={t('auth.password')}
          type="password"
          autoComplete="new-password"
          required
          hint={t('auth.passwordHint')}
          error={error ?? undefined}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <Button type="submit" block size="lg" loading={busy}>
          {t('auth.signUp')}
        </Button>
        <p className="text-center text-xs text-ink-muted">{t('auth.oauthSoon')}</p>
      </form>
    </AuthLayout>
  );
}

export function SignInPage() {
  const t = useT();
  const navigate = useNavigate();
  const signIn = useApp((s) => s.signIn);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signIn(form);
      navigate('/app', { replace: true });
    } catch (err) {
      setError(err instanceof AuthFailure ? t(ERROR_KEY[err.code]) : t('common.error'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title={t('auth.signInTitle')}
      subtitle={t('auth.signInSub')}
      expression="happy"
      footer={
        <>
          {t('auth.noAccount')}{' '}
          <Link to="/signup" className="font-semibold text-blue-600 hover:underline">
            {t('auth.signUp')}
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field
          label={t('auth.email')}
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Field
          label={t('auth.password')}
          type="password"
          autoComplete="current-password"
          required
          error={error ?? undefined}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <Button type="submit" block size="lg" loading={busy}>
          {t('auth.signIn')}
        </Button>
        <div className="text-center">
          <Link to="/reset" className="text-sm font-medium text-ink-muted hover:text-blue-600">
            {t('auth.forgot')}
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}

export function ResetPage() {
  const t = useT();
  const navigate = useNavigate();
  const { push } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await localAuth.resetPassword({ email: form.email, newPassword: form.password });
      push(t('auth.resetDone'), 'success', '✅');
      navigate('/signin', { replace: true });
    } catch (err) {
      setError(err instanceof AuthFailure ? t(ERROR_KEY[err.code]) : t('common.error'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout title={t('auth.resetTitle')} subtitle={t('auth.resetSub')} expression="thinking">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field
          label={t('auth.email')}
          type="email"
          inputMode="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Field
          label={t('auth.newPassword')}
          type="password"
          required
          hint={t('auth.passwordHint')}
          error={error ?? undefined}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <Button type="submit" block size="lg" loading={busy}>
          {t('common.save')}
        </Button>
      </form>
    </AuthLayout>
  );
}
