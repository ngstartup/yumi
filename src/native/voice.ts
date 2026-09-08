/**
 * Synthèse vocale native — l'audio des exercices d'écoute.
 *
 * Pourquoi ce fichier existe : dans une WebView Android, `window.speechSynthesis`
 * est bien présent — l'API répond, `speak()` ne lève aucune erreur — mais la
 * liste des voix est vide et **aucun son ne sort**. Le moteur vocal d'Android
 * est un service système auquel la WebView n'est pas reliée ; il faut un plugin
 * natif pour l'atteindre.
 *
 * Le piège, découvert à l'usage : ce service met un temps variable à se lier
 * (typiquement 0,2 à 3 s après le lancement, davantage sur un appareil chargé).
 * Interrogé trop tôt, il répond « aucune langue » — voire lève une exception —
 * alors qu'il parlera parfaitement dix secondes plus tard. Une sonde unique au
 * démarrage concluait donc « pas de voix » et l'application restait muette pour
 * toute la session.
 *
 * D'où les deux principes de ce module :
 *
 *   1. **Le pilote est installé tout de suite**, sans attendre la sonde. Dans
 *      une application empaquetée, le moteur du système est le seul à pouvoir
 *      produire du son : mieux vaut lui parler et échouer que se rabattre sur
 *      un pilote dont on sait qu'il est muet.
 *   2. **La sonde est patiente** : elle réessaie avec des délais croissants
 *      jusqu'à ce que le moteur réponde, et ne conclut « pas d'anglais » que
 *      sur une réponse franche. Elle sert à choisir la meilleure variante
 *      d'anglais, pas à autoriser la parole.
 *
 * Le web n'est pas touché : `src/lib/tts.ts` garde son pilote navigateur par
 * défaut, et les tests continuent de tourner sans plugin.
 */

import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { notifyVoiceChange, webVoiceDriver, type VoiceDriver } from '@/lib/tts';
import { isNative, pluginAvailable } from './platform';

export type VoiceStatus =
  /** Pas d'application empaquetée, ou plugin absent : rien à espérer ici. */
  | 'unsupported'
  /** Le moteur du système n'a pas encore répondu. On parle quand même. */
  | 'probing'
  /** Une voix anglaise est confirmée sur l'appareil. */
  | 'ready'
  /** Le moteur répond, mais aucune voix anglaise n'est installée. */
  | 'noEnglish';

let status: VoiceStatus = 'unsupported';

/** Langue effectivement demandée au moteur. `en-US` tant que rien n'est
 *  confirmé : c'est la valeur par défaut du plugin et la voix la plus souvent
 *  préinstallée. */
let lang = 'en-US';

let probe: Promise<boolean> | null = null;

/** Moteur vocal actuellement utilisé et sa langue — pour l'écran de profil. */
export function nativeVoiceStatus(): { status: VoiceStatus; lang: string } {
  return { status, lang };
}

function setStatus(next: VoiceStatus, nextLang?: string): void {
  if (nextLang) lang = nextLang;
  if (status === next) return;
  status = next;
  notifyVoiceChange();
}

/**
 * Choix de la variante d'anglais. L'anglais britannique est la référence de la
 * charte pédagogique ; à défaut, n'importe quelle autre variante fait l'affaire
 * — un apprenant A1 ne sera pas gêné par un accent américain, il le sera par le
 * silence.
 */
