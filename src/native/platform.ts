/**
 * Détection de plateforme.
 *
 * Le reste de l'application ne doit jamais tester `window.Capacitor` : elle
 * demande ici « suis-je dans une application installée ? » et rien de plus.
 * Sur le web, tout ce module répond « non » sans jamais lever d'exception.
 */

import { Capacitor } from '@capacitor/core';

export type Platform = 'android' | 'ios' | 'web';

/** Plateforme d'exécution réelle. `web` couvre navigateur et PWA. */
export function platform(): Platform {
  try {
    const p = Capacitor.getPlatform();
    return p === 'android' || p === 'ios' ? p : 'web';
  } catch {
    return 'web';
  }
}

/** Vrai uniquement dans l'application empaquetée (Android / iOS). */
export function isNative(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/** Vrai dans une PWA installée depuis le navigateur (≠ application native). */
export function isStandalonePwa(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return (
      window.matchMedia?.('(display-mode: standalone)').matches === true ||
      (window.navigator as { standalone?: boolean }).standalone === true
    );
  } catch {
    return false;
  }
}

/** Un plugin natif est-il réellement disponible sur cette plateforme ? */
export function pluginAvailable(name: string): boolean {
  try {
    return Capacitor.isPluginAvailable(name);
  } catch {
    return false;
  }
}
