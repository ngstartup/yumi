import { LocalRepository } from './localRepository';
import type { Repository } from './repository';
import { supabaseConfigFromEnv } from './supabaseRepository';

let repoPromise: Promise<Repository> | null = null;

/**
 * Point d'entrée unique de la persistance.
 * Renvoie l'implémentation locale ; lorsque Supabase sera configuré, il suffira
 * d'aiguiller ici sans toucher au reste de l'application.
 */
export function getRepository(): Promise<Repository> {
  if (repoPromise) return repoPromise;
  const cfg = supabaseConfigFromEnv();
  if (cfg) {
    // Bascule cloud — volontairement inactive tant que l'adaptateur n'est pas écrit.
    console.info('[yumi] Configuration Supabase détectée, adaptateur non encore actif.');
  }
  repoPromise = LocalRepository.create();
  return repoPromise;
}

export type { Repository };
export * from './schema';
