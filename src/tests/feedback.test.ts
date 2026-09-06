import { beforeEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_FEEDBACK,
  configureFeedback,
  feedback,
  feedbackConfig,
  hapticPattern,
  hapticsSupported,
  previewHaptic,
  previewSound,
  soundSupported,
  stopFeedback,
  unlockAudio,
  __resetFeedback,
} from '@/lib/feedback';
import { defaultSettings, normalizeSettings } from '@/data/schema';

describe('service de retour sensoriel', () => {
  beforeEach(() => __resetFeedback());

  it('borne le volume entre 0 et 1 et ignore les valeurs invalides', () => {
    expect(configureFeedback({ volume: 2 }).volume).toBe(1);
    expect(configureFeedback({ volume: -3 }).volume).toBe(0);
    expect(configureFeedback({ volume: Number.NaN }).volume).toBe(DEFAULT_FEEDBACK.volume);
  });

  it('conserve les réglages entre deux appels', () => {
    configureFeedback({ sound: false, intensity: 'strong' });
    const cfg = feedbackConfig();
    expect(cfg.sound).toBe(false);
    expect(cfg.intensity).toBe('strong');
    expect(cfg.haptics).toBe(DEFAULT_FEEDBACK.haptics);
  });

  it('amplifie les impulsions haptiques sans déformer le rythme', () => {
    const light = hapticPattern('lessonComplete', 'light');
    const medium = hapticPattern('lessonComplete', 'medium');
    const strong = hapticPattern('lessonComplete', 'strong');

    expect(light).toHaveLength(medium.length);
    expect(strong).toHaveLength(medium.length);

    // Impulsions (index pair) : croissantes avec l'intensité.
    expect(light[0]).toBeLessThan(medium[0]);
    expect(strong[0]).toBeGreaterThan(medium[0]);
    // Pauses (index impair) : identiques, sinon le motif change de rythme.
    expect(light[1]).toBe(medium[1]);
    expect(strong[1]).toBe(medium[1]);
  });

  it('garde une impulsion perceptible même en intensité légère', () => {
    for (const event of ['tap', 'navigate', 'select'] as const) {
      expect(hapticPattern(event, 'light')[0]).toBeGreaterThanOrEqual(4);
    }
  });

  it('reste silencieux et inerte hors navigateur, sans jamais lever d’exception', () => {
    expect(soundSupported()).toBe(false);
    expect(hapticsSupported()).toBe(false);
    configureFeedback({ sound: true, haptics: true, volume: 1 });
    expect(() => {
      feedback('correct');
      feedback('lessonComplete');
      previewSound(0.8);
      previewHaptic('strong');
      unlockAudio();
      stopFeedback();
    }).not.toThrow();
  });
});

describe('réglages persistés', () => {
  it('fournit des valeurs par défaut cohérentes avec le service', () => {
    const s = defaultSettings('u1');
    expect(s.soundEnabled).toBe(DEFAULT_FEEDBACK.sound);
    expect(s.soundVolume).toBe(DEFAULT_FEEDBACK.volume);
    expect(s.hapticsEnabled).toBe(DEFAULT_FEEDBACK.haptics);
    expect(s.hapticsIntensity).toBe(DEFAULT_FEEDBACK.intensity);
  });

  it('complète un enregistrement créé avant l’ajout du retour sensoriel', () => {
    // Ancien format : ni volume, ni haptique.
    const legacy = {
      userId: 'u1',
      notificationsEnabled: true,
      reminderTime: '08:30',
      soundEnabled: false,
      analyticsOptIn: false,
      updatedAt: 1,
    };
    const s = normalizeSettings('u1', legacy);
    expect(s.notificationsEnabled).toBe(true);
    expect(s.reminderTime).toBe('08:30');
    expect(s.soundEnabled).toBe(false);
    expect(s.soundVolume).toBe(DEFAULT_FEEDBACK.volume);
    expect(s.hapticsEnabled).toBe(DEFAULT_FEEDBACK.haptics);
    expect(s.hapticsIntensity).toBe('medium');
  });

  it('rejette une intensité ou un volume corrompus', () => {
    const s = normalizeSettings('u1', {
      soundVolume: 42,
      hapticsIntensity: 'earthquake' as never,
    });
    expect(s.soundVolume).toBe(1);
    expect(s.hapticsIntensity).toBe('medium');
  });
});
