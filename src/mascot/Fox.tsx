import { useId } from 'react';
import { cn } from '@/lib/cn';
import { EXPRESSIONS, type Expression } from './expressions';

/**
 * Yumi — la mascotte renard.
 *
 * Géométrie entièrement originale : un crâne rond, des oreilles courtes et
 * écartées, et un large masque crème qui porte les yeux, le museau et la
 * bouche. Rien n'est dérivé du personnage d'une autre application de langues.
 *
 * La silhouette a été redessinée après la refonte visuelle ; les coordonnées
 * du visage, elles, n'ont pas bougé d'un pixel. C'est volontaire : les onze
 * expressions et les six évolutions sont dessinées sur cette grille
 * (yeux en 44 et 76 à hauteur 60, museau en 83, bouche vers 95), et les
 * redessiner aurait été refaire soixante-six dessins au lieu d'un.
 *
 * `stage` (1…6) suit la progression CECRL de l'apprenant et ajoute des
 * accessoires ; `expression` pilote les yeux, les sourcils et la bouche.
 */
export function Fox({
  expression = 'happy',
  stage = 1,
  size = 120,
  className,
  animate = false,
  title,
}: {
  expression?: Expression;
  stage?: number;
  size?: number;
  className?: string;
  animate?: boolean;
  title?: string;
}) {
  const uid = useId().replace(/:/g, '');
  const spec = EXPRESSIONS[expression] ?? EXPRESSIONS.happy;
  const s = Math.min(6, Math.max(1, Math.round(stage)));

  // Coat deepens slightly as the learner advances.
  const coatTop = ['#FFD04D', '#FFC93C', '#FFBE1F', '#FDB114', '#F5A507', '#EE9B02'][s - 1];
  const coatBottom = ['#F5A507', '#F09F05', '#EA9704', '#E08D03', '#D07F02', '#B96D01'][s - 1];

  return (
    <svg
      viewBox="0 0 120 130"
      width={size}
      height={(size * 130) / 120}
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id={`coat-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={coatTop} />
          <stop offset="100%" stopColor={coatBottom} />
        </linearGradient>
        <linearGradient id={`sheen-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity=".45" />
          <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`mask-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FFF3DE" />
        </linearGradient>
        <radialGradient id={`glow-${uid}`} cx="0.32" cy="0.24" r="0.62">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity=".55" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`ground-${uid}`}>
          <stop offset="0%" stopColor="#0B1B34" stopOpacity=".28" />
          <stop offset="100%" stopColor="#0B1B34" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* L'ombre au sol. Sans elle, Yumi flotte au-dessus de l'écran sans lui
          appartenir ; elle reste immobile pendant que le renard respire, ce qui
          est précisément ce qui donne l'impression qu'il est posé. */}
      <ellipse cx="60" cy="125" rx="31" ry="4.6" fill={`url(#ground-${uid})`} />

      <g className={cn(animate && 'animate-floaty')}>
      <g transform={`rotate(${spec.tilt} 60 70)`}>
        {/* Oreilles — courtes et écartées. Leur base mord sur le crâne : posées
            au-dessus, elles flottent au lieu d'y être attachées. */}
        <path d="M24 46 L14 17 L46 28 Z" fill={`url(#coat-${uid})`} />
        <path d="M28 40 L21 23 L39 30 Z" fill="#FFD9AE" />
        <path d="M96 46 L106 17 L74 28 Z" fill={`url(#coat-${uid})`} />
        <path d="M92 40 L99 23 L81 30 Z" fill="#FFD9AE" />

        {/* Crâne — un galet, pas un écusson. */}
        <path
          d="M60 24 C86 24 104 47 104 71 C104 98 86 118 60 118 C34 118 16 98 16 71 C16 47 34 24 60 24 Z"
          fill={`url(#coat-${uid})`}
        />
        {/* La même lumière que le reste de l'interface : elle vient d'en haut,
            légèrement en avant. Sans ce reflet, le crâne reste un aplat. */}
        <path
          d="M60 24 C86 24 104 47 104 71 C104 98 86 118 60 118 C34 118 16 98 16 71 C16 47 34 24 60 24 Z"
          fill={`url(#glow-${uid})`}
        />

        {/* Masque — il porte les yeux, le museau et la bouche. Assez large pour
            les contenir, assez étroit pour laisser voir le pelage tout autour :
            c'est cette couronne orange qui fait lire un renard. */}
        <path
          d="M60 45 C79 45 89 60 89 78 C89 98 76 112 60 112 C44 112 31 98 31 78 C31 60 41 45 60 45 Z"
          fill={`url(#mask-${uid})`}
        />
        {/* Ombre portée du crâne sur le masque : quelques pixels suffisent à
            faire passer l'un devant l'autre. */}
        <path
          d="M60 45 C79 45 89 60 89 78 C89 81 88.8 84 88.4 87 C88 68 76 52 60 52 C44 52 32 68 31.6 87 C31.2 84 31 81 31 78 C31 60 41 45 60 45 Z"
          fill="#B97F1E"
          opacity=".18"
        />

        <Eyes shape={spec.eyes} />
        <Brows shape={spec.brow} />

        {/* Museau — un triangle adouci, pointe vers la bouche. */}
        <path
          d="M53.6 77.6 H66.4 C67.8 77.6 68.6 79.2 67.7 80.3 L61.3 88.4 C60.6 89.2 59.4 89.2 58.7 88.4 L52.3 80.3 C51.4 79.2 52.2 77.6 53.6 77.6 Z"
          fill="#0B1B34"
        />
        <Mouth shape={spec.mouth} />

        {spec.blush && (
          <>
            <ellipse cx="35" cy="82" rx="7" ry="4.5" fill="#FB7185" opacity=".35" />
            <ellipse cx="85" cy="82" rx="7" ry="4.5" fill="#FB7185" opacity=".35" />
          </>
        )}
        {spec.sweat && (
          <path d="M96 44 C99 49 101 52 101 55 A5 5 0 0 1 91 55 C91 52 93 49 96 44 Z" fill="#8AAEFF" />
        )}

        <Accessories stage={s} />
      </g>

      {spec.sparkles && (
        <g fill="#FFBE1F">
          <path d="M14 24 l2.4 5 5 2.4 -5 2.4 -2.4 5 -2.4 -5 -5 -2.4 5 -2.4 z" opacity=".95" />
          <path d="M105 20 l1.8 3.7 3.7 1.8 -3.7 1.8 -1.8 3.7 -1.8 -3.7 -3.7 -1.8 3.7 -1.8 z" opacity=".85" />
          <path d="M100 100 l1.5 3 3 1.5 -3 1.5 -1.5 3 -1.5 -3 -3 -1.5 3 -1.5 z" opacity=".7" />
        </g>
      )}
      </g>
    </svg>
  );
}

function Eyes({ shape }: { shape: string }) {
  const L = 44;
  const R = 76;
  const y = 60;
  const dark = '#0B1B34';

  switch (shape) {
    case 'wide':
      return (
        <g>
          {[L, R].map((x) => (
            <g key={x}>
              <circle cx={x} cy={y} r="9" fill="#FFFFFF" />
              <circle cx={x} cy={y} r="5.5" fill={dark} />
              <circle cx={x + 2} cy={y - 2.5} r="1.8" fill="#FFFFFF" />
            </g>
          ))}
        </g>
      );
    case 'squint':
      return (
        <g stroke={dark} strokeWidth="4" strokeLinecap="round" fill="none">
          <path d={`M${L - 7} ${y + 1} q7 -5 14 0`} />
          <path d={`M${R - 7} ${y + 1} q7 -5 14 0`} />
        </g>
      );
    case 'arcUp':
      return (
        <g stroke={dark} strokeWidth="4.5" strokeLinecap="round" fill="none">
          <path d={`M${L - 8} ${y + 3} q8 -10 16 0`} />
          <path d={`M${R - 8} ${y + 3} q8 -10 16 0`} />
        </g>
      );
    case 'half':
      return (
        <g>
          {[L, R].map((x) => (
            <g key={x}>
              <circle cx={x} cy={y} r="6.5" fill={dark} />
              <path d={`M${x - 8} ${y - 4} h16`} stroke="#F5A507" strokeWidth="8" strokeLinecap="round" />
              <circle cx={x + 2} cy={y + 1} r="1.6" fill="#FFFFFF" />
            </g>
          ))}
        </g>
      );
    case 'droop':
      return (
        <g>
          {[L, R].map((x, i) => (
            <g key={x} transform={`rotate(${i === 0 ? 12 : -12} ${x} ${y})`}>
              <ellipse cx={x} cy={y} rx="6.5" ry="7.5" fill={dark} />
              <circle cx={x + 1.5} cy={y - 2.5} r="1.7" fill="#FFFFFF" />
            </g>
          ))}
        </g>
      );
    case 'sparkle':
      return (
        <g>
          {[L, R].map((x) => (
            <g key={x}>
              <circle cx={x} cy={y} r="7.5" fill={dark} />
              <path d={`M${x} ${y - 7} l1.6 4.4 4.4 1.6 -4.4 1.6 -1.6 4.4 -1.6 -4.4 -4.4 -1.6 4.4 -1.6 z`} fill="#FFFFFF" />
            </g>
          ))}
        </g>
      );
    default:
      return (
        <g>
          {[L, R].map((x) => (
            <g key={x}>
              <circle cx={x} cy={y} r="7" fill={dark} />
              <circle cx={x + 2} cy={y - 2.5} r="2" fill="#FFFFFF" />
            </g>
          ))}
        </g>
      );
  }
}

function Brows({ shape }: { shape: string }) {
  if (shape === 'none') return null;
  const stroke = { stroke: '#8A5A00', strokeWidth: 3.6, strokeLinecap: 'round' as const, fill: 'none' };
  switch (shape) {
    case 'raised':
      return (
        <g {...stroke}>
          <path d="M36 45 q8 -5 16 -1" />
          <path d="M68 44 q8 -4 16 1" />
        </g>
      );
    case 'lowered':
      return (
        <g {...stroke}>
          <path d="M36 46 q8 3 16 2" />
          <path d="M68 48 q8 -1 16 -2" />
        </g>
      );
    case 'sad':
      return (
        <g {...stroke}>
          <path d="M36 44 q8 3 15 6" />
          <path d="M69 50 q8 -3 15 -6" />
        </g>
      );
    case 'determined':
      return (
        <g {...stroke} strokeWidth={4}>
          <path d="M35 42 L52 49" />
          <path d="M85 42 L68 49" />
        </g>
      );
    case 'asym':
      return (
        <g {...stroke}>
          <path d="M36 41 q8 -3 16 1" />
          <path d="M68 48 q8 0 16 -1" />
        </g>
      );
    default:
      return null;
  }
}

function Mouth({ shape }: { shape: string }) {
  const dark = '#0B1B34';
  const line = { stroke: dark, strokeWidth: 3.2, strokeLinecap: 'round' as const, fill: 'none' };
  switch (shape) {
    case 'grin':
      return (
        <g>
          <path d="M46 92 q14 14 28 0 q-14 6 -28 0 z" fill={dark} />
          <path d="M50 94 q10 6 20 0" fill="#FB7185" opacity=".9" />
        </g>
      );
    case 'openSmile':
      return (
        <g>
          <path d="M45 91 q15 20 30 0 z" fill={dark} />
          <path d="M52 98 q8 8 16 0 z" fill="#FB7185" />
        </g>
      );
    case 'o':
      return <ellipse cx="60" cy="96" rx="6" ry="7.5" fill={dark} />;
    case 'flat':
      return <path d="M50 96 h20" {...line} />;
    case 'small':
      return <path d="M54 96 q6 3 12 0" {...line} />;
    case 'frown':
      return <path d="M50 98 q10 -8 20 0" {...line} />;
    case 'smirk':
      return <path d="M50 95 q11 7 20 -3" {...line} />;
    default:
      return (
        <g {...line}>
          <path d="M60 88.5 v4" />
          <path d="M47 93 q13 11 26 0" />
        </g>
      );
  }
}

/** Accessories unlocked by evolution stage. Stages are additive: each new level
 *  keeps what came before, so progression reads visually at a glance. */
function Accessories({ stage }: { stage: number }) {
  return (
    <g>
      {/* 2 — scarf */}
      {stage >= 2 && (
        <g>
          <path d="M34 100 C44 113 76 113 86 100 C83 117 37 117 34 100 Z" fill="#2F62F0" />
          <path d="M80 108 l10 14 -9 3 -6 -13 z" fill="#1C48D1" />
        </g>
      )}
      {/* 3 — glasses */}
      {stage >= 3 && (
        <g stroke="#0F2460" strokeWidth="2.6" fill="none" opacity=".92">
          <circle cx="44" cy="60" r="12.5" />
          <circle cx="76" cy="60" r="12.5" />
          <path d="M56.5 59 h7" />
          <path d="M31.5 58 l-10 -4M88.5 58 l10 -4" />
        </g>
      )}
      {/* 4 — collar pin */}
      {stage >= 4 && (
        <g>
          <circle cx="60" cy="115" r="6" fill="#FFD04D" stroke="#D07F02" strokeWidth="1.6" />
          <path d="M60 111.5 l1.3 2.6 2.9.4 -2.1 2 .5 2.9 -2.6 -1.4 -2.6 1.4 .5 -2.9 -2.1 -2 2.9 -.4 z" fill="#0F2460" />
        </g>
      )}
      {/* 5 — laurel arcs */}
      {stage >= 5 && (
        <g stroke="#10B981" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".9">
          <path d="M9 72 C3 92 10 106 25 114" />
          <path d="M111 72 C117 92 110 106 95 114" />
        </g>
      )}
      {/* 6 — crest */}
      {stage >= 6 && (
        <g>
          <path d="M42 26 L49 10 L60 19 L71 10 L78 26 Z" fill="#2F62F0" />
          <path d="M42 26 L78 26 L76 31 L44 31 Z" fill="#1638A6" />
          <circle cx="60" cy="17" r="3" fill="#FFD04D" />
        </g>
      )}
    </g>
  );
}

export type { Expression };