function pickEnglish(languages: unknown): string | null {
  if (!Array.isArray(languages)) return null;
  const tags = languages.filter((l): l is string => typeof l === 'string');
  if (tags.length === 0) return null;
  return (
    tags.find((l) => /^en[-_]GB$/i.test(l)) ??
    tags.find((l) => /^en[-_]US$/i.test(l)) ??
    tags.find((l) => /^en/i.test(l)) ??
    null
  );
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Une tentative d'interrogation du moteur.
 *
 * Lève si le moteur n'est pas encore lié — c'est le signal qu'il faut
 * réessayer, et surtout pas conclure. Renvoie `false` seulement sur une réponse
 * complète et dépourvue d'anglais.
 */
async function askEngine(): Promise<boolean> {
  const { languages } = await TextToSpeech.getSupportedLanguages();
  // Une liste vide n'est pas une réponse : le service n'a pas fini de se lier.
  if (!Array.isArray(languages) || languages.length === 0) throw new Error('tts-not-ready');
  const found = pickEnglish(languages);
  if (found) {
    setStatus('ready', found);
    return true;
  }
  setStatus('noEnglish');
  return false;
}

/** Délais entre tentatives, en millisecondes. La dernière est à ~22 s : au-delà,
 *  le moteur ne se liera plus de cette session. */
const RETRY_MS = [0, 300, 700, 1500, 3000, 5000, 5000, 6000];

async function runProbe(): Promise<boolean> {
  for (const wait of RETRY_MS) {
    if (wait > 0) await sleep(wait);
    try {
      return await askEngine();
    } catch {
      /* moteur pas encore lié — on repasse dans un instant */
    }
  }

  // Dernier recours : certains moteurs constructeurs n'énumèrent pas leurs
  // langues mais savent répondre à la question directe.
  try {
    const { supported } = await TextToSpeech.isLanguageSupported({ lang: 'en-US' });
    if (supported) {
      setStatus('ready', 'en-US');
      return true;
    }
  } catch {
    /* rien de plus à tenter */
  }
  return false;
}

/**
 * Lance (ou récupère) la sonde. Idempotente : plusieurs appels partagent la
 * même promesse, et le résultat n'est jamais attendu par l'interface.
 */
export function probeNativeVoice(): Promise<boolean> {
  if (!isNative() || !pluginAvailable('TextToSpeech')) return Promise.resolve(false);
  if (!probe) probe = runProbe();
  return probe;
}

/** Ouvre l'écran Android d'installation des données vocales. */
export async function openVoiceInstall(): Promise<void> {
  if (!isNative() || !pluginAvailable('TextToSpeech')) return;
  try {
    await TextToSpeech.openInstall();
  } catch {
    /* écran indisponible sur cet appareil : rien de grave */
  }
}

async function nativeSpeak(text: string, options: { rate?: number }): Promise<void> {
  const params = {
    text,
    rate: options.rate ?? 0.95,
    pitch: 1,
    volume: 1,
    category: 'ambient' as const,
  };

  // Couper d'abord : sans cela, deux appuis rapprochés sur « Réécouter »
  // mettent les énoncés en file et se chevauchent.
  await TextToSpeech.stop().catch(() => undefined);

  try {
    await TextToSpeech.speak({ ...params, lang });
    // Le moteur a parlé : la sonde avait tort de douter.
    if (status === 'probing') setStatus('ready');
    return;
  } catch {
    /* on tente le repli ci-dessous */
  }

  // La langue retenue n'est peut-être pas celle que ce moteur accepte.
  if (lang !== 'en-US') {
    try {
      await TextToSpeech.speak({ ...params, lang: 'en-US' });
      setStatus('ready', 'en-US');
      return;
    } catch {
      /* toujours pas */
    }
  }

  // Dernier filet : le pilote du navigateur. Muet dans la plupart des WebViews,
  // mais gratuit à tenter et parfois fonctionnel (WebView à jour, appareil doté
  // du moteur Google Speech Services).
  try {
    if (webVoiceDriver.available()) webVoiceDriver.speak(text, options);
  } catch {
    /* la lecture audio n'est jamais bloquante */
  }
}

export const nativeVoiceDriver: VoiceDriver = {
  id: 'native',

  // Optimiste par construction : tant que le moteur n'a pas dit franchement
  // qu'il n'a pas d'anglais, on considère l'écoute possible. L'inverse ferait
  // disparaître le bouton « Écouter » chez tous les appareils dont le service
  // vocal met plus de deux secondes à se lier.
  available: () => status === 'probing' || status === 'ready',

  speak(text, options) {
    void nativeSpeak(text, options);
  },

  stop() {
    void TextToSpeech.stop().catch(() => undefined);
  },
};

/**
 * Installe le pilote natif s'il y a un moteur système à joindre, et lance la
 * sonde en arrière-plan. Renvoie `false` sur le web, où rien ne change.
 */
export function installNativeVoice(): boolean {
  if (!isNative() || !pluginAvailable('TextToSpeech')) {
    setStatus('unsupported');
    return false;
  }
  setStatus('probing');
  void probeNativeVoice();
  return true;
}
