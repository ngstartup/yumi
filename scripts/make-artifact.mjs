/**
 * Transforme la build mono-fichier (`dist-single/index.html`) en fragment HTML
 * publiable comme page hébergée : titre + styles inline + racine + script inline,
 * sans balises <html>/<head>/<body> (l'hôte fournit le squelette).
 */
import fs from 'node:fs';
import path from 'node:path';

const src = path.resolve('dist-single/index.html');
const outDir = path.resolve('artifact');
const out = path.join(outDir, 'yumi.html');

const html = fs.readFileSync(src, 'utf8');

const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)]
  .map((m) => m[1])
  .filter((s) => !s.includes('"@context"'));

if (styles.length === 0 || scripts.length === 0) {
  throw new Error('Build mono-fichier inattendue : styles ou script introuvables.');
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  out,
  `<title>Yumi</title>
<style>
${styles.join('\n')}
</style>
<div id="root"></div>
<script type="module">
${scripts.join('\n')}
</script>
`,
  'utf8'
);

const kb = (fs.statSync(out).size / 1024).toFixed(0);
console.log(`artifact/yumi.html écrit (${kb} Ko)`);
