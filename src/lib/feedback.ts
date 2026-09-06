/**
 * Retour sensoriel de Yumi — son et vibration.
 *
 * Deux principes :
 *  1. Aucun fichier audio. Les sons sont synthétisés à la volée avec la Web Audio
 *     API, ce qui garde l'application légère et réellement utilisable hors ligne.
 *  2. Un seul point d'entrée, `feedback(event)`. L'interface déclare une
 *     intention (« bonne réponse », « appui »), jamais une fréquence ni une durée
 *     de vibration. Ajuster la charte sensorielle = éditer ce fichier.
 *
 * Le service est silencieux et inerte tant que l'utilisateur ne l'a pas activé
 * dans ses réglages, et ne lève jamais d'exception : sur un appareil sans
 * vibreur ou sans Web Audio, les appels ne font simplement rien.
 */

export type FeedbackEvent =
  // Interactions générales
  | 'tap'
  | 'select'
  | 'toggle'
  | 'navigate'
  | 'open'
  | 'close'
  // Correction d'exercice
  | 'correct'
  | 'nearMiss'
  | 'incorrect'
  | 'combo'
  // Récompenses
  | 'xp'
  | 'lessonComplete'
  | 'badge'
  | 'goalReached'
  | 'levelUp'
  // Système
  | 'success'
  | 'warning'
  | 'error';

export type HapticIntensity = 'light' | 'medium' | 'strong';

export interface FeedbackConfig {
  sound: boolean;
  /** 0 → 1 */
  volume: number;
  haptics: boolean;
  intensity: HapticIntensity;
}

export const DEFAULT_FEEDBACK: FeedbackConfig = {
  sound: true,
  volume: 0.6,
  haptics: true,
  intensity: 'medium',
};

let config: FeedbackConfig = { ...DEFAULT_FEEDBACK };

export function configureFeedback(patch: Partial<FeedbackConfig>): FeedbackConfig {
  config = {
    ...config,
    ...patch,
    volume: clamp01(patch.volume ?? config.volume),
  };
  return config;
}

export function feedbackConfig(): FeedbackConfig {
  return config;
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_FEEDBACK.volume;
  return Math.max(0, Math.min(1, n));
}

// ---------------------------------------------------------------------------
// Charte sonore — chaque événement est une petite séquence de notes.
// ---------------------------------------------------------------------------

interface Note {
  /** Fréquence en Hz. */
  f: number;
  /** Départ, en secondes depuis le début de la séquence. */
  t: number;
  /** Durée en secondes. */
  d: number;
  type?: OscillatorType;
  /** Gain relatif (avant application du volume utilisateur). */
  g?: number;
}

/** Notes de référence (tempérament égal, La 440). */
const N = {
  C4: 261.63,
  E4: 329.63,
  G4: 392.0,
  A4: 440.0,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880.0,
  B5: 987.77,
  C6: 1046.5,
  E6: 1318.51,
  G3: 196.0,
  Bb3: 233.08,
  Eb4: 311.13,
};

