/**
 * Fabrique le paquet de mise à jour à distance et son manifeste.
 *
 *   node scripts/make-bundle.mjs
 *
 * Produit dans `release/` :
 *   yumi-<version>.zip  le contenu de dist/ — index.html à la racine du zip,
 *                       c'est la structure attendue par le moteur de mise à jour
 *   latest.json         le manifeste que l'application interroge
 *
 * Le manifeste porte l'empreinte SHA-256 du zip : un téléchargement tronqué ou
 * altéré est rejeté par l'application au lieu d'être installé.
 *
 * Variables d'environnement :
 *   YUMI_BUNDLE_URL  URL publique du zip, écrite dans le manifeste
 *   YUMI_MIN_NATIVE  version d'APK minimale requise par ce paquet
 *   YUMI_NOTES       résumé affiché à l'apprenant
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const OUT = path.join(ROOT, 'release');

const pkg = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const version = pkg.version;

if (!existsSync(path.join(DIST, 'index.html'))) {
  console.error("dist/index.html est absent — lancez `npm run build` d'abord.");
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });
const zipPath = path.join(OUT, `yumi-${version}.zip`);
rmSync(zipPath, { force: true });

// `-r . ` depuis dist/ : les chemins dans l'archive sont relatifs à dist, donc
// index.html se retrouve à la racine du zip. Un niveau de dossier en trop et
// l'application ne trouverait rien à charger.
execFileSync('zip', ['-r', '-q', '-X', zipPath, '.'], { cwd: DIST });

const zip = readFileSync(zipPath);
const checksum = createHash('sha256').update(zip).digest('hex');

const manifest = {
  version,
  url: process.env.YUMI_BUNDLE_URL || `./yumi-${version}.zip`,
  checksum,
  size: zip.length,
  releasedAt: new Date().toISOString(),
  ...(process.env.YUMI_MIN_NATIVE ? { minNative: process.env.YUMI_MIN_NATIVE } : {}),
  ...(process.env.YUMI_NOTES ? { notes: process.env.YUMI_NOTES } : {}),
};

writeFileSync(path.join(OUT, 'latest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Paquet   : release/yumi-${version}.zip (${(zip.length / 1024).toFixed(0)} Ko)`);
console.log(`Empreinte: ${checksum}`);
console.log(`Manifeste: release/latest.json`);
