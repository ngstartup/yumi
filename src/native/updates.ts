/**
 * Mises à jour à distance (OTA).
 *
 * Ce que cela permet : modifier le code de Yumi, publier, et retrouver la
 * nouvelle version sur le téléphone au démarrage suivant — sans réinstaller
 * l'APK, sans passer par un magasin d'applications.
 *
 * Ce que cela ne permet pas : ajouter un plugin natif, une permission Android
 * ou changer l'icône. Tout cela vit dans la coquille native et exige un
 * nouvel APK. La frontière est simple : ce qui est dans `dist/` se met à jour
 * à distance, le reste non.
 *
 * Le fonctionnement, en trois temps :
 *   1. L'application lit un manifeste JSON publié sur les Releases GitHub du
 *      projet — un fichier statique, aucun serveur à maintenir.
 *   2. Si la version annoncée diffère de celle installée, le paquet est
 *      téléchargé et vérifié par empreinte SHA-256.
 *   3. Il est activé **au démarrage suivant** (`next`), jamais séance tenante :
 *      recharger la WebView au milieu d'un exercice ferait perdre la réponse
 *      en cours.
 *
 * Filet de sécurité : `notifyAppReady()` n'est appelé qu'une fois l'application
 * réellement affichée. Une version publiée qui ne démarre pas ne l'atteint
 * jamais, et le système restaure tout seul la version précédente.
 */

import { CapacitorHttp } from '@capacitor/core';
import { CapacitorUpdater, type BundleInfo } from '@capgo/capacitor-updater';
import { isNative } from './platform';

/** Injectée à la compilation par le pipeline de publication (voir vite.config.ts). */
const MANIFEST_URL = __UPDATE_MANIFEST_URL__;

/** Version embarquée dans l'APK, issue de package.json. */
export const NATIVE_VERSION = __APP_VERSION__;

export interface UpdateManifest {
  /** Version du paquet web, au format `1.2.3`. */
  version: string;
  /** URL directe du fichier .zip. */
  url: string;
  /** Empreinte SHA-256 du zip, en hexadécimal minuscule. */
  checksum?: string;
  /** Version minimale de l'APK requise pour ce paquet. */
  minNative?: string;
  /** Résumé affiché à l'apprenant. */
  notes?: string;
}

export type UpdateOutcome =
  /** Plateforme web, ou aucune URL de manifeste compilée dans cette build. */
  | { status: 'unsupported' }
  /** Déjà à jour. */
  | { status: 'current'; version: string }
  /** Paquet téléchargé : il s'activera au prochain démarrage. */
  | { status: 'ready'; version: string; notes?: string }
  /** Une mise à jour existe mais exige un nouvel APK. */
  | { status: 'needsApk'; version: string; minNative: string }
  | { status: 'error'; reason: string };

/** Comparaison de versions `1.2.3`. Retourne <0, 0 ou >0.
 *  Exporté pour les tests : c'est ce comparateur qui décide si une mise à
 *  jour descend ou non, et une comparaison de chaînes y verrait 0.9 > 0.10. */
