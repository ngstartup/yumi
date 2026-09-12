/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Yumi brand — bleu / blanc / jaune
        ink: {
          DEFAULT: '#0B1B34',
          soft: '#33456A',
          muted: '#6B7A99',
        },
        blue: {
          50: '#EEF4FF',
          100: '#D9E6FF',
          200: '#B7CEFF',
          300: '#8AAEFF',
          400: '#5A87FA',
          500: '#2F62F0',
          600: '#1C48D1',
          700: '#1638A6',
          800: '#132D80',
          900: '#0F2460',
        },
        sun: {
          50: '#FFFAEB',
          100: '#FFF1C6',
          200: '#FFE18A',
          300: '#FFD04D',
          400: '#FFBE1F',
          500: '#F5A507',
          600: '#D07F02',
          700: '#A55C06',
          800: '#87480C',
          900: '#733C10',
        },
        mint: { 400: '#34D399', 500: '#10B981', 600: '#059669' },
        coral: { 400: '#FB7185', 500: '#F43F5E', 600: '#E11D48' },
        surface: {
          DEFAULT: '#FFFFFF',
          alt: '#F6F8FC',
          sunk: '#EDF1F9',
        },
      },
      fontFamily: {
        sans: ['Inter var', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: { xl2: '1.25rem', xl3: '1.75rem' },
      /* Élévation — une seule source de lumière, en haut et légèrement en
         avant. Toutes les ombres descendent donc, et s'élargissent avec la
         hauteur. Elles sont teintées d'encre Yumi plutôt que de noir : du noir
         sur un fond bleuté donne une ombre sale. Deux couches par niveau — un
         contact net, une ambiance large — et jamais plus, pour que le
         défilement reste fluide sur un téléphone modeste.
         `card` et `lift` gardent leur nom : tous les écrans qui les utilisaient
         montent d'un cran sans changer d'une ligne. */
      boxShadow: {
        e1: '0 1px 2px rgba(11,27,52,.06), 0 2px 6px -2px rgba(11,27,52,.10)',
        e2: '0 1px 2px rgba(11,27,52,.05), 0 10px 24px -12px rgba(11,27,52,.22)',
        e3: '0 2px 4px rgba(11,27,52,.06), 0 22px 44px -20px rgba(11,27,52,.34)',
        card: '0 1px 2px rgba(11,27,52,.05), 0 10px 24px -12px rgba(11,27,52,.22), inset 0 1px 0 rgba(255,255,255,.9)',
        lift: '0 2px 4px rgba(11,27,52,.06), 0 22px 44px -20px rgba(11,27,52,.34), inset 0 1px 0 rgba(255,255,255,.9)',
        /* Biseau : un filet de lumière sur l'arête haute d'une surface claire. */
        bevel: 'inset 0 1px 0 rgba(255,255,255,.9)',
        /* Creux : l'inverse. Tout ce qui se remplit est creusé — pistes de
           progression, champs de saisie, cases verrouillées. */
        groove: 'inset 0 1px 2px rgba(11,27,52,.12), inset 0 -1px 0 rgba(255,255,255,.7)',
        press: 'inset 0 -3px 0 rgba(11,27,52,.14)',
      },
      keyframes: {
        pop: { '0%': { transform: 'scale(.85)', opacity: '0' }, '60%': { transform: 'scale(1.04)' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        shake: { '0%,100%': { transform: 'translateX(0)' }, '20%': { transform: 'translateX(-6px)' }, '40%': { transform: 'translateX(6px)' }, '60%': { transform: 'translateX(-4px)' }, '80%': { transform: 'translateX(4px)' } },
        riseIn: { '0%': { transform: 'translateY(12px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        xpFly: { '0%': { transform: 'translateY(0) scale(1)', opacity: '1' }, '100%': { transform: 'translateY(-46px) scale(1.25)', opacity: '0' } },
        shimmer: { '0%': { backgroundPosition: '-460px 0' }, '100%': { backgroundPosition: '460px 0' } },
        breathe: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-4px)' } },
      },
      animation: {
        pop: 'pop .28s cubic-bezier(.22,1,.36,1) both',
        floaty: 'floaty 4s ease-in-out infinite',
        shake: 'shake .4s ease-in-out',
        riseIn: 'riseIn .32s cubic-bezier(.22,1,.36,1) both',
        xpFly: 'xpFly .9s ease-out forwards',
        shimmer: 'shimmer 1.4s linear infinite',
        breathe: 'breathe 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
