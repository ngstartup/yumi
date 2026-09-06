/// <reference types="vite/client" />

/** Injecté par vite.config.ts — vrai pour la build de démonstration mono-fichier. */
declare const __SINGLE_FILE__: boolean;

/** Version de l'application, reprise de package.json à la compilation. */
declare const __APP_VERSION__: string;

/**
 * URL du manifeste de mise à jour, injectée à la compilation.
 *
 * Chaîne vide dans une build locale : les mises à jour à distance sont alors
 * simplement inactives. Le pipeline de publication y place l'URL des Releases
 * GitHub du dépôt, qu'il déduit lui-même — aucune adresse n'est écrite en dur
 * dans le code.
 */
declare const __UPDATE_MANIFEST_URL__: string;

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_UPDATE_MANIFEST_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv & {
    readonly DEV: boolean;
    readonly PROD: boolean;
    readonly MODE: string;
  };
}
