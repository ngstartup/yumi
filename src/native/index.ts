/**
 * Initialisation de l'application empaquetée.
 *
 * Point d'entrée unique : `App.tsx` appelle `initNative()` au démarrage et
 * ignore tout le reste. Sur le web, chaque étape se termine immédiatement sans
 * rien faire — le même code tourne dans le navigateur, dans la PWA et dans
 * l'application installée.
 */

import { App as CapApp } from '@capacitor/app';
import { Keyboard } from '@capacitor/keyboard';
import { SplashScreen } from '@capacitor/splash-screen';
import { Style, StatusBar } from '@capacitor/status-bar';
import { setHapticDriver } from '@/lib/feedback';
import { setSpeechProvider, setVoiceDriver } from '@/lib/tts';
import { nativeHapticDriver } from './haptics';
import { nativeSpeechProvider, probeNativeSpeech } from './speech';
import { installNativeVoice, nativeVoiceDriver } from './voice';
import { checkForUpdate, markAppReady, updatesSupported } from './updates';
import { isNative, isStandalonePwa, pluginAvailable, platform } from './platform';

export { isNative, platform, isStandalonePwa } from './platform';
export { nativeVoiceStatus, openVoiceInstall, type VoiceStatus } from './voice';
export {
  checkForUpdate,
  currentVersion,
  updatesSupported,
  NATIVE_VERSION,
  type UpdateOutcome,
} from './updates';

type Cleanup = () => void;

/**
 * Marque le document quand l'interface est une application — empaquetée sur
 * Android, ou installée depuis le navigateur — et non une page web ouverte
 * dans un onglet.
 *
 * C'est ce marqueur que la feuille de style attend pour couper la sélection de
 * texte : un appui long sur un énoncé ne doit pas faire surgir la loupe et le
 * menu « Copier / Tout sélectionner » par-dessus l'exercice. Sur le web, en
 * revanche, la page vitrine reste sélectionnable — on y copie une adresse ou
 * une phrase, c'est normal.
 */
export function markAppChrome(): () => void {
  if (typeof document === 'undefined') return () => undefined;
  if (!isNative() && !isStandalonePwa()) return () => undefined;
  document.documentElement.setAttribute('data-app', '');
  return () => document.documentElement.removeAttribute('data-app');
}

/** Masque l'écran de lancement — appelé quand l'application est réellement
 *  prête, pas quand la WebView a fini de charger. */
export function hideSplash(): void {
  if (!isNative()) return;
  void SplashScreen.hide({ fadeOutDuration: 220 }).catch(() => undefined);
}

/** Barre d'état : texte sombre sur le fond clair de Yumi. */
async function setupStatusBar(): Promise<void> {
  if (!pluginAvailable('StatusBar')) return;
  try {
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#FFFFFF' });
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch {
    /* une barre d'état non stylée n'empêche pas d'apprendre */
  }
}

/**
 * Clavier : quand il s'ouvre, la barre d'onglets du bas doit disparaître,
 * sinon elle se retrouve posée sur le clavier au-dessus du champ de saisie.
 * On expose l'état en attribut ; la feuille de style fait le reste.
 */
function setupKeyboard(): Cleanup {
  if (!pluginAvailable('Keyboard')) return () => undefined;
  const root = document.documentElement;
  const shown = () => root.setAttribute('data-keyboard', 'open');
  const hidden = () => root.removeAttribute('data-keyboard');

  const handles = [
    Keyboard.addListener('keyboardWillShow', shown),
    Keyboard.addListener('keyboardWillHide', hidden),
  ];

  return () => {
    for (const h of handles) void h.then((l) => l.remove()).catch(() => undefined);
    hidden();
  };
}

/**
 * Bouton retour d'Android. Sans cette prise en charge, un appui ferme
 * l'application au lieu de revenir à l'écran précédent — c'est le premier
 * reproche fait aux applications web empaquetées.
 */
function setupBackButton(): Cleanup {
  if (platform() !== 'android') return () => undefined;
  const handle = CapApp.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) window.history.back();
    else void CapApp.exitApp();
  });
  return () => void handle.then((l) => l.remove()).catch(() => undefined);
}

/**
 * Recherche de mise à jour au retour au premier plan.
 *
 * Deux garde-fous : un intervalle minimal, pour ne pas interroger le réseau à
 * chaque fois que l'apprenant bascule entre deux applications ; et
 * l'activation au *prochain* démarrage, jamais pendant la session en cours.
 */
const UPDATE_INTERVAL_MS = 4 * 60 * 60 * 1000;
let lastCheck = 0;

function setupUpdateChecks(): Cleanup {
  if (!updatesSupported()) return () => undefined;

  const run = () => {
    const now = Date.now();
    if (now - lastCheck < UPDATE_INTERVAL_MS) return;
    lastCheck = now;
    void checkForUpdate();
  };

  // Au lancement, mais après quelques secondes : le premier écran ne doit pas
  // partager la bande passante avec un téléchargement de mise à jour.
  const timer = setTimeout(run, 6000);
  const handle = CapApp.addListener('appStateChange', ({ isActive }) => {
    if (isActive) run();
  });

  return () => {
    clearTimeout(timer);
    void handle.then((l) => l.remove()).catch(() => undefined);
  };
}

/**
 * Prépare tout ce qui dépend de la plateforme et renvoie la fonction de
 * nettoyage. Ne lève jamais : une étape ratée laisse simplement l'application
 * dans son comportement web.
 */
export function initNative(): Cleanup {
  if (!isNative()) return () => undefined;

  // 1. Haptique — indispensable sur iOS, où `navigator.vibrate` n'existe pas,
  //    et plus fidèle que le vibreur brut sur Android.
  if (nativeHapticDriver.supported()) setHapticDriver(nativeHapticDriver);

  // 2. Reconnaissance vocale — le moteur du système remplace la Web Speech API
  //    dès qu'il répond présent. Sonde asynchrone : l'application démarre sans
  //    l'attendre, l'exercice de prononciation apparaît quand la réponse arrive.
  void probeNativeSpeech().then((ok) => {
    if (ok) setSpeechProvider(nativeSpeechProvider);
  });

  // 3. Synthèse vocale — sans elle les exercices d'écoute sont muets : la
  //    WebView Android expose `speechSynthesis` mais aucune voix. Le pilote est
  //    installé immédiatement, sans attendre la sonde : le moteur du système
  //    met parfois plusieurs secondes à se lier, et l'alternative est un pilote
  //    dont on sait qu'il ne produit aucun son. La sonde, elle, tourne en
  //    arrière-plan pour choisir la meilleure variante d'anglais.
  if (installNativeVoice()) setVoiceDriver(nativeVoiceDriver);

  // 4. Habillage système et cycle de vie.
  void setupStatusBar();
  const cleanups = [setupKeyboard(), setupBackButton(), setupUpdateChecks()];

  return () => {
    for (const c of cleanups) c();
    setHapticDriver(null);
    setSpeechProvider(null);
    setVoiceDriver(null);
  };
}

/**
 * Confirme que cette version démarre correctement.
 *
 * À appeler une fois l'application affichée. Tant que ce signal n'arrive pas,
 * une version fraîchement installée est considérée comme suspecte et la
 * précédente est restaurée automatiquement.
 */
export function confirmAppStarted(): void {
  void markAppReady();
}
