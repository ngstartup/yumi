/** Voix des exercices d'écoute, et reconnaissance vocale.
 *
 *  Trois moyens de faire entendre l'anglais, essayés dans cet ordre :
 *
 *    1. **Un enregistrement embarqué** (`src/lib/audioClips.ts`). C'est la voie
 *       normale : les 722 énoncés du contenu sont enregistrés une fois pour
 *       toutes et livrés avec l'application. Ils se jouent partout, hors
 *       connexion, avec la même prononciation de référence sur tous les
 *       appareils.
 *    2. `nativeVoiceDriver` — le moteur vocal du système, installé par
 *       l'empaquetage mobile (`src/native/voice.ts`).
 *    3. `webVoiceDriver` — `window.speechSynthesis`, parfait dans un navigateur.
 *
 *  Cet ordre vient de l'expérience, pas de la théorie. Dans une WebView
 *  Android, `speechSynthesis` **existe mais ne dispose d'aucune voix** : l'API
 *  répond présente, `speak()` ne produit aucun son, et l'exercice devient muet
 *  sans qu'aucune erreur ne soit levée. Le moteur du système, lui, met un temps
 *  variable à se lier et n'a pas forcément de voix anglaise installée. Aucun des
 *  deux ne peut être tenu pour acquis ; un fichier, si. */

import { clipsAvailable, playClip, stopClip } from './audioClips';

export interface VoiceDriver {
  readonly id: 'web' | 'native';
  /** Réponse synchrone : appelée pendant le rendu pour masquer le bouton d'écoute. */
  available(): boolean;
  speak(text: string, options: { rate?: number }): void;
  stop(): void;
}

let cachedVoice: SpeechSynthesisVoice | null | undefined;

function synthesisPresent(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function pickVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice !== undefined) return cachedVoice;
  if (!synthesisPresent()) return (cachedVoice = null);
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null; // pas encore chargées — on réessaiera
  const preferred =
    voices.find((v) => /en-GB/i.test(v.lang) && /female|Google|Serena|Kate/i.test(v.name)) ??
    voices.find((v) => /en-GB/i.test(v.lang)) ??
    voices.find((v) => /^en/i.test(v.lang)) ??
    null;
  cachedVoice = preferred;
  return preferred;
}

if (synthesisPresent()) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = undefined;
    pickVoice();
  };
}

export const webVoiceDriver: VoiceDriver = {
  id: 'web',
  available: synthesisPresent,
  speak(text, options) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice();
    if (v) u.voice = v;
    u.lang = v?.lang ?? 'en-GB';
    u.rate = options.rate ?? 0.95;
    u.pitch = 1;
    window.speechSynthesis.speak(u);
  },
  stop() {
    if (synthesisPresent()) window.speechSynthesis.cancel();
  },
};

let voiceDriver: VoiceDriver = webVoiceDriver;

/** Abonnés prévenus quand le moteur vocal change ou finit de s'initialiser.
 *  Le moteur du système peut mettre plusieurs secondes à se lier : sans ce
 *  signal, l'écran de diagnostic afficherait indéfiniment son état de départ. */
const voiceListeners = new Set<() => void>();

export function onVoiceChange(listener: () => void): () => void {
  voiceListeners.add(listener);
  return () => voiceListeners.delete(listener);
}

export function notifyVoiceChange(): void {
  for (const listener of voiceListeners) {
    try {
      listener();
    } catch {
      /* un abonné fautif n'empêche pas les autres d'être prévenus */
    }
  }
}

/** Installe un pilote (appelé par la couche native). `null` revient au web. */
export function setVoiceDriver(next: VoiceDriver | null): void {
  voiceDriver = next ?? webVoiceDriver;
  notifyVoiceChange();
}

/** Pilote actif — utile aux réglages et au diagnostic. */
export function voiceDriverId(): VoiceDriver['id'] {
  return voiceDriver.id;
}

function speakWithDriver(text: string, options: { rate?: number }): void {
  try {
    if (voiceDriver.available()) voiceDriver.speak(text, options);
  } catch {
    /* la lecture audio n'est jamais bloquante */
  }
}

/** Vrai dès qu'il existe un moyen de faire entendre l'anglais : un
 *  enregistrement embarqué suffit, même sans moteur vocal sur l'appareil. */
export function speechAvailable(): boolean {
  if (clipsAvailable()) return true;
  try {
    return voiceDriver.available();
  } catch {
    return false;
  }
}

/**
 * Fait entendre le texte. L'enregistrement embarqué passe en premier : il est
 * disponible partout, hors connexion, et donne toujours la même prononciation
 * de référence. La synthèse vocale de l'appareil reste le repli — pour un
 * texte ajouté au contenu et pas encore enregistré, ou si le fichier ne peut
 * pas être joué.
 */