const CUES: Record<FeedbackEvent, Note[]> = {
  // — Interactions : très courtes, discrètes, jamais fatigantes ————————
  tap: [{ f: N.A5, t: 0, d: 0.03, type: 'sine', g: 0.16 }],
  select: [{ f: N.E5, t: 0, d: 0.04, type: 'sine', g: 0.2 }],
  toggle: [
    { f: N.C5, t: 0, d: 0.035, type: 'sine', g: 0.18 },
    { f: N.G5, t: 0.035, d: 0.05, type: 'sine', g: 0.16 },
  ],
  navigate: [{ f: N.D5, t: 0, d: 0.045, type: 'sine', g: 0.13 }],
  open: [
    { f: N.C5, t: 0, d: 0.05, type: 'sine', g: 0.14 },
    { f: N.F5, t: 0.045, d: 0.07, type: 'sine', g: 0.12 },
  ],
  close: [
    { f: N.F5, t: 0, d: 0.05, type: 'sine', g: 0.12 },
    { f: N.C5, t: 0.045, d: 0.07, type: 'sine', g: 0.11 },
  ],

  // — Correction ————————————————————————————————————————————————
  correct: [
    { f: N.E5, t: 0, d: 0.08, type: 'sine', g: 0.3 },
    { f: N.B5, t: 0.07, d: 0.16, type: 'sine', g: 0.26 },
  ],
  nearMiss: [
    { f: N.D5, t: 0, d: 0.07, type: 'sine', g: 0.26 },
    { f: N.F5, t: 0.065, d: 0.13, type: 'sine', g: 0.22 },
  ],
  incorrect: [
    { f: N.Eb4, t: 0, d: 0.1, type: 'triangle', g: 0.26 },
    { f: N.Bb3, t: 0.09, d: 0.2, type: 'triangle', g: 0.22 },
  ],
  combo: [
    { f: N.G5, t: 0, d: 0.055, type: 'sine', g: 0.24 },
    { f: N.C6, t: 0.055, d: 0.055, type: 'sine', g: 0.24 },
    { f: N.E6, t: 0.11, d: 0.14, type: 'sine', g: 0.22 },
  ],

  // — Récompenses ————————————————————————————————————————————————
  xp: [
    { f: N.C5, t: 0, d: 0.05, type: 'sine', g: 0.22 },
    { f: N.G5, t: 0.05, d: 0.09, type: 'sine', g: 0.2 },
  ],
  lessonComplete: [
    { f: N.C5, t: 0, d: 0.11, type: 'sine', g: 0.3 },
    { f: N.E5, t: 0.1, d: 0.11, type: 'sine', g: 0.3 },
    { f: N.G5, t: 0.2, d: 0.11, type: 'sine', g: 0.3 },
    { f: N.C6, t: 0.3, d: 0.34, type: 'sine', g: 0.32 },
    { f: N.E4, t: 0.3, d: 0.34, type: 'sine', g: 0.12 },
  ],
  badge: [
    { f: N.A5, t: 0, d: 0.06, type: 'triangle', g: 0.26 },
    { f: N.C6, t: 0.06, d: 0.06, type: 'triangle', g: 0.26 },
    { f: N.E6, t: 0.12, d: 0.2, type: 'triangle', g: 0.24 },
  ],
  goalReached: [
    { f: N.G4, t: 0, d: 0.09, type: 'sine', g: 0.26 },
    { f: N.C5, t: 0.085, d: 0.09, type: 'sine', g: 0.28 },
    { f: N.E5, t: 0.17, d: 0.09, type: 'sine', g: 0.28 },
    { f: N.G5, t: 0.255, d: 0.26, type: 'sine', g: 0.3 },
  ],
  levelUp: [
    { f: N.C4, t: 0, d: 0.1, type: 'sine', g: 0.24 },
    { f: N.G4, t: 0.09, d: 0.1, type: 'sine', g: 0.26 },
    { f: N.C5, t: 0.18, d: 0.1, type: 'sine', g: 0.28 },
    { f: N.E5, t: 0.27, d: 0.1, type: 'sine', g: 0.28 },
    { f: N.G5, t: 0.36, d: 0.32, type: 'sine', g: 0.3 },
  ],

  // — Système ————————————————————————————————————————————————————
  success: [
    { f: N.E5, t: 0, d: 0.06, type: 'sine', g: 0.22 },
    { f: N.A5, t: 0.06, d: 0.12, type: 'sine', g: 0.2 },
  ],
  warning: [
    { f: N.F5, t: 0, d: 0.07, type: 'triangle', g: 0.2 },
    { f: N.D5, t: 0.07, d: 0.11, type: 'triangle', g: 0.18 },
  ],
  error: [
    { f: N.Eb4, t: 0, d: 0.09, type: 'sawtooth', g: 0.16 },
    { f: N.G3, t: 0.085, d: 0.17, type: 'sawtooth', g: 0.14 },
  ],
};

// ---------------------------------------------------------------------------
// Charte haptique — motifs en millisecondes, compatibles navigator.vibrate.
// ---------------------------------------------------------------------------

const PATTERNS: Record<FeedbackEvent, number[]> = {
  tap: [8],
  select: [10],
  toggle: [12],
  navigate: [6],
  open: [10],
  close: [6],

  correct: [18],
  nearMiss: [10, 40, 10],
  incorrect: [26, 55, 26],
  combo: [10, 30, 10, 30, 18],

  xp: [12],
  lessonComplete: [18, 45, 18, 45, 40],
  badge: [14, 35, 14, 35, 14],
  goalReached: [22, 50, 22, 50, 45],
  levelUp: [16, 40, 16, 40, 16, 40, 55],

  success: [16],
  warning: [14, 45, 14],
  error: [30, 60, 30],
};

const INTENSITY_SCALE: Record<HapticIntensity, number> = {
  light: 0.6,
  medium: 1,
  strong: 1.55,
};

/** Motif effectif pour un événement, après application de l'intensité choisie. */
export function hapticPattern(event: FeedbackEvent, intensity: HapticIntensity): number[] {
  const scale = INTENSITY_SCALE[intensity] ?? 1;
  return (PATTERNS[event] ?? PATTERNS.tap).map((ms, i) =>
    // Seules les impulsions (index pair) sont amplifiées ; les pauses gardent
    // leur durée, sinon le rythme du motif se déforme.
    i % 2 === 0 ? Math.max(4, Math.round(ms * scale)) : ms
  );
}

// ---------------------------------------------------------------------------
// Web Audio
// ---------------------------------------------------------------------------

type AudioCtor = typeof AudioContext;

function audioCtor(): AudioCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.AudioContext ?? w.webkitAudioContext ?? null) as AudioCtor | null;
}

export function soundSupported(): boolean {
  return audioCtor() !== null;
}

