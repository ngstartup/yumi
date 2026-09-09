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
import { Button, SegmentedControl } from '@/ds';
import { onVoiceChange, speak, speechAvailable, voiceDriverId } from '@/lib/tts';
import { clipsAvailable, hasClip } from '@/lib/audioClips';
import { isNative, nativeVoiceStatus, openVoiceInstall } from '@/native';
import { useApp } from '@/state/store';
import type { VoicePace } from '@/data/schema';

/** Phrase de test : elle fait partie du contenu, donc elle est enregistrée.
 *  Le bouton éprouve ainsi le chemin réellement emprunté par les exercices. */
const SAMPLE = 'My brother lives in London.';

export function VoiceSection() {
  const t = useT();
  const [, bump] = useState(0);
  const settings = useApp((st) => st.settings);
  const updateSettings = useApp((st) => st.updateSettings);

  // Le moteur du système met parfois plusieurs secondes à se lier : sans cet
  // abonnement, l'écran resterait figé sur « recherche en cours ».
  useEffect(() => onVoiceChange(() => bump((n) => n + 1)), []);

  const driver = voiceDriverId();
  const { status, lang } = nativeVoiceStatus();
  const recorded = clipsAvailable() && hasClip(SAMPLE);

  // Le moteur du système n'est plus qu'un filet : il ne sert qu'aux textes non
  // enregistrés. On ne signale son absence de voix anglaise que si l'on en
  // dépend réellement.
  const missingVoice = !recorded && isNative() && status === 'noEnglish';

  const description = recorded
    ? t('profile.feedback.voiceRecorded')
    : missingVoice
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

      {/* Vitesse. Les enregistrements sont déjà à un débit de débutant ; ce
          réglage laisse chacun l'ajuster à son oreille, sans réenregistrer. */}
      {recorded && settings && (
        <div className="mt-3">
          <p className="mb-2 text-sm font-semibold text-ink-soft">
            {t('profile.feedback.voicePace')}
          </p>
          <SegmentedControl<VoicePace>
            label={t('profile.feedback.voicePace')}
            value={settings.voicePace}
            onChange={(v) => {
              void updateSettings({ voicePace: v });
              // On l'entend tout de suite : un réglage de vitesse qui ne se
              // juge qu'à la prochaine leçon ne se règle jamais.
              window.setTimeout(() => speak(SAMPLE), 60);
            }}
            options={[
              { value: 'slow', label: t('profile.feedback.voiceSlow') },
              { value: 'normal', label: t('profile.feedback.voiceNormal') },
              { value: 'brisk', label: t('profile.feedback.voiceBrisk') },
            ]}
          />
        </div>
      )}

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