export function speak(text: string, options: { rate?: number } = {}): void {
  if (!text) return;
  stopSpeaking();
  if (playClip(text, options, () => speakWithDriver(text, options))) return;
  speakWithDriver(text, options);
}

export function stopSpeaking(): void {
  stopClip();
  try {
    voiceDriver.stop();
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// Reconnaissance vocale (exercices de prononciation)
// ---------------------------------------------------------------------------
//
// Deux implémentations possibles derrière une même interface :
//   • `webSpeechProvider` — la Web Speech API du navigateur. Support inégal
//     (absente de Firefox, moteur distant chez Chrome, exige un contexte
//     sécurisé et une permission micro), d'où les vérifications ci-dessous.
//   • le fournisseur natif installé par l'empaquetage mobile
//     (`src/native/speech.ts`), qui s'appuie sur le moteur du système.
//
// Les écrans n'appellent que `recognitionAvailable()` et `listenOnce()` : le
// jour où le fournisseur change, aucun composant n'est touché.

export interface SpeechProvider {
  readonly id: 'web' | 'native';
  /** Réponse synchrone : appelée pendant le rendu pour masquer l'exercice. */
  available(): boolean;
  /** Résout avec la transcription, ou une chaîne vide si rien n'a été entendu. */
  listenOnce(timeoutMs: number): Promise<string>;
}

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: unknown) => void) | null;
  onend: (() => void) | null;
};

function recognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as
    | (new () => SpeechRecognitionLike)
    | null;
}

/** Le constructeur existe, mais l'API a-t-elle une chance de fonctionner ?
 *
 *  La Web Speech API exige un contexte sécurisé (https ou localhost). Dans une
 *  page servie en `file://` ou dans une iframe sans délégation de permission,
 *  le constructeur est bien présent et `start()` échoue systématiquement — ce
 *  qui donne un exercice de prononciation impossible à réussir. Mieux vaut
 *  déclarer l'exercice indisponible que le proposer et le voir échouer. */
function webRecognitionUsable(): boolean {
  if (recognitionCtor() === null) return false;
  if (webRefused) return false;
  if (typeof window !== 'undefined' && window.isSecureContext === false) return false;
  return true;
}

/** Passe à vrai après un refus franc du micro : l'exercice cesse d'être proposé
 *  pour le reste de la session plutôt que d'échouer à chaque tentative. */
let webRefused = false;

/** Codes d'erreur qui ne se résoudront pas en réessayant. */
const FATAL_RECOGNITION_ERRORS = new Set(['not-allowed', 'service-not-allowed', 'audio-capture']);

export const webSpeechProvider: SpeechProvider = {
  id: 'web',
  available: webRecognitionUsable,
  listenOnce: (timeoutMs) => webListenOnce(timeoutMs),
};

let provider: SpeechProvider = webSpeechProvider;

/** Installe un fournisseur (appelé par la couche native). `null` revient au web. */
export function setSpeechProvider(next: SpeechProvider | null): void {
  provider = next ?? webSpeechProvider;
}

/** Fournisseur actif — utile aux réglages et au diagnostic. */
export function speechProviderId(): SpeechProvider['id'] {
  return provider.id;
}

export function recognitionAvailable(): boolean {
  try {
    return provider.available();
  } catch {
    return false;
  }
}

export function listenOnce(timeoutMs = 6000): Promise<string> {
  try {
    return provider.listenOnce(timeoutMs);
  } catch {
    return Promise.reject(new Error('speech-recognition-error'));
  }
}

function webListenOnce(timeoutMs: number): Promise<string> {
  const Ctor = recognitionCtor();
  if (!Ctor) return Promise.reject(new Error('speech-recognition-unavailable'));

  return new Promise((resolve, reject) => {
    const rec = new Ctor();
    rec.lang = 'en-GB';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    let settled = false;
    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
      fn();
    };
    const timer = setTimeout(() => finish(() => resolve('')), timeoutMs);
    rec.onresult = (e) => {
      clearTimeout(timer);
      const transcript = e.results?.[0]?.[0]?.transcript ?? '';
      finish(() => resolve(transcript));
    };
    rec.onerror = (e) => {
      clearTimeout(timer);
      const code = (e as { error?: string })?.error ?? '';
      // Micro refusé ou inaccessible : inutile de reproposer l'exercice.
      if (FATAL_RECOGNITION_ERRORS.has(code)) webRefused = true;
      finish(() => reject(new Error('speech-recognition-error')));
    };
    rec.onend = () => {
      clearTimeout(timer);
      finish(() => resolve(''));
    };
    try {
      rec.start();
    } catch {
      clearTimeout(timer);
      reject(new Error('speech-recognition-error'));
    }
  });
}