// ---------------------------------------------------------------------------
// Pilote haptique — injectable
// ---------------------------------------------------------------------------
//
// `navigator.vibrate` n'existe pas sur iOS (ni Safari, ni WKWebView) : sans
// point d'injection, toute la charte haptique serait muette sur iPhone. Le
// service décrit donc un *motif*, et le pilote décide comment le restituer.
// L'empaquetage mobile installe un pilote Capacitor (moteur Taptic sur iOS,
// VibrationEffect sur Android) via `setHapticDriver` ; sur le web, le pilote
// par défaut reste `navigator.vibrate`.

export interface HapticDriver {
  /** L'appareil peut-il restituer une vibration ? */
  supported(): boolean;
  /** Joue un motif : millisecondes d'impulsion et de pause, en alternance. */
  play(pattern: number[]): void;
  /** Interrompt immédiatement tout motif en cours. */
  stop(): void;
}

const webHapticDriver: HapticDriver = {
  supported: () => typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function',
  play(pattern) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* ignore */
    }
  },
  stop() {
    try {
      navigator.vibrate(0);
    } catch {
      /* ignore */
    }
  },
};

let hapticDriver: HapticDriver = webHapticDriver;

/** Remplace le pilote haptique. `null` restaure celui du navigateur. */
export function setHapticDriver(driver: HapticDriver | null): void {
  hapticDriver = driver ?? webHapticDriver;
}

export function hapticsSupported(): boolean {
  try {
    return hapticDriver.supported();
  } catch {
    return false;
  }
}

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function ensureContext(): AudioContext | null {
  if (ctx) return ctx;
  const Ctor = audioCtor();
  if (!Ctor) return null;
  try {
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 1;
    master.connect(ctx.destination);
    return ctx;
  } catch {
    ctx = null;
    return null;
  }
}

/**
 * Les navigateurs exigent un geste utilisateur avant de laisser jouer un son.
 * On accroche cette fonction au premier appui : elle crée puis relance le
 * contexte audio, sans jamais rien émettre.
 */
export function unlockAudio(): void {
  const c = ensureContext();
  if (c && c.state === 'suspended') void c.resume().catch(() => undefined);
}

let unlockBound = false;

export function bindAudioUnlock(): () => void {
  if (unlockBound || typeof window === 'undefined') return () => undefined;
  unlockBound = true;
  const handler = () => unlockAudio();
  const events: (keyof WindowEventMap)[] = ['pointerdown', 'keydown', 'touchstart'];
  for (const e of events) window.addEventListener(e, handler, { passive: true });
  return () => {
    for (const e of events) window.removeEventListener(e, handler);
    unlockBound = false;
  };
}

function playCue(event: FeedbackEvent, volume: number): void {
  const notes = CUES[event];
  if (!notes || volume <= 0) return;
  const c = ensureContext();
  if (!c || !master) return;
  if (c.state === 'suspended') void c.resume().catch(() => undefined);

  const now = c.currentTime + 0.005;
  for (const note of notes) {
    try {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = note.type ?? 'sine';
      osc.frequency.setValueAtTime(note.f, now + note.t);

      // Enveloppe courte attaque / décroissance exponentielle : un son net,
      // sans le « clic » d'une coupure brutale.
      const peak = Math.max(0.0001, (note.g ?? 0.2) * volume);
      const start = now + note.t;
      const end = start + note.d;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(peak, start + Math.min(0.012, note.d * 0.3));
      gain.gain.exponentialRampToValueAtTime(0.0001, end);

      osc.connect(gain);
      gain.connect(master);
      osc.start(start);
      osc.stop(end + 0.02);
    } catch {
      /* un son raté n'interrompt jamais l'apprentissage */
    }
  }
}

function vibratePattern(pattern: number[]): void {
  if (!hapticsSupported()) return;
  try {
    hapticDriver.play(pattern);
  } catch {
    /* une vibration ratée n'interrompt jamais l'apprentissage */
  }
}

// ---------------------------------------------------------------------------
// API publique
// ---------------------------------------------------------------------------

/** Déclenche le retour sensoriel associé à un événement d'interface. */
export function feedback(event: FeedbackEvent): void {
  if (config.sound) playCue(event, config.volume);
  if (config.haptics) vibratePattern(hapticPattern(event, config.intensity));
}

/** Aperçu depuis les réglages : joue le son même si l'option vient d'être
 *  modifiée, avec les valeurs fournies plutôt que celles enregistrées. */
export function previewSound(volume: number): void {
  playCue('correct', clamp01(volume));
}

export function previewHaptic(intensity: HapticIntensity): void {
  vibratePattern(hapticPattern('lessonComplete', intensity));
}

/** Coupe immédiatement tout retour en cours (changement d'écran, déconnexion). */
export function stopFeedback(): void {
  if (!hapticsSupported()) return;
  try {
    hapticDriver.stop();
  } catch {
    /* ignore */
  }
}

/** Utilisé par les tests. */
export function __resetFeedback(): void {
  config = { ...DEFAULT_FEEDBACK };
  ctx = null;
  master = null;
  hapticDriver = webHapticDriver;
}
