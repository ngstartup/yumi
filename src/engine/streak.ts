/** Série quotidienne — sans système de vies ni de rattrapage payant. */

export interface StreakState {
  current: number;
  best: number;
  /** Dernier jour actif, au format YYYY-MM-DD (fuseau local). */
  lastActiveDay: string | null;
  /** Jours actifs récents, pour le graphique des 7 derniers jours. */
  history: string[];
}

export function emptyStreak(): StreakState {
  return { current: 0, best: 0, lastActiveDay: null, history: [] };
}

export function dayKey(date: Date | number = Date.now()): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function diffInDays(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const da = Date.UTC(ay, am - 1, ad);
  const db = Date.UTC(by, bm - 1, bd);
  return Math.round((db - da) / 86_400_000);
}

/** Enregistre une activité ; idempotent dans la même journée. */
export function registerActivity(state: StreakState, now: Date | number = Date.now()): StreakState {
  const today = dayKey(now);
  if (state.lastActiveDay === today) return state;

  let current = 1;
  if (state.lastActiveDay) {
    const gap = diffInDays(state.lastActiveDay, today);
    current = gap === 1 ? state.current + 1 : 1;
  }

  const history = [...state.history.filter((d) => d !== today), today].slice(-60);
  return {
    current,
    best: Math.max(state.best, current),
    lastActiveDay: today,
    history,
  };
}

/** La série est-elle encore valide aujourd'hui (sans nouvelle activité) ? */
export function effectiveStreak(state: StreakState, now: Date | number = Date.now()): number {
  if (!state.lastActiveDay) return 0;
  const gap = diffInDays(state.lastActiveDay, dayKey(now));
  return gap <= 1 ? state.current : 0;
}

export function lastNDays(n: number, now: Date | number = Date.now()): string[] {
  const base = typeof now === 'number' ? new Date(now) : new Date(now.getTime());
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    out.push(dayKey(d));
  }
  return out;
}
