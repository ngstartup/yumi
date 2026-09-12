/**
 * Votre Yumi — les six évolutions et les humeurs de la mascotte.
 *
 * Pourquoi cet écran existe : le renard est dessiné en six évolutions et onze
 * expressions, et un apprenant n'en croisait presque rien. Les évolutions 3 à 6
 * demandent des mois pour apparaître, et la plupart des humeurs passent en une
 * seconde au bas d'un exercice. Tout ce travail restait invisible, et surtout il
 * ne servait à rien : une récompense qu'on ignore n'en est pas une.
 *
 * Ici les six évolutions sont montrées d'emblée — celles à venir en creux, avec
 * le niveau qui les débloque. On voit ce qu'on va gagner, ce qui est le seul
 * intérêt d'une récompense différée. Les humeurs, elles, expliquent le langage
 * du renard : quand il fronce les sourcils, ce n'est pas décoratif.
 */

import { useState } from 'react';
import { useI18n, useT } from '@/i18n';
import { Card, SectionTitle } from '@/ds';
import { Fox, LEVEL_TO_STAGE, STAGE_NAMES, type Expression } from '@/mascot';
import { cn } from '@/lib/cn';
import { feedback } from '@/lib/feedback';
import type { CEFR } from '@/content';

/** Niveau qui débloque chaque évolution — l'inverse de `LEVEL_TO_STAGE`. */
const STAGE_LEVEL: Record<number, CEFR> = { 1: 'A1', 2: 'A2', 3: 'B1', 4: 'B2', 5: 'C1', 6: 'C2' };

/** Les humeurs réellement jouées pendant une leçon, dans l'ordre où on les
 *  rencontre. En montrer une qui n'apparaît jamais serait de la décoration. */
const MOODS: { key: Expression; i18n: string }[] = [
  { key: 'focused', i18n: 'stats.moods.focused' },
  { key: 'proud', i18n: 'stats.moods.proud' },
  { key: 'victory', i18n: 'stats.moods.victory' },
  { key: 'mistake', i18n: 'stats.moods.mistake' },
  { key: 'encouraging', i18n: 'stats.moods.encouraging' },
  { key: 'celebrating', i18n: 'stats.moods.celebrating' },
];

export function YumiCard({ level }: { level: CEFR }) {
  const t = useT();
  const { dict } = useI18n();
  const reached = LEVEL_TO_STAGE[level] ?? 1;
  const [shown, setShown] = useState(reached);

  const locked = shown > reached;
  const stageLevel = STAGE_LEVEL[shown];

  return (
    <section>
      <SectionTitle>{t('stats.yumiTitle')}</SectionTitle>

      <Card>
        {/* Le podium : une lueur au sol qui pose le renard au lieu de le
            laisser flotter au milieu de la carte. */}
        <div className="flex flex-col items-center">
          <div
            className="flex w-full justify-center rounded-xl2 py-3"
            style={{
              backgroundImage:
                'radial-gradient(60% 70% at 50% 78%, rgba(47,98,240,.10) 0%, rgba(47,98,240,0) 70%)',
            }}
          >
            {/* Une évolution à venir est estompée, pas effacée : on doit voir
                ce qu'on va gagner, sinon la récompense n'en est pas une. */}
            <div className={cn('transition-[filter,opacity] duration-200', locked && 'opacity-75 saturate-[.6]')}>
              <Fox size={128} stage={shown} expression={locked ? 'thinking' : 'proud'} animate={!locked} />
            </div>
          </div>

          <p className="mt-2 font-display text-lg font-bold text-ink">{STAGE_NAMES[shown]}</p>
          <p className="mt-0.5 text-sm text-ink-muted">
            {locked
              ? t('stats.yumiLocked', { level: `${stageLevel} — ${dict.levels[stageLevel]}` })
              : t('stats.yumiCurrent', { level: `${stageLevel} — ${dict.levels[stageLevel]}` })}
          </p>
        </div>

        {/* Les six évolutions. Celles à venir sont en creux, comme les unités
            verrouillées du parcours : l'état se lit à la forme. */}
        <ul className="yumi-scroll-x mt-4 flex gap-2 overflow-x-auto pb-1">
          {[1, 2, 3, 4, 5, 6].map((s) => {
            const isLocked = s > reached;
            const isShown = s === shown;
            return (
              <li key={s} className="shrink-0">
                <button
                  type="button"
                  aria-pressed={isShown}
                  aria-label={`${STAGE_NAMES[s]} — ${STAGE_LEVEL[s]}`}
                  onClick={() => {
                    feedback('select');
                    setShown(s);
                  }}
                  className={cn(
                    'flex w-[72px] flex-col items-center gap-1 rounded-xl2 px-1 py-2 transition-colors',
                    isShown ? 'bg-blue-50 shadow-groove' : 'bg-white shadow-e1'
                  )}
                >
                  <span className={cn(isLocked && 'opacity-70 saturate-[.6]')}>
                    <Fox size={42} stage={s} expression={isLocked ? 'thinking' : 'happy'} />
                  </span>
                  <span
                    className={cn(
                      'text-[11px] font-bold tabular-nums',
                      isShown ? 'text-blue-700' : isLocked ? 'text-ink-muted' : 'text-ink-soft'
                    )}
                  >
                    {isLocked ? '🔒' : ''} {STAGE_LEVEL[s]}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <p className="mt-2 text-xs leading-relaxed text-ink-muted">{t('stats.yumiIntro')}</p>
      </Card>

      {/* Les humeurs — le langage du renard, expliqué une fois. */}
      <Card className="mt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          {t('stats.moodsTitle')}
        </p>
        <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {MOODS.map((m) => (
            <li key={m.key} className="flex flex-col items-center gap-1 text-center">
              <Fox size={52} stage={reached} expression={m.key} />
              <span className="text-[11px] leading-tight text-ink-muted">{t(m.i18n)}</span>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}
