/**
 * Synthèse vocale native.
 *
 * Pourquoi ce fichier existe : dans une WebView Android, `window.speechSynthesis`
 * est bien présent — l'API répond, `speak()` ne lève aucune erreur — mais la
 * liste des voix est vide et **aucun son ne sort**. Les exercices d'écoute
 * paraissaient donc muets, sans le moindre message d'erreur pour l'expliquer.
 *
 * Le moteur vocal d'Android est un service système auquel la WebView n'est pas
 * reliée ; il faut passer par un plugin natif pour l'atteindre. C'est ce que
 * fait ce pilote, injecté au démarrage par `initNative()`.
 *
 * Le web n'est pas touché : `src/lib/tts.ts` garde son pilote navigateur par
 * défaut, et les tests continuent de tourner sans plugin.
 */

import { TextToSpeech } from '@capacitor-community/text-to-speech';
import type { VoiceDriver } from '@/lib/tts';
import { isNative, pluginAvailable } from './platform';

/** Langue retenue après la sonde. Vide tant que rien n'est confirmé. */
let lang = '';

/**
 * Le moteur système peut-il réellement parler anglais ?
 *
 * Un téléphone vendu au Niger n'a pas forcément de voix anglaise installée. La
 * question n'est donc pas « le plugin répond-il ? » mais « une voix anglaise
 * est-elle disponible ? » : sans elle, le moteur lirait l'anglais avec la
 * phonétique de la langue du système, ce qui est pire que le silence pour un
 * exercice de compréhension orale.
 */
export async function probeNativeVoice(): Promise<boolean> {
  if (!isNative() || !pluginAvailable('TextToSpeech')) return false;
  try {
    const { languages } = await TextToSpeech.getSupportedLanguages();
    // On préfère l'anglais britannique, référence de la charte pédagogique,
    // puis n'importe quelle autre variante anglaise.
    const found =
      languages.find((l) => /^en[-_]GB$/i.test(l)) ??
      languages.find((l) => /^en[-_]US$/i.test(l)) ??
      languages.find((l) => /^en/i.test(l));
    lang = found ?? '';
    return lang.length > 0;
  } catch {
    return false;
  }
}

export const nativeVoiceDriver: VoiceDriver = {
  id: 'native',

  available: () => lang.length > 0,

  speak(text, options) {
    // Couper d'abord : sans cela, deux appuis rapprochés sur « Réécouter »
    // mettent les énoncés en file et se chevauchent.
    void TextToSpeech.stop()
      .catch(() => undefined)
      .then(() =>
        TextToSpeech.speak({
          text,
          lang,
          rate: options.rate ?? 0.95,
          pitch: 1,
          volume: 1,
          category: 'ambient',
        }).catch(() => undefined)
      );
  },

  stop() {
    void TextToSpeech.stop().catch(() => undefined);
  },
};
