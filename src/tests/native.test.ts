import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_FEEDBACK,
  configureFeedback,
  feedback,
  hapticPattern,
  hapticsSupported,
  setHapticDriver,
  stopFeedback,
  type HapticDriver,
} from '@/lib/feedback';
import {
  recognitionAvailable,
  listenOnce,
  onVoiceChange,
  setSpeechProvider,
  setVoiceDriver,
  speak,
  speechAvailable,
  speechProviderId,
  stopSpeaking,
  voiceDriverId,
  webSpeechProvider,
  type SpeechProvider,
} from '@/lib/tts';
import { isNative, platform } from '@/native/platform';
import { installNativeVoice, nativeVoiceStatus } from '@/native/voice';
import { markAppChrome } from '@/native';
import { checkForUpdate, compareVersions, updatesSupported } from '@/native/updates';

/** Pilote de test : enregistre les motifs reçus au lieu de faire vibrer. */
function recordingDriver(supported = true): HapticDriver & { played: number[][]; stopped: number } {
  const played: number[][] = [];
  return {
    played,
    stopped: 0,
    supported: () => supported,
    play(pattern) {
      played.push(pattern);
    },
    stop() {
      this.stopped += 1;
    },
  };
}

describe('pilote haptique injectable', () => {
  beforeEach(() => {
    setHapticDriver(null);
    configureFeedback({ ...DEFAULT_FEEDBACK });
  });

  it('sans pilote natif, reste inerte hors navigateur', () => {
    // C'est l'état d'iOS avant l'empaquetage : navigator.vibrate n'existe pas.
    expect(hapticsSupported()).toBe(false);
    expect(() => feedback('correct')).not.toThrow();
  });

  it('un pilote installé reçoit le motif de la charte, intensité comprise', () => {
    const driver = recordingDriver();
    setHapticDriver(driver);
    configureFeedback({ sound: false, haptics: true, intensity: 'strong' });

    feedback('lessonComplete');

    expect(hapticsSupported()).toBe(true);
    expect(driver.played).toHaveLength(1);
    expect(driver.played[0]).toEqual(hapticPattern('lessonComplete', 'strong'));
  });

  it('ne sollicite pas le pilote quand les vibrations sont coupées', () => {
    const driver = recordingDriver();
    setHapticDriver(driver);
    configureFeedback({ sound: false, haptics: false });

    feedback('correct');
    expect(driver.played).toHaveLength(0);
  });

  it('ignore un pilote qui se déclare indisponible', () => {
    const driver = recordingDriver(false);
    setHapticDriver(driver);
    configureFeedback({ sound: false, haptics: true });

    feedback('correct');
    stopFeedback();
    expect(hapticsSupported()).toBe(false);
    expect(driver.played).toHaveLength(0);
  });

  it('survit à un pilote qui lève une exception', () => {
    setHapticDriver({
      supported: () => true,
      play() {
        throw new Error('vibreur occupé');
      },
      stop() {
        throw new Error('vibreur occupé');
      },
    });
    configureFeedback({ sound: false, haptics: true });

    expect(() => {
      feedback('correct');
      stopFeedback();
    }).not.toThrow();
  });

  it('revient au pilote du navigateur quand on le retire', () => {
    setHapticDriver(recordingDriver());
    expect(hapticsSupported()).toBe(true);
    setHapticDriver(null);
    expect(hapticsSupported()).toBe(false);
  });
});

describe('fournisseur de reconnaissance vocale', () => {
  beforeEach(() => setSpeechProvider(null));

  it('utilise la Web Speech API par défaut, indisponible hors navigateur', () => {
    expect(speechProviderId()).toBe('web');
    expect(webSpeechProvider.available()).toBe(false);
    expect(recognitionAvailable()).toBe(false);
  });

  it('bascule sur un fournisseur natif sans que les écrans changent d’appel', async () => {
    const native: SpeechProvider = {
      id: 'native',
      available: () => true,
      listenOnce: () => Promise.resolve('she works in london'),
    };
    setSpeechProvider(native);

    expect(speechProviderId()).toBe('native');
    expect(recognitionAvailable()).toBe(true);
    await expect(listenOnce(1000)).resolves.toBe('she works in london');
  });

  it('déclare l’exercice indisponible plutôt que de le laisser échouer', () => {
    setSpeechProvider({
      id: 'native',
      available: () => {
        throw new Error('moteur absent');
      },
      listenOnce: () => Promise.resolve(''),
    });
    expect(recognitionAvailable()).toBe(false);
  });

  it('transforme une erreur synchrone du fournisseur en promesse rejetée', async () => {
    setSpeechProvider({
      id: 'native',
      available: () => true,
      listenOnce: () => {
        throw new Error('micro occupé');
      },
    });
    await expect(listenOnce(1000)).rejects.toThrow('speech-recognition-error');
  });
});

