import { useT } from '@/i18n';
import { ButtonLink } from '@/ds';
import { Fox } from '@/mascot';

export function NotFoundPage() {
  const t = useT();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-surface-alt px-6 text-center">
      <Fox size={120} expression="thinking" animate />
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">{t('common.notFound')}</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Cette page n’existe pas ou a été déplacée.
        </p>
      </div>
      <ButtonLink to="/">{t('common.goHome')}</ButtonLink>
    </div>
  );
}
