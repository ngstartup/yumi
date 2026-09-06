import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize } from '@capacitor/keyboard';

/**
 * Empaquetage Android de Yumi.
 *
 * L'application web n'est pas modifiée : Capacitor sert la build `dist/` telle
 * quelle depuis un serveur local embarqué. Le routage se fait déjà en
 * HashRouter, donc aucune réécriture d'URL n'est nécessaire.
 *
 * `androidScheme: 'https'` est important : il fait de la WebView un contexte
 * sécurisé (`https://localhost`). Sans cela, `crypto.subtle` — utilisé pour le
 * hachage PBKDF2 des mots de passe — serait indisponible.
 */
const config: CapacitorConfig = {
  appId: 'app.yumi.learn',
  appName: 'Yumi',
  webDir: 'dist',

  server: {
    androidScheme: 'https',
  },

  android: {
    webContentsDebuggingEnabled: true,
    backgroundColor: '#FFFFFF',
  },

  plugins: {
    SplashScreen: {
      launchAutoHide: false, // masqué par le code quand l'app est réellement prête
      launchFadeOutDuration: 220,
      backgroundColor: '#FFFFFF',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: false,
      splashImmersive: false,
    },
    StatusBar: {
      style: 'LIGHT', // texte sombre sur fond clair
      backgroundColor: '#FFFFFF',
      overlaysWebView: false,
    },
    Keyboard: {
      // Le clavier réduit la WebView : les exercices de saisie restent visibles.
      resize: KeyboardResize.Native,
      resizeOnFullScreen: true,
    },

    /**
     * Mises à jour à distance.
     *
     * `autoUpdate: false` et les deux URL vides sont délibérés : Yumi n'utilise
     * aucun service tiers. C'est `src/native/updates.ts` qui interroge le
     * manifeste publié sur les Releases GitHub du projet, et rien ne sort de
     * l'appareil vers un serveur de statistiques.
     *
     * `appReadyTimeout` est le filet de sécurité : si une version publiée ne
     * démarre pas — erreur de syntaxe, module manquant — l'application n'atteint
     * jamais `notifyAppReady()` et le système restaure automatiquement la
     * version précédente au bout de ce délai. Une mauvaise publication ne peut
     * donc pas transformer le téléphone en presse-papier.
     */
    CapacitorUpdater: {
      autoUpdate: false,
      updateUrl: '',
      statsUrl: '',
      channelUrl: '',
      appReadyTimeout: 20000,
      responseTimeout: 30,
      autoDeleteFailed: true,
      autoDeletePrevious: true,
      resetWhenUpdate: true,
    },
  },
};

export default config;
