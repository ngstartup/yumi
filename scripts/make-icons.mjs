/**
 * Génère l'identité visuelle exportée de Yumi à partir du renard de
 * `src/mascot/Fox.tsx` : icônes PWA, icône d'application mobile (y compris le
 * format adaptatif d'Android) et écran de lancement.
 *
 *   node scripts/make-icons.mjs
 *
 * La géométrie est recopiée du composant plutôt qu'importée : le rendu React
 * dépend de `useId` et d'un état d'expression, alors qu'une icône doit être un
 * fichier figé et déterministe. Toute retouche du museau se répercute ici en
 * modifiant `FOX` ci-dessous.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const BLUE = '#2F62F0';
const BLUE_LIGHT = '#4A78F5';
const INK = '#0B1B34';

/** Le renard, dans son repère d'origine : viewBox 0 0 120 130, expression
 *  « happy » (yeux en arc, sourire), stade 1. */
const FOX = `
<g transform="rotate(-2 60 70)">
  <path d="M19 50 L24 8 L54 34 Z" fill="url(#coat)"/>
  <path d="M26 41 L29 19 L42 34 Z" fill="#FFF1C6"/>
  <path d="M25 22 L29 19 L31 27 Z" fill="#0F2460" opacity=".85"/>
  <path d="M101 50 L96 8 L66 34 Z" fill="url(#coat)"/>
  <path d="M94 41 L91 19 L78 34 Z" fill="#FFF1C6"/>
  <path d="M95 22 L91 19 L89 27 Z" fill="#0F2460" opacity=".85"/>
  <path d="M60 118 C41 118 23 99 19 71 C15 44 36 28 60 28 C84 28 105 44 101 71 C97 99 79 118 60 118 Z" fill="url(#coat)"/>
  <path d="M19 70 C12 74 10 83 14 90 C17 84 19 79 20 75 Z" fill="#F5A507"/>
  <path d="M101 70 C108 74 110 83 106 90 C103 84 101 79 100 75 Z" fill="#F5A507"/>
  <path d="M60 28 C42 28 26 39 21 55 C31 39 44 32 60 32 Z" fill="url(#sheen)"/>
  <path d="M60 112 C45 112 36 101 36 89 C36 78 47 73 60 73 C73 73 84 78 84 89 C84 101 75 112 60 112 Z" fill="#FFFFFF"/>
  <path d="M60 32 C53 43 51 54 51 63 C55 61 65 61 69 63 C69 54 67 43 60 32 Z" fill="#FFF7DC" opacity=".7"/>
  <g stroke="${INK}" stroke-width="4.5" stroke-linecap="round" fill="none">
    <path d="M36 63 q8 -10 16 0"/>
    <path d="M68 63 q8 -10 16 0"/>
  </g>
  <path d="M60 78 C64.5 78 67 80.5 67 83 C67 86 63.5 88.5 60 88.5 C56.5 88.5 53 86 53 83 C53 80.5 55.5 78 60 78 Z" fill="${INK}"/>
  <g stroke="${INK}" stroke-width="3.2" stroke-linecap="round" fill="none">
    <path d="M60 88.5 v4"/>
    <path d="M47 93 q13 11 26 0"/>
  </g>
</g>`;

const GRADIENTS = `
<linearGradient id="coat" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="#FFD04D"/><stop offset="100%" stop-color="#F5A507"/>
</linearGradient>
<linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0%" stop-color="#FFFFFF" stop-opacity=".45"/>
  <stop offset="60%" stop-color="#FFFFFF" stop-opacity="0"/>
</linearGradient>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="${BLUE_LIGHT}"/><stop offset="100%" stop-color="${BLUE}"/>
</linearGradient>`;

/**
 * Place le renard dans un canevas carré.
 * @param size   côté du canevas
 * @param ratio  largeur occupée par le renard, en fraction du canevas
 */
function placeFox(size, ratio) {
  const w = size * ratio;
  const scale = w / 120;
  // Le dessin utile va de y=8 à y=118 : on centre ce contenu, pas la viewBox.
  const contentH = 110 * scale;
  const tx = (size - w) / 2;
  const ty = (size - contentH) / 2 - 8 * scale;
  return `<g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${scale.toFixed(4)})">${FOX}</g>`;
}

function svg(size, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
<defs>${GRADIENTS}</defs>
${body}
</svg>`;
}

/** Icône pleine : fond bleu Yumi, renard généreux. */
const iconSvg = (size) =>
  svg(size, `<rect width="${size}" height="${size}" fill="url(#sky)"/>${placeFox(size, 0.68)}`);

/** Android adaptatif : le premier plan doit tenir dans les 66 % centraux,
 *  le système pouvant le recadrer en cercle, en carré arrondi ou en goutte. */
const iconForegroundSvg = (size) => svg(size, placeFox(size, 0.55));
const iconBackgroundSvg = (size) => svg(size, `<rect width="${size}" height="${size}" fill="url(#sky)"/>`);

/** Écran de lancement : le renard seul, très aéré, sur le fond de l'app. */
const splashSvg = (size, bg) =>
  svg(size, `<rect width="${size}" height="${size}" fill="${bg}"/>${placeFox(size, 0.22)}`);

/** Image de partage (Open Graph), référencée par index.html. */
const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs>${GRADIENTS}</defs>
<rect width="1200" height="630" fill="url(#sky)"/>
<g transform="translate(120 92) scale(3.7)">${FOX}</g>
<g fill="#FFFFFF" font-family="Sora, Inter, Segoe UI, system-ui, sans-serif">
  <text x="620" y="272" font-size="92" font-weight="800" letter-spacing="-2">Yumi</text>
  <text x="620" y="342" font-size="38" font-weight="600" opacity=".92">Learn English.</text>
  <text x="620" y="392" font-size="38" font-weight="600" opacity=".92">Build your future.</text>
  <rect x="620" y="430" width="132" height="6" rx="3" fill="#FFBE1F"/>
  <text x="620" y="492" font-size="26" font-weight="500" opacity=".8">Parcours CECRL A1 → C2</text>
</g>
</svg>`;

const png = (source, size, out) =>
  sharp(Buffer.from(source)).resize(size, size).png().toFile(out);

async function main() {
  const assets = path.join(ROOT, 'assets');
  const pub = path.join(ROOT, 'public');
  await mkdir(assets, { recursive: true });
  await mkdir(pub, { recursive: true });

  // Sources pour @capacitor/assets (icônes et écrans de lancement natifs).
  await png(iconSvg(1024), 1024, path.join(assets, 'icon.png'));
  await png(iconForegroundSvg(1024), 1024, path.join(assets, 'icon-foreground.png'));
  await png(iconBackgroundSvg(1024), 1024, path.join(assets, 'icon-background.png'));
  await png(splashSvg(2732, '#FFFFFF'), 2732, path.join(assets, 'splash.png'));
  await png(splashSvg(2732, '#0B1B34'), 2732, path.join(assets, 'splash-dark.png'));

  // Web et PWA — les fichiers déclarés par manifest.webmanifest.
  await writeFile(path.join(pub, 'icon.svg'), iconSvg(512));
  await writeFile(path.join(pub, 'og-image.svg'), ogSvg);
  await png(iconSvg(1024), 192, path.join(pub, 'icon-192.png'));
  await png(iconSvg(1024), 512, path.join(pub, 'icon-512.png'));
  await png(iconSvg(1024), 180, path.join(pub, 'apple-touch-icon.png'));

  console.log('Icônes générées : assets/ (natif) et public/ (web, PWA).');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
