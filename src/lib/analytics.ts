/** Analytics minimaliste — événements horodatés conservés en mémoire et
 *  exposés pour un futur envoi. Aucune dépendance, aucun traceur tiers. */

export type AnalyticsEvent =
  | 'signup'
  | 'signin'
  | 'onboarding_completed'
  | 'placement_started'
  | 'placement_completed'
  | 'placement_skipped'
  | 'lesson_started'
  | 'lesson_completed'
  | 'lesson_abandoned'
  | 'review_started'
  | 'assessment_completed'
  | 'daily_goal_reached'
  | 'offline_download'
  | 'sync_flushed';

interface Entry {
  event: AnalyticsEvent;
  at: number;
  props?: Record<string, string | number | boolean>;
}

const buffer: Entry[] = [];
const MAX = 500;

export function track(event: AnalyticsEvent, props?: Entry['props']) {
  buffer.push({ event, at: Date.now(), props });
  if (buffer.length > MAX) buffer.splice(0, buffer.length - MAX);
  if (import.meta.env?.DEV) console.debug('[yumi:analytics]', event, props ?? '');
}

export function drain(): Entry[] {
  return buffer.splice(0, buffer.length);
}

export function snapshot(): readonly Entry[] {
  return buffer;
}
