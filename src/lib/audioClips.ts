/**
 * Extraits enregistrés des exercices d'écoute.
 *
 * Pourquoi ils existent : la synthèse vocale ne peut pas être tenue pour
 * acquise sur un téléphone. Dans une WebView Android, `speechSynthesis`
 * répond présent mais n'a aucune voix ; le moteur du système, lui, met un
 * temps variable à se lier et n'a pas forcément de voix anglaise installée.
 * Chacun de ces cas produit le même résultat pour l'apprenant : un exercice
 * de compréhension orale muet, sans explication.
 *
 * Un fichier, lui, se joue partout et hors connexion. C'est aussi meilleur
 * pédagogiquement : la prononciation de référence est toujours la même, quel
 * que soit l'appareil.
 *
 * Les fichiers sont produits par `scripts/make-audio.py` (voix Piper
 * en_GB-cori-high) et l'index par le même script. La synthèse vocale reste en
 * repli pour tout texte non enregistré — une phrase ajoutée au contenu avant
 * la prochaine génération, par exemple.
 */

import { CLIP_IDS } from '@/audio/clips';

/** Débit de référence des enregistrements — le `rate` demandé par les écrans
 *  est converti en vitesse de lecture par rapport à celui-ci. */
const NATURAL_RATE = 0.95;

/**
 * Identifiant d'un texte : FNV-1a puis djb2 sur les unités de code UTF-16.
 * Le même calcul, à l'octet près, se trouve dans `scripts/make-audio.py` —
 * c'est ce qui permet de retrouver le fichier sans embarquer la table des
 * textes.
 */
export function clipId(text: string): string {
  const s = text.replace(/\s+/g, ' ').trim();
  let h1 = 0x811c9dc5;
  let h2 = 5381;
  for (let i = 0; i < s.length; i += 1) {
    const c = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 16777619) >>> 0;
    h2 = (Math.imul(h2, 33) ^ c) >>> 0;
  }
  return h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0');
}

/** La démo mono-fichier n'emporte pas les fichiers du dossier `public/`. */
const CLIPS_BUNDLED = typeof __SINGLE_FILE__ === 'undefined' || !__SINGLE_FILE__;

export function clipsAvailable(): boolean {
  return CLIPS_BUNDLED && CLIP_IDS.size > 0 && typeof Audio !== 'undefined';
}

export function hasClip(text: string): boolean {
  return clipsAvailable() && CLIP_IDS.has(clipId(text));
}

function clipUrl(id: string): string {
  const path = `audio/${id}.ogg`;
  try {
    return new URL(path, document.baseURI).toString();
  } catch {
    return path;
  }
}

let current: HTMLAudioElement | null = null;

export function stopClip(): void {
  if (!current) return;
  try {
    current.pause();
    current.src = '';
  } catch {
    /* un élément déjà libéré n'a pas besoin d'être arrêté */
  }
  current = null;
}

/**
 * Joue l'extrait correspondant au texte.
 *
 * Renvoie `false` si aucun enregistrement n'existe — à l'appelant de se
 * rabattre sur la synthèse vocale. `onFailure` couvre l'autre cas : le fichier
 * existe mais le navigateur refuse de le jouer (lecture automatique bloquée,
 * fichier absent du cache hors connexion).
 */
export function playClip(
  text: string,
  options: { rate?: number },
  onFailure?: () => void
): boolean {
  if (!hasClip(text)) return false;

  stopClip();
  try {
    const audio = new Audio(clipUrl(clipId(text)));
    // Ralenti sans monter dans les aigus : c'est le bouton « écouter
    // lentement » des exercices de dictée.
    const el = audio as HTMLAudioElement & { preservesPitch?: boolean; mozPreservesPitch?: boolean };
    el.preservesPitch = true;
    el.mozPreservesPitch = true;
    const ratio = (options.rate ?? NATURAL_RATE) / NATURAL_RATE;
    audio.playbackRate = Math.min(1.5, Math.max(0.5, ratio));
    audio.onended = () => {
      if (current === audio) current = null;
    };
    audio.onerror = () => {
      if (current === audio) current = null;
      onFailure?.();
    };
    current = audio;
    void audio.play().catch(() => {
      if (current === audio) current = null;
      onFailure?.();
    });
    return true;
  } catch {
    current = null;
    return false;
  }
}
