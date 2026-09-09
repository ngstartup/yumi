/**
 * Énumère tout ce que Yumi peut avoir à prononcer.
 *
 * Les exercices sont générés à l'exécution : aucun texte audio n'est écrit
 * quelque part sous forme de liste. Mais tout ce que le moteur peut donner à
 * lire vient d'un champ anglais du contenu (`item.en`, `example.en`,
 * `reference.en`, `line.en`) ou de la banque de placement. Ce script en fait
 * l'inventaire, et `make-audio.py` l'enregistre voix par voix.
 *
 * Utilisation : npx esbuild scripts/collect-audio-strings.ts --bundle
 *   --platform=node --format=cjs --alias:@=./src --outfile=/tmp/c.cjs && node /tmp/c.cjs
 */

import { allLessons } from '@/content';
import { PLACEMENT_BANK } from '@/content/placement';

const out = new Set<string>();
const add = (s?: string) => {
  const t = (s ?? '').replace(/\s+/g, ' ').trim();
  if (t) out.add(t);
};

for (const lesson of allLessons()) {
  for (const item of lesson.items) {
    if (item.kind === 'vocab') {
      add(item.en);
      add(item.example?.en);
    } else if (item.kind === 'sentence') {
      add(item.en);
    } else if (item.kind === 'grammar') {
      add(item.reference.en);
    } else if (item.kind === 'dialogue') {
      for (const line of item.lines) add(line.en);
    }
  }
}
for (const q of PLACEMENT_BANK) add(q.audio);

process.stdout.write(JSON.stringify([...out].sort()));