describe('détection de plateforme', () => {
  it('répond « web » hors application empaquetée, sans lever d’exception', () => {
    expect(isNative()).toBe(false);
    expect(platform()).toBe('web');
  });

  it('ne dépend pas d’un objet global fourni par l’hôte', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => platform()).not.toThrow();
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('marqueur « application »', () => {
  it('ne marque rien hors application installée', () => {
    // La page vitrine ouverte dans un navigateur doit rester sélectionnable :
    // on y copie une adresse ou une phrase, c'est le comportement attendu d'un
    // site. Seule l'application installée coupe la sélection au doigt.
    const undo = markAppChrome();
    expect(typeof undo).toBe('function');
    expect(() => undo()).not.toThrow();
  });
});

describe('comparaison de versions', () => {
  it('ordonne par nombre, pas par ordre alphabétique', () => {
    // Le piège classique : en comparaison de chaînes, '0.9.0' > '0.10.0'.
    expect(compareVersions('0.10.0', '0.9.0')).toBeGreaterThan(0);
    expect(compareVersions('1.0.0', '0.99.99')).toBeGreaterThan(0);
    expect(compareVersions('2.3.4', '2.3.4')).toBe(0);
    expect(compareVersions('1.2.3', '1.2.4')).toBeLessThan(0);
  });

  it('tolère les versions incomplètes ou malformées', () => {
    expect(compareVersions('1.2', '1.2.0')).toBe(0);
    expect(compareVersions('1', '1.0.1')).toBeLessThan(0);
    expect(compareVersions('', '0.0.0')).toBe(0);
  });

  it('ne propose aucune mise à jour hors application installée', async () => {
    expect(updatesSupported()).toBe(false);
    await expect(checkForUpdate()).resolves.toEqual({ status: 'unsupported' });
  });
});

describe('pilote de synthèse vocale', () => {
  beforeEach(() => setVoiceDriver(null));

  it('utilise le pilote du navigateur par défaut, muet hors navigateur', () => {
    expect(voiceDriverId()).toBe('web');
    expect(speechAvailable()).toBe(false);
    expect(() => speak('hello')).not.toThrow();
  });

  it('bascule sur le moteur du système sans qu’aucun écran change d’appel', () => {
    // C'est exactement le cas de la WebView Android : `speechSynthesis` répond
    // présent mais ne dispose d'aucune voix, donc aucun son ne sort. Le pilote
    // natif est le seul à parler réellement.
    const spoken: string[] = [];
    setVoiceDriver({
      id: 'native',
      available: () => true,
      speak: (text) => spoken.push(text),
      stop: () => undefined,
    });

    expect(voiceDriverId()).toBe('native');
    expect(speechAvailable()).toBe(true);
    speak('She works in London.');
    expect(spoken).toEqual(['She works in London.']);
  });

  it('ne sollicite pas un pilote qui se déclare indisponible', () => {
    const spoken: string[] = [];
    setVoiceDriver({
      id: 'native',
      available: () => false,
      speak: (text) => spoken.push(text),
      stop: () => undefined,
    });
    speak('hello');
    expect(spoken).toHaveLength(0);
  });

  it('ne lit jamais une chaîne vide', () => {
    const spoken: string[] = [];
    setVoiceDriver({
      id: 'native',
      available: () => true,
      speak: (text) => spoken.push(text),
      stop: () => undefined,
    });
    speak('');
    expect(spoken).toHaveLength(0);
  });

  it('survit à un pilote qui lève une exception', () => {
    setVoiceDriver({
      id: 'native',
      available: () => true,
      speak() {
        throw new Error('moteur vocal occupé');
      },
      stop() {
        throw new Error('moteur vocal occupé');
      },
    });
    expect(() => {
      speak('hello');
      stopSpeaking();
    }).not.toThrow();
  });

  it('revient au pilote du navigateur quand on le retire', () => {
    setVoiceDriver({ id: 'native', available: () => true, speak: () => undefined, stop: () => undefined });
    expect(speechAvailable()).toBe(true);
    setVoiceDriver(null);
    expect(voiceDriverId()).toBe('web');
    expect(speechAvailable()).toBe(false);
  });

  it('prévient ses abonnés du changement de moteur, et cesse après désabonnement', () => {
    // Le moteur du système met parfois plusieurs secondes à se lier : l'écran
    // de diagnostic doit apprendre son arrivée sans interroger en boucle.
    let seen = 0;
    const off = onVoiceChange(() => {
      seen += 1;
    });
    setVoiceDriver({ id: 'native', available: () => true, speak: () => undefined, stop: () => undefined });
    expect(seen).toBe(1);
    off();
    setVoiceDriver(null);
    expect(seen).toBe(1);
  });

  it("n'installe rien hors application empaquetée", () => {
    // Sur le web, `speechSynthesis` fait très bien le travail : la couche
    // native doit rester complètement inerte, sonde comprise.
    expect(installNativeVoice()).toBe(false);
    expect(nativeVoiceStatus().status).toBe('unsupported');
    expect(voiceDriverId()).toBe('web');
  });
});
