/** Yumi the fox — expression vocabulary.
 *  Each expression is a combination of eye shape, brow, mouth and pose so new
 *  emotions can be added without touching the drawing code. */

export type Expression =
  | 'happy'
  | 'focused'
  | 'surprised'
  | 'proud'
  | 'encouraging'
  | 'sad'
  | 'motivated'
  | 'celebrating'
  | 'thinking'
  | 'mistake'
  | 'victory';

export type EyeShape = 'open' | 'wide' | 'squint' | 'arcUp' | 'half' | 'droop' | 'sparkle';
export type BrowShape = 'none' | 'raised' | 'lowered' | 'sad' | 'determined' | 'asym';
export type MouthShape = 'smile' | 'grin' | 'openSmile' | 'flat' | 'small' | 'frown' | 'o' | 'smirk';

export interface ExpressionSpec {
  eyes: EyeShape;
  brow: BrowShape;
  mouth: MouthShape;
  /** Head tilt in degrees; small values keep the mascot calm and premium. */
  tilt: number;
  blush?: boolean;
  sweat?: boolean;
  sparkles?: boolean;
}

export const EXPRESSIONS: Record<Expression, ExpressionSpec> = {
  happy: { eyes: 'arcUp', brow: 'none', mouth: 'smile', tilt: -2 },
  focused: { eyes: 'half', brow: 'lowered', mouth: 'flat', tilt: 0 },
  surprised: { eyes: 'wide', brow: 'raised', mouth: 'o', tilt: 3 },
  proud: { eyes: 'squint', brow: 'raised', mouth: 'grin', tilt: -3 },
  encouraging: { eyes: 'open', brow: 'raised', mouth: 'smile', tilt: 2 },
  sad: { eyes: 'droop', brow: 'sad', mouth: 'frown', tilt: 4 },
  motivated: { eyes: 'open', brow: 'determined', mouth: 'smirk', tilt: -2 },
  celebrating: { eyes: 'arcUp', brow: 'raised', mouth: 'openSmile', tilt: -4, sparkles: true },
  thinking: { eyes: 'half', brow: 'asym', mouth: 'small', tilt: 5 },
  mistake: { eyes: 'squint', brow: 'sad', mouth: 'small', tilt: 3, sweat: true },
  victory: { eyes: 'sparkle', brow: 'raised', mouth: 'grin', tilt: -3, sparkles: true, blush: true },
};

/** CEFR level → mascot evolution stage (1…6). */
export const LEVEL_TO_STAGE: Record<string, number> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6,
};

export const STAGE_NAMES: Record<number, string> = {
  1: 'Yumi — Explorateur',
  2: 'Yumi — Curieux',
  3: 'Yumi — Confirmé',
  4: 'Yumi — Stratège',
  5: 'Yumi — Expert',
  6: 'Yumi — Maître',
};
