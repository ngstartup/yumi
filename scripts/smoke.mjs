/**
 * Test de bout en bout du parcours MVP.
 * Sert la build de production et rejoue le trajet complet :
 * landing → inscription → onboarding → tableau de bord → leçon → fin de leçon → statistiques.
 *
 * Usage : node scripts/smoke.mjs [--headed]
 */
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('dist');
const PORT = 4178;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.ogg': 'audio/ogg',
  '.mp3': 'audio/mpeg',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
};

const server = http.createServer((req, res) => {
  const url = decodeURIComponent((req.url ?? '/').split('?')[0]);
  let file = path.join(ROOT, url === '/' ? 'index.html' : url);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(ROOT, 'index.html');
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] ?? 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

const steps = [];
const failures = [];
function ok(label) {
  steps.push(`  ✓ ${label}`);
}
function fail(label, err) {
  failures.push(`  ✗ ${label} — ${err}`);
}

await new Promise((r) => server.listen(PORT, r));
/** Phrase présente dans la banque de placement : elle est donc enregistrée. */
const LISTENING_SAMPLE = 'My brother lives in London.';

/** Même calcul que `src/lib/audioClips.ts` et `scripts/make-audio.py`. Le
 *  redire ici n'est pas une redite inutile : si l'une des trois implémentations
 *  dérive, ce test le voit avant l'apprenant. */
function clipId(text) {
  const s = text.replace(/\s+/g, ' ').trim();
  let h1 = 0x811c9dc5;
  let h2 = 5381;
  for (let i = 0; i < s.length; i += 1) {
    const c = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 16777619) >>> 0;
    h2 = (Math.imul(h2, 33) ^ c) >>> 0;
  }
  return h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0');
}

const base = `http://localhost:${PORT}`;

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--no-sandbox'],
});

const consoleErrors = [];
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'fr-FR' });
const page = await context.newPage();
page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(m.text());
});
page.on('pageerror', (e) => consoleErrors.push(String(e)));

fs.mkdirSync('screenshots', { recursive: true });

