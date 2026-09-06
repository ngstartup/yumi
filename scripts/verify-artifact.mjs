/** Vérifie que le fragment publiable démarre bien une fois enveloppé
 *  dans le squelette minimal utilisé par l'hébergeur. */
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';

const fragment = fs.readFileSync('artifact/yumi.html', 'utf8');
const page = `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>:root{color-scheme:light}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style>
</head><body>${fragment}</body></html>`;

const server = http.createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(page);
});
await new Promise((r) => server.listen(4180, r));

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'fr-FR' });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(String(e)));
p.on('console', (m) => {
  if (m.type() === 'error' && !/TUNNEL|net::/i.test(m.text())) errors.push(m.text());
});

await p.goto('http://localhost:4180/', { waitUntil: 'networkidle' });
await p.getByRole('heading', { level: 1 }).first().waitFor({ timeout: 10000 });
const title = await p.getByRole('heading', { level: 1 }).first().textContent();

// Navigation interne (HashRouter) dans le contexte hébergé
await p.getByRole('link', { name: /Commencer gratuitement/i }).first().click();
await p.getByLabel('Prénom').waitFor({ timeout: 8000 });
await p.screenshot({ path: 'screenshots/11-artifact.png' });

// Le stockage local doit être disponible sur l'origine hébergée
const storage = await p.evaluate(() => {
  try {
    localStorage.setItem('yumi.probe', '1');
    localStorage.removeItem('yumi.probe');
    return 'ok';
  } catch {
    return 'bloqué';
  }
});

await browser.close();
server.close();

console.log(`Fragment publiable : démarre correctement (titre « ${title?.trim().slice(0, 40)}… »)`);
console.log(`Stockage local : ${storage}`);
if (errors.length > 0) {
  console.log('Erreurs :');
  errors.slice(0, 5).forEach((e) => console.log('  !', e));
  process.exit(1);
}
