/**
 * Reconnaissance vocale native.
 *
 * Ce que cela change par rapport à la Web Speech API :
 *   • fonctionne réellement sur iOS, où la WKWebView n'expose pas l'API web ;
 *   • le moteur du système peut fonctionner hors connexion, alors que celui de
 *     Chrome envoie l'audio à un serveur — un exercice de prononciation reste
 *     donc jouable dans le métro ;
 *   • la permission micro est demandée par le système d'exploitation, avec un
 *     état lisible, au lieu d'un échec silencieux du navigateur.
 *
 * Permissions à déclarer dans les projets natifs (voir MOBILE.md) :
 *   Android — RECORD_AUDIO
 *   iOS     — NSMicrophoneUsageDescription, NSSpeechRecognitionUsageDescription
 */

import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import type { SpeechProvider } from '@/lib/tts';
import { isNative, pluginAvailable } from './platform';

/** Le moteur du système est présent et utilisable. Sondé une fois au démarrage :
 *  `available()` doit répondre de façon synchrone pendant le rendu. */
let engineReady = false;

/** Passe à faux après un refus explicite du micro : l'exercice de prononciation
 *  cesse d'être proposé plutôt que d'échouer à chaque tentative. */
let permissionRefused = false;

async function ensurePermission(): Promise<boolean> {
  try {
    const current = await SpeechRecognition.checkPermissions();
    if (current.speechRecognition === 'granted') return true;
    if (current.speechRecognition === 'denied') {
      permissionRefused = true;
      return false;
    }
    // 'prompt' : on demande au moment où l'apprenant appuie sur le micro, pas
    // au lancement de l'application.
    const asked = await SpeechRecognition.requestPermissions();
    const granted = asked.speechRecognition === 'granted';
    if (!granted) permissionRefused = true;
    return granted;
  } catch {
    return false;
  }
}

export const nativeSpeechProvider: SpeechProvider = {
  id: 'native',

  available: () => engineReady && !permissionRefused,

  async listenOnce(timeoutMs) {
    if (!(await ensurePermission())) {
      throw new Error('speech-recognition-unavailable');
    }

    // Le plugin n'a pas de délai maximal : on arrête l'écoute nous-mêmes pour
    // que l'exercice ne reste jamais bloqué sur un micro ouvert.
    let timer: ReturnType<typeof setTimeout> | null = null;
    const guard = new Promise<string>((resolve) => {
      timer = setTimeout(() => {
        void SpeechRecognition.stop().catch(() => undefined);
        resolve('');
      }, timeoutMs);
    });

    try {
      const listen = SpeechRecognition.start({
        language: 'en-US',
        maxResults: 1,
        partialResults: false,
        popup: false, // l'interface de Yumi remplace la boîte de dialogue Android
      }).then((r) => r.matches?.[0] ?? '');

      return await Promise.race([listen, guard]);
    } catch {
      throw new Error('speech-recognition-error');
    } finally {
      if (timer) clearTimeout(timer);
    }
  },
};

/**
 * Sonde le moteur natif. Retourne vrai si le fournisseur natif doit être
 * installé à la place de la Web Speech API.
 */
export async function probeNativeSpeech(): Promise<boolean> {
  if (!isNative() || !pluginAvailable('SpeechRecognition')) return false;
  try {
    const { available } = await SpeechRecognition.available();
    engineReady = available === true;
    return engineReady;
  } catch {
    engineReady = false;
    return false;
  }
}