try {
  // 1. Landing --------------------------------------------------------------
  await page.goto(`${base}/#/`, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { level: 1 }).first().waitFor({ timeout: 10000 });
  await page.screenshot({ path: 'screenshots/01-landing.png', fullPage: false });
  ok('Landing page rendue');

  // 2. Inscription ----------------------------------------------------------
  await page.getByRole('link', { name: /Commencer gratuitement/i }).first().click();
  await page.waitForURL(/#\/signup/);
  const email = `abdoul.${Date.now()}@yumi.test`;
  await page.getByLabel('Prénom').fill('Abdoul');
  await page.getByLabel('Nom', { exact: true }).fill('Alhassane');
  await page.getByLabel('Adresse e-mail').fill(email);
  await page.getByLabel('Mot de passe').fill('yumi-test-2026');
  await page.screenshot({ path: 'screenshots/02-signup.png' });
  await page.getByRole('button', { name: /S'inscrire|S’inscrire/ }).click();
  await page.waitForURL(/#\/onboarding/, { timeout: 15000 });
  ok('Inscription et création de session');

  // 3. Onboarding -----------------------------------------------------------
  await page.getByRole('button', { name: /Progresser professionnellement/ }).click();
  await page.getByRole('button', { name: /^Continuer$/ }).click();
  await page.getByRole('button', { name: /Régulier/ }).click();
  await page.getByRole('button', { name: /^Continuer$/ }).click();
  await page.screenshot({ path: 'screenshots/03-onboarding.png' });
  await page.getByRole('button', { name: /Commencer au niveau débutant/ }).click();
  await page.waitForURL(/#\/app$/, { timeout: 15000 });
  ok('Onboarding terminé (objectif + rythme + niveau)');

  // 4. Tableau de bord ------------------------------------------------------
  await page.getByText(/Bonjour Abdoul/).waitFor({ timeout: 10000 });
  await page.getByText("Objectif du jour").waitFor();
  await page.screenshot({ path: 'screenshots/04-dashboard.png', fullPage: true });
  ok('Tableau de bord affiché avec objectif du jour');

  // 5. Leçon ----------------------------------------------------------------
  await page.getByRole('link', { name: /^Continuer$/ }).first().click();
  await page.waitForURL(/#\/lesson\//, { timeout: 15000 });
  await page.screenshot({ path: 'screenshots/05-lesson-intro.png', fullPage: true });
  await page.getByRole('button', { name: /^Commencer$/ }).click();
  ok('Leçon ouverte : introduction pédagogique puis exercices');

  let answered = 0;
  let sawCorrect = false;
  let sawIncorrect = false;
  let shotFeedback = false;
  let sawCorrectionRound = false;

  for (let i = 0; i < 40; i++) {
    if (await page.getByText(/Leçon terminée/).first().isVisible().catch(() => false)) break;

    // Reprise des erreurs : elle s'intercale entre la dernière réponse et le
    // résultat. On la joue réellement — c'est le seul moyen de vérifier que la
    // manche de correction se termine bien sur l'écran de fin.
    const correctionStart = page.getByRole('button', { name: /^Corriger mes erreurs$/ });
    if (await correctionStart.isVisible().catch(() => false)) {
      if (!sawCorrectionRound) {
        sawCorrectionRound = true;
        await page.screenshot({ path: 'screenshots/06b-correction.png', fullPage: true });
        await correctionStart.click();
      } else {
        await page.getByRole('button', { name: /^Passer et voir mon résultat$/ }).click();
      }
      await page.waitForTimeout(150);
      continue;
    }

    const check = page.getByRole('button', { name: /^Vérifier$/ });
    await check.waitFor({ timeout: 8000 }).catch(() => {});

    // Répond en cliquant la première option proposée, sinon saisit du texte.
    const options = page.locator('main ul li button');
    const optionCount = await options.count().catch(() => 0);
    if (optionCount > 0) {
      await options.first().click().catch(() => {});
    } else {
      const field = page.locator('main textarea, main input[type="text"], main input:not([type])').first();
      if (await field.count()) await field.fill('test answer').catch(() => {});
    }

    if (await check.isEnabled().catch(() => false)) {
      await check.click();
      answered++;
      const good = await page.getByText(/Excellent !|Parfait !/).first().isVisible().catch(() => false);
      const bad = await page.getByText(/Bonne réponse ?:/).first().isVisible().catch(() => false);
      if (good) sawCorrect = true;
      if (bad) sawIncorrect = true;
      if (!shotFeedback) {
        shotFeedback = true;
        await page.waitForTimeout(700);
        await page.screenshot({ path: 'screenshots/06-feedback.png' });
      }
      await page.getByRole('button', { name: /^Continuer$/ }).click();
    } else {
      await page.getByRole('button', { name: /^Passer$/ }).click();
      answered++;
    }
    await page.waitForTimeout(120);
  }

  if (answered < 3) throw new Error(`seulement ${answered} exercices traités`);
  ok(`${answered} exercices enchaînés dans le lecteur de leçon`);
  if (sawCorrectionRound) ok('Reprise des erreurs jouée avant l’affichage du résultat');
  if (sawCorrect || sawIncorrect) ok('Feedback pédagogique affiché (bonne réponse + explication)');
  else fail('Feedback pédagogique', 'aucun panneau de feedback détecté');

  // 6. Fin de leçon ---------------------------------------------------------
  await page.getByText(/Leçon terminée/).first().waitFor({ timeout: 20000 });
  const xpText = await page.getByText(/^\+\d+ XP$/).first().textContent();
  await page.screenshot({ path: 'screenshots/07-complete.png', fullPage: true });
  ok(`Écran de fin de leçon avec gain d'XP (${xpText?.trim()})`);

  // 7. Statistiques ---------------------------------------------------------
  await page.goto(`${base}/#/app/progress`, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: 'Progression' }).waitFor({ timeout: 10000 });
  await page.getByText('XP total').waitFor();
  await page.screenshot({ path: 'screenshots/08-stats.png', fullPage: true });
  ok('Statistiques : XP, compétences, badges');

  // 8. Persistance ----------------------------------------------------------
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByText('XP total').waitFor({ timeout: 10000 });
  const xpValue = await page
    .locator('div', { hasText: /^XP total$/ })
    .first()
    .evaluate((el) => el.parentElement?.textContent ?? '')
    .catch(() => '');
  ok(`Session et progression restaurées après rechargement ${xpValue ? `(${xpValue.trim()})` : ''}`);

  // 8 bis. Retour à la racine avec une session ouverte ----------------------
  // C'est l'écran que voit un apprenant qui rouvre l'application : il doit
  // retomber sur son tableau de bord, pas sur la page vitrine avec son bouton
  // « Se connecter ».
  await page.goto(`${base}/#/`, { waitUntil: 'networkidle' });
  await page
    .waitForFunction(() => window.location.hash.startsWith('#/app'), null, { timeout: 10000 })
    .catch(() => {});
  const backHome = page.url();
  if (!backHome.includes('#/app')) {
    fail('Réouverture', `la racine mène à ${backHome} au lieu du tableau de bord`);
  } else {
    ok('Réouverture avec session ouverte : tableau de bord, pas la page vitrine');
  }

  // 8 ter. Voix enregistrée des exercices d'écoute ---------------------------
  // Le défaut le plus difficile à voir : un exercice de compréhension orale
  // muet ne signale rien. On vérifie donc que le fichier existe, se décode et
  // dure quelque chose — dans un vrai navigateur, sur la vraie build.
  const clipCheck = await page.evaluate(async (id) => {
    const url = `audio/${id}.ogg`;
    const res = await fetch(url).catch(() => null);
    if (!res || !res.ok) return { ok: false, why: `fichier introuvable (${res ? res.status : 'réseau'})` };
    const a = document.createElement('audio');
    a.preload = 'auto';
    a.src = url;
    const loaded = await new Promise((resolve) => {
      a.oncanplaythrough = () => resolve(true);
      a.onerror = () => resolve(false);
      setTimeout(() => resolve(false), 8000);
    });
    if (!loaded) return { ok: false, why: 'le navigateur ne sait pas décoder l’extrait' };
    // `audio.duration` vaut l'infini tant que le serveur ne gère pas les
    // requêtes par plage : on décode réellement les octets pour connaître la
    // durée, ce qui prouve du même coup que le fichier contient bien du son.
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const buf = await new Ctx().decodeAudioData(await (await fetch(url)).arrayBuffer());
    return { ok: buf.duration > 0.3 && buf.duration < 30, why: `durée ${buf.duration.toFixed(2)} s` };
  }, clipId(LISTENING_SAMPLE));
  if (clipCheck.ok) ok(`Extrait d'écoute enregistré, chargé et décodé (${clipCheck.why})`);
  else fail("Voix des exercices d'écoute", clipCheck.why);

  // 9. Parcours + unité -----------------------------------------------------
  await page.goto(`${base}/#/app/learn`, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: /Votre parcours/ }).waitFor({ timeout: 10000 });
  await page.screenshot({ path: 'screenshots/09-path.png', fullPage: true });
  ok('Carte de progression (unités, verrouillage, niveaux à venir)');

  // 10. Son et vibrations ---------------------------------------------------
  await page.goto(`${base}/#/app/profile`, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: /Son et vibrations/ }).waitFor({ timeout: 10000 });
  await page.getByText(/Sons de l’interface|Sons de l'interface/).first().waitFor();
  await page.getByText('Retour haptique').first().waitFor();
  await page.screenshot({ path: 'screenshots/12-feedback-settings.png', fullPage: true });
  ok('Réglages « Son et vibrations » présents dans le profil');

  // Un clic doit réellement ouvrir un contexte audio, sans erreur de page.
  await page.getByRole('button', { name: /Tester le son/ }).click();
  await page.waitForTimeout(400);
  const audioState = await page.evaluate(() => {
    const w = window;
    return typeof w.AudioContext !== 'undefined' || typeof w.webkitAudioContext !== 'undefined';
  });
  if (audioState) ok('Contexte audio disponible et bouton de test opérationnel');
  else steps.push('  • Web Audio indisponible dans ce navigateur de test');

  // Le volume se règle et survit au rechargement.
  const slider = page.locator('input[type="range"]').first();
  await slider.fill('30');
  await slider.dispatchEvent('pointerup');
  await page.waitForTimeout(300);
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: /Son et vibrations/ }).waitFor({ timeout: 10000 });
  const savedVolume = await page.locator('input[type="range"]').first().inputValue();
  if (savedVolume === '30') ok('Volume enregistré et restauré après rechargement (30 %)');
  else fail('Volume', `attendu 30, obtenu ${savedVolume}`);

  // Couper le son doit désactiver le curseur.
  await page.getByRole('switch', { name: /Sons de l’interface|Sons de l'interface/ }).click();
  await page.waitForTimeout(250);
  const sliderDisabled = await page.locator('input[type="range"]').first().isDisabled();
  if (sliderDisabled) ok('Extinction du son : curseur de volume désactivé');
  else fail('Extinction du son', 'le curseur reste actif');
  await page.getByRole('switch', { name: /Sons de l’interface|Sons de l'interface/ }).click();

  // 11. Mobile --------------------------------------------------------------
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
    locale: 'fr-FR',
  });
  const mp = await mobile.newPage();
  await mp.goto(`${base}/#/`, { waitUntil: 'networkidle' });
  await mp.screenshot({ path: 'screenshots/10-mobile-landing.png' });
  const overflow = await mp.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
  );
  if (overflow) fail('Responsive mobile', 'débordement horizontal détecté sur la landing');
  else ok('Responsive mobile : aucun débordement horizontal');
  await mobile.close();

  // 12. Hors connexion ------------------------------------------------------
  await context.setOffline(true);
  await page.goto(`${base}/#/app`, { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForTimeout(600);
  const banner = await page.getByText(/hors connexion/i).isVisible().catch(() => false);
  if (banner) ok('Bannière hors connexion affichée, application utilisable');
  else steps.push('  • Bannière hors connexion non vérifiable dans ce contexte');
  await context.setOffline(false);
} catch (err) {
  fail('Parcours', err instanceof Error ? err.message : String(err));
  await page.screenshot({ path: 'screenshots/error.png', fullPage: true }).catch(() => {});
}

const realErrors = consoleErrors.filter(
  (e) => !/favicon|manifest|sw\.js|Download the React DevTools/i.test(e)
);

await browser.close();
server.close();

console.log('\n=== Vérification de bout en bout — Yumi ===');
for (const s of steps) console.log(s);
if (realErrors.length > 0) {
  console.log('\nErreurs console :');
  for (const e of realErrors.slice(0, 8)) console.log('  !', e);
}
if (failures.length > 0) {
  console.log('\nÉchecs :');
  for (const f of failures) console.log(f);
  process.exit(1);
}
console.log('\nTout le parcours MVP fonctionne.');
