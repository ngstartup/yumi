import type { Repository } from './repository';

/**
 * Adaptateur Supabase — squelette prêt à brancher.
 *
 * Le MVP tourne sur `LocalRepository`. Pour passer au cloud :
 *  1. créer un projet Supabase et exécuter `supabase/schema.sql` ;
 *  2. `npm i @supabase/supabase-js` ;
 *  3. renseigner VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans `.env` ;
 *  4. compléter les méthodes ci-dessous (chacune est un simple `from().upsert()`
 *     ou `from().select()` — les noms de tables correspondent 1:1 aux stores) ;
 *  5. dans `data/index.ts`, renvoyer cet adaptateur quand les variables
 *     d'environnement sont présentes.
 *
 * Le reste de l'application n'a rien à changer : elle ne connaît que
 * l'interface `Repository`.
 */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function supabaseConfigFromEnv(): SupabaseConfig | null {
  const url = import.meta.env?.VITE_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function createSupabaseRepository(_config: SupabaseConfig): Repository {
  throw new Error(
    "L'adaptateur Supabase n'est pas encore implémenté. " +
      'Voir supabase/schema.sql et les instructions en tête de ce fichier.'
  );
}
