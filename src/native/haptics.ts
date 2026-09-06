/**
 * Pilote haptique natif (Capacitor).
 *
 * Pourquoi il existe : `navigator.vibrate` n'est implémenté ni par Safari ni
 * par la WKWebView. Sans ce pilote, toute la charte haptique de Yumi serait
 * silencieuse sur iPhone. Android fonctionnerait, mais avec le vibreur brut
 * plutôt qu'avec les effets calibrés du système.
 *
 * Le principe de traduction : la charte (`src/lib/feedback.ts`) décrit un
 * *rythme* — impulsions et pauses en millisecondes. Ici, chaque impulsion
 * devient un `impact` du moteur haptique, programmé au bon instant. Le rythme
 * du motif est donc préservé, mais restitué avec la texture native de
 * l'appareil (moteur Taptic sur iOS, VibrationEffect sur Android) au lieu
 * d'un bourdonnement de durée fixe.
 */

import { Haptics, ImpactStyle } from '@capacitor/haptics';
import type { HapticDriver } from '@/lib/feedback';
import { isNative, pluginAvailable } from './platform';

/** Une impulsion longue est un choc fort : la durée porte l'intensité. */
function styleFor(ms: number): ImpactStyle {
  if (ms <= 12) return ImpactStyle.Light;
  if (ms <= 22) return ImpactStyle.Medium;
  return ImpactStyle.Heavy;
}

let timers: ReturnType<typeof setTimeout>[] = [];

function cancelPending(): void {
  for (const t of timers) clearTimeout(t);
  timers = [];
}

export const nativeHapticDriver: HapticDriver = {
  supported: () => isNative() && pluginAvailable('Haptics'),

  play(pattern) {
    cancelPending();
    let delay = 0;
    for (let i = 0; i < pattern.length; i += 1) {
      const ms = pattern[i];
      // Index pair = impulsion ; index impair = silence, on avance seulement.
      if (i % 2 === 0) {
        const style = styleFor(ms);
        const fire = () => void Haptics.impact({ style }).catch(() => undefined);
        // La première impulsion part tout de suite : pas de latence perçue
        // entre le geste et la réponse de l'appareil.
        if (delay === 0) fire();
        else timers.push(setTimeout(fire, delay));
      }
      delay += ms;
    }
  },

  stop() {
    cancelPending();
  },
};