export function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map((n) => Number.parseInt(n, 10) || 0);
  const pb = b.split('.').map((n) => Number.parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

/** Les mises à jour sont-elles possibles dans ce contexte ? */
export function updatesSupported(): boolean {
  return isNative() && MANIFEST_URL.length > 0;
}

/** Version web réellement en cours d'exécution : celle de l'APK au premier
 *  lancement, puis celle du dernier paquet appliqué. */
export async function currentVersion(): Promise<string> {
  if (!isNative()) return NATIVE_VERSION;
  try {
    const { bundle } = await CapacitorUpdater.current();
    // `builtin` est le paquet d'origine, livré dans l'APK.
    return bundle.version && bundle.version !== 'builtin' ? bundle.version : NATIVE_VERSION;
  } catch {
    return NATIVE_VERSION;
  }
}

/**
 * Confirme que cette version fonctionne.
 *
 * À n'appeler qu'après le premier rendu réussi : c'est précisément l'absence
 * de cet appel qui déclenche la restauration automatique d'une version
 * défaillante.
 */
export async function markAppReady(): Promise<void> {
  if (!isNative()) return;
  try {
    await CapacitorUpdater.notifyAppReady();
  } catch {
    /* l'apprentissage ne s'interrompt pas pour un mécanisme de mise à jour */
  }
}

/** Valide la forme du manifeste : sans version ni url, il n'y a rien à faire. */
function asManifest(data: unknown): UpdateManifest | null {
  const m = data as UpdateManifest | null;
  return m?.version && m?.url ? m : null;
}

/**
 * Lit le manifeste publié sur les Releases.
 *
 * En natif, la requête passe par `CapacitorHttp` et non par `fetch`. Ce n'est
 * pas un détail d'implémentation : GitHub ne renvoie **aucun en-tête CORS** sur
 * les fichiers de Release, et la WebView (origine `https://localhost`) rejette
 * donc un `fetch` avant même qu'il atteigne le réseau. La mise à jour semblait
 * alors introuvable alors que le manifeste était parfaitement en ligne.
 * `CapacitorHttp` exécute la requête côté natif, où la politique d'origine ne
 * s'applique pas.
 *
 * Le paquet lui-même n'a jamais été concerné : `CapacitorUpdater.download()`
 * télécharge déjà nativement.
 */
async function fetchManifest(): Promise<UpdateManifest | null> {
  // Paramètre anti-cache : sans lui, un manifeste périmé peut être resservi et
  // l'application resterait indéfiniment sur une version ancienne.
  const url = `${MANIFEST_URL}?t=${Date.now()}`;
  try {
    if (isNative()) {
      const res = await CapacitorHttp.get({
        url,
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.status < 200 || res.status >= 300) return null;
      // GitHub sert le fichier en `application/octet-stream` : selon la
      // plateforme, `data` arrive déjà décodé ou encore sous forme de texte.
      const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
      return asManifest(data);
    }
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return asManifest(await res.json());
  } catch {
    return null;
  }
}

let inFlight: Promise<UpdateOutcome> | null = null;

/**
 * Cherche une mise à jour et la prépare pour le démarrage suivant.
 *
 * Les appels concurrents partagent la même opération : un retour au premier
 * plan pendant un téléchargement ne le relance pas.
 */
export function checkForUpdate(): Promise<UpdateOutcome> {
  if (!updatesSupported()) return Promise.resolve({ status: 'unsupported' });
  if (inFlight) return inFlight;

  inFlight = (async (): Promise<UpdateOutcome> => {
    const manifest = await fetchManifest();
    if (!manifest) return { status: 'error', reason: 'manifest-unreachable' };

    const running = await currentVersion();
    if (compareVersions(manifest.version, running) <= 0) {
      return { status: 'current', version: running };
    }

    // Un paquet web peut exiger une coquille native plus récente : nouveau
    // plugin, nouvelle permission. Le télécharger quand même livrerait une
    // application qui appelle du code absent de l'APK.
    if (manifest.minNative && compareVersions(manifest.minNative, NATIVE_VERSION) > 0) {
      return { status: 'needsApk', version: manifest.version, minNative: manifest.minNative };
    }

    try {
      const bundle: BundleInfo = await CapacitorUpdater.download({
        url: manifest.url,
        version: manifest.version,
        ...(manifest.checksum ? { checksum: manifest.checksum } : {}),
      });
      // `next` et non `set` : on n'arrache pas la page sous les doigts de
      // l'apprenant. Le paquet devient actif au prochain lancement.
      await CapacitorUpdater.next({ id: bundle.id });
      return { status: 'ready', version: manifest.version, notes: manifest.notes };
    } catch (err) {
      return { status: 'error', reason: err instanceof Error ? err.message : 'download-failed' };
    }
  })().finally(() => {
    inFlight = null;
  });

  return inFlight;
}
