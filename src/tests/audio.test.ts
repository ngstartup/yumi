import { describe, expect, it } from 'vitest';
import { CLIP_IDS } from '@/audio/clips';
import { clipId, VOICE_PACE_RATES } from '@/lib/audioClips';
import { defaultSettings, normalizeSettings } from '@/data/schema';
import { allLessons } from '@/content';
import { PLACEMENT_BANK } from '@/content/placement';

/** Tout ce que le moteur peut donner à prononcer, quelle que soit la session
 *  tirée : c'est le même inventaire que `scripts/collect-audio-strings.ts`. */
function spokenStrings(): string[] {
  const out = new Set<string>();
  const add = (s?: string) => {
    const t = (s ?? '').replace(/\s+/g, ' ').trim();
    if (t) out.add(t);
  };
  for (const lesson of allLessons()) {
    for (const item of lesson.items) {
      if (item.kind === 'vocab') {
        add(item.en);
        add(item.example?.en);
      } else if (item.kind === 'sentence') {
        add(item.en);
      } else if (item.kind === 'grammar') {
        add(item.reference.en);
      } else if (item.kind === 'dialogue') {
        for (const line of item.lines) add(line.en);
      }
    }
  }
  for (const q of PLACEMENT_BANK) add(q.audio);
  return [...out];
}

describe('identifiant d’extrait audio', () => {
  it('reproduit exactement le calcul du générateur Python', () => {
    // Valeurs produites par scripts/make-audio.py. Si ce test casse, les deux
    // implémentations ont divergé et l'application chercherait des fichiers
    // qui n'existent pas.
    expect(clipId('hello')).toBe('4f9f2cab0a9cede7');
    expect(clipId('She works in London.')).toBe('58f80742b7e85d08');
    expect(clipId('the train')).toBe('96dac5ce89c6247c');
  });

  it('ignore les espaces superflus, comme le générateur', () => {
    expect(clipId('  She   works in London. ')).toBe(clipId('She works in London.'));
  });

  it('distingue deux textes voisins', () => {
    expect(clipId('the train')).not.toBe(clipId('the trains'));
  });
});

describe('couverture audio du contenu', () => {
  it('chaque énoncé prononçable a son enregistrement', () => {
    // Le vrai risque : ajouter du contenu sans relancer scripts/make-audio.py.
    // L'application se rabattrait alors sur la synthèse vocale de l'appareil —
    // c'est-à-dire, sur un téléphone, sur le silence.
    const missing = spokenStrings().filter((s) => !CLIP_IDS.has(clipId(s)));
    expect(missing.slice(0, 5)).toEqual([]);
    expect(missing).toHaveLength(0);
  });

  it("n'embarque aucun extrait devenu inutile", () => {
    const used = new Set(spokenStrings().map(clipId));
    const orphans = [...CLIP_IDS].filter((id) => !used.has(id));
    expect(orphans).toHaveLength(0);
  });

  it('a des identifiants bien formés', () => {
    expect(CLIP_IDS.size).toBeGreaterThan(400);
    for (const id of CLIP_IDS) expect(id).toMatch(/^[0-9a-f]{16}$/);
  });
});

describe('vitesse de la voix', () => {
  it('démarre au débit tel qu’enregistré', () => {
    // Les fichiers sont déjà produits à un débit de débutant : « normal » ne
    // doit donc rien changer, sinon le réglage corrigerait deux fois.
    expect(defaultSettings('u1').voicePace).toBe('normal');
    expect(VOICE_PACE_RATES.normal).toBe(1);
  });

  it('encadre le réglage de part et d’autre', () => {
    expect(VOICE_PACE_RATES.slow).toBeLessThan(1);
    expect(VOICE_PACE_RATES.brisk).toBeGreaterThan(1);
  });

  it('ignore une valeur enregistrée qui ne veut rien dire', () => {
    const s = normalizeSettings('u1', { voicePace: 'turbo' } as never);
    expect(s.voicePace).toBe('normal');
  });

  it('conserve le choix de l’apprenant', () => {
    expect(normalizeSettings('u1', { voicePace: 'slow' }).voicePace).toBe('slow');
  });
});
