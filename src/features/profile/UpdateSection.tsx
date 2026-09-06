import { useEffect, useState } from 'react';
import { Button, Card, SectionTitle, useToast } from '@/ds';
import { useT } from '@/i18n';
import {
  NATIVE_VERSION,
  checkForUpdate,
  currentVersion,
  updatesSupported,
  type UpdateOutcome,
} from '@/native';

/**
 * Version installée et recherche manuelle de mise à jour.
 *
 * Utile en pratique : l'application vérifie déjà toute seule au démarrage,
 * mais après avoir publié une nouvelle version on veut pouvoir la faire
 * descendre tout de suite, sans attendre le prochain cycle.
 */
export function UpdateSection() {
  const t = useT();
  const { push } = useToast();
  const [version, setVersion] = useState(NATIVE_VERSION);
  const [busy, setBusy] = useState(false);
  const supported = updatesSupported();

  useEffect(() => {
    let alive = true;
    void currentVersion().then((v) => {
      if (alive) setVersion(v);
    });
    return () => {
      alive = false;
    };
  }, []);

  function announce(outcome: UpdateOutcome) {
    switch (outcome.status) {
      case 'ready':
        push(t('profile.update.ready'), 'success', '⬇️');
        break;
      case 'current':
        push(t('profile.update.current'), 'info');
        break;
      case 'needsApk':
        push(t('profile.update.needsApk'), 'warning');
        break;
      case 'error':
        push(t('profile.update.error'), 'error');
        break;
      default:
        break;
    }
  }

  async function onCheck() {
    setBusy(true);
    try {
      announce(await checkForUpdate());
      setVersion(await currentVersion());
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <SectionTitle>{t('profile.update.title')}</SectionTitle>
      <Card className="space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-semibold text-ink">{t('profile.update.version')}</span>
          <span className="font-mono text-sm text-ink-muted">{version}</span>
        </div>
        <p className="text-sm leading-relaxed text-ink-muted">
          {supported ? t('profile.update.intro') : t('profile.update.webOnly')}
        </p>
        {supported && (
          <Button variant="secondary" onClick={onCheck} disabled={busy} feedbackEvent={null}>
            {busy ? t('profile.update.checking') : t('profile.update.check')}
          </Button>
        )}
      </Card>
    </section>
  );
}
