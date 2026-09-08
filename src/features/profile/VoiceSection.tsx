/**
 * Diagnostic de la voix des exercices d'écoute.
 *
 * Un exercice d'écoute muet ne dit pas pourquoi il est muet : la synthèse
 * vocale échoue en silence, par construction. Ce bloc rend l'invisible
 * visible — quel moteur parle, dans quelle langue — et donne le seul geste
 * utile quand l'appareil n'a pas de voix anglaise : ouvrir les réglages
 * Android pour l'installer.
 */

import { useEffect, useState } from 'react';
import { useT } from '@/i18n';
import { Button } from '@/ds';
import { onVoiceChange, speak, speechAvailable, voiceDriverId } from '@/lib/tts';
import { isNative, nativeVoiceStatus, openVoiceInstall } from '@/native';

/** Phrase de test : courte, mais assez longue pour juger de l'accent. */
const SAMPLE = 'She works in London and takes the train every morning.';

export function VoiceSection() {
  const t = useT();
  const [, bump] = useState(0);

  // Le moteur du système met parfois plusieurs secondes à se lier : sans cet
  // abonnement, l'écran resterait figé sur « recherche en cours ».
  useEffect(() => onVoiceChange(() => bump((n) => n + 1)), []);

  const driver = voiceDriverId();
  const { status, lang } = nativeVoiceStatus();
  const missingVoice = isNative() && status === 'noEnglish';

  const description = missingVoice
    ? t('profile.feedback.voiceNone')
    : driver === 'native'
      ? status === 'ready'
        ? t('profile.feedback.voiceNative', { lang })
        : t('profile.feedback.voiceProbing')
      : t('profile.feedback.voiceWeb');

  return (
    <div className="border-t border-surface-sunk pt-3">
      <p className="text-sm font-semibold text-ink">{t('profile.feedback.voice')}</p>
      <p className="mt-1 text-sm leading-relaxed text-ink-muted">{description}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="secondary"
          disabled={!speechAvailable()}
          feedbackEvent={null}
          onClick={() => speak(SAMPLE)}
        >
          {t('profile.feedback.voiceTest')}
        </Button>
        {missingVoice && (
          <Button size="sm" variant="secondary" onClick={() => void openVoiceInstall()}>
            {t('profile.feedback.voiceInstall')}
          </Button>
        )}
      </div>

      {missingVoice && (
        <p className="mt-2 text-xs leading-relaxed text-ink-muted">
          {t('profile.feedback.voiceInstallHint')}
        </p>
      )}
    </div>
  );
}
