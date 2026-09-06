import type {
  DialogueItem,
  GrammarItem,
  Lesson,
  ReadingItem,
  SentenceItem,
  VocabItem,
} from '@/content/types';
import { hashString, makeRng, sample, shuffle, type Rng } from '@/lib/random';
import { tokenizeWords } from '@/lib/text';
import type { Exercise } from './types';

/**
 * Moteur de génération d'exercices.
 *
 * À partir des items structurés d'une leçon (vocabulaire, phrases modèles,
 * points de grammaire, textes, dialogues), il produit toutes les variantes
 * d'exercices pédagogiquement valides. Les distracteurs sont toujours tirés du
 * même champ lexical, ce qui évite les propositions absurdes.
 */

interface GenContext {
  lesson: Lesson;
  vocab: VocabItem[];
  sentences: SentenceItem[];
  rng: Rng;
}

export function generateExercises(lesson: Lesson, seed?: number): Exercise[] {
  const rng = makeRng(seed ?? hashString(lesson.id));
  const vocab = lesson.items.filter((i): i is VocabItem => i.kind === 'vocab');
  const sentences = lesson.items.filter((i): i is SentenceItem => i.kind === 'sentence');
  const ctx: GenContext = { lesson, vocab, sentences, rng };

  const out: Exercise[] = [];

  for (const item of lesson.items) {
    switch (item.kind) {
      case 'vocab':
        out.push(...fromVocab(item, ctx));
        break;
      case 'sentence':
        out.push(...fromSentence(item, ctx));
        break;
      case 'grammar':
        out.push(...fromGrammar(item, ctx));
        break;
      case 'reading':
        out.push(...fromReading(item, ctx));
        break;
      case 'dialogue':
        out.push(...fromDialogue(item, ctx));
        break;
    }
  }

  if (vocab.length >= 4) out.push(makeMatch(vocab, ctx));

  return out;
}

// ---------------------------------------------------------------------------
// Vocabulaire
// ---------------------------------------------------------------------------

function fromVocab(item: VocabItem, ctx: GenContext): Exercise[] {
  const others = ctx.vocab.filter((v) => v.id !== item.id);
  const out: Exercise[] = [];

  const frDistractors = sample(others.map((o) => o.fr), 3, ctx.rng);
  if (frDistractors.length === 3) {
    const options = shuffle([item.fr, ...frDistractors], ctx.rng);
    out.push({
      id: `${item.id}-mcq-en-fr`,
      type: 'mcq',
      itemId: item.id,
      conceptId: item.id,
      skill: 'vocabulary',
      difficulty: item.difficulty,
      instruction: 'Que signifie ce mot ?',
      prompt: item.en,
      subPrompt: item.pos ? posLabel(item.pos) : undefined,
      options,
      answer: options.indexOf(item.fr),
      explanation: `« ${item.en} » se traduit par « ${item.fr} ».`,
      audio: item.en,
    });
  }

  const enDistractors = sample(others.map((o) => o.en), 3, ctx.rng);
  if (enDistractors.length === 3) {
    const options = shuffle([item.en, ...enDistractors], ctx.rng);
    out.push({
      id: `${item.id}-mcq-fr-en`,
      type: 'mcq',
      itemId: item.id,
      conceptId: item.id,
      skill: 'vocabulary',
      difficulty: item.difficulty,
      instruction: 'Comment dit-on en anglais ?',
      prompt: item.fr,
      options,
      answer: options.indexOf(item.en),
      explanation: `« ${item.fr} » se dit « ${item.en} ».`,
    });

    out.push({
      id: `${item.id}-listen`,
      type: 'listenChoose',
      itemId: item.id,
      conceptId: item.id,
      skill: 'listening',
      difficulty: bump(item.difficulty),
      instruction: 'Écoutez, puis choisissez la traduction.',
      prompt: '',
      options: shuffle([item.fr, ...sample(others.map((o) => o.fr), 3, ctx.rng)], ctx.rng),
      answer: -1, // corrigé juste après
      explanation: `Vous avez entendu « ${item.en} » — « ${item.fr} ».`,
      audio: item.example?.en ?? item.en,
    });
    const last = out[out.length - 1];
    if (last.type === 'listenChoose') last.answer = last.options.indexOf(item.fr);
  }

  if (item.example) {
    const { before, after, found } = splitAround(item.example.en, item.en);
    if (found) {
      out.push({
        id: `${item.id}-fill`,
        type: 'fillBlank',
        itemId: item.id,
        conceptId: item.id,
        skill: 'vocabulary',
        difficulty: bump(item.difficulty),
        instruction: 'Complétez la phrase.',
        before,
        after,
        accepted: [item.en],
        hint: item.example.fr,
        explanation: `La phrase complète est : « ${item.example.en} » — ${item.example.fr}`,
        audio: item.example.en,
      });
    }
  }

  return out;
}

function makeMatch(vocab: VocabItem[], ctx: GenContext): Exercise {
  const picked = sample(vocab, 4, ctx.rng);
  return {
    id: `${ctx.lesson.id}-match`,
    type: 'match',
    itemId: picked.map((p) => p.id).join('+'),
    conceptId: `${ctx.lesson.id}-lexicon`,
    skill: 'vocabulary',
    difficulty: ctx.lesson.difficulty,
    instruction: 'Associez chaque mot à sa traduction.',
    pairs: picked.map((p) => ({ left: p.en, right: p.fr })),
    explanation: 'Chaque mot anglais correspond à une seule traduction française.',
  };
}

// ---------------------------------------------------------------------------
// Phrases modèles
// ---------------------------------------------------------------------------

function fromSentence(item: SentenceItem, ctx: GenContext): Exercise[] {
  const tokens = tokenizeWords(item.en);
  const out: Exercise[] = [];

  out.push({
    id: `${item.id}-tr-fr-en`,
    type: 'translate',
    itemId: item.id,
    conceptId: item.id,
    skill: 'writing',
    difficulty: item.difficulty,
    direction: 'fr-en',
    instruction: 'Traduisez en anglais.',
    source: item.fr,
    accepted: [item.en],
    explanation: item.note ?? `Traduction attendue : « ${item.en} ».`,
    audio: item.en,
  });

  if (tokens.length >= 3 && tokens.length <= 10) {
    out.push({
      id: `${item.id}-order`,
      type: 'wordOrder',
      itemId: item.id,
      conceptId: item.id,
      skill: 'grammar',
      difficulty: item.difficulty,
      instruction: 'Remettez les mots dans le bon ordre.',
      prompt: item.fr,
      tokens: shuffle(tokens, ctx.rng),
      answer: item.en,
      explanation: `Ordre correct : « ${item.en} ».`,
      audio: item.en,
    });
  }

  out.push({
    id: `${item.id}-dict`,
    type: 'dictation',
    itemId: item.id,
    conceptId: item.id,
    skill: 'listening',
    difficulty: bump(item.difficulty),
    instruction: 'Écoutez, puis écrivez ce que vous entendez.',
    accepted: [item.en],
    explanation: `Vous avez entendu : « ${item.en} » — ${item.fr}`,
    audio: item.en,
  });

  out.push({
    id: `${item.id}-speak`,
    type: 'speak',
    itemId: item.id,
    conceptId: item.id,
    skill: 'speaking',
    difficulty: item.difficulty,
    instruction: 'Prononcez cette phrase.',
    text: item.en,
    translation: item.fr,
    explanation: `Phrase cible : « ${item.en} ».`,
    audio: item.en,
  });

  return out;
}

// ---------------------------------------------------------------------------
// Grammaire
// ---------------------------------------------------------------------------

function fromGrammar(item: GrammarItem, ctx: GenContext): Exercise[] {
  const out: Exercise[] = [];
  const wrongs = sample(item.wrong, 3, ctx.rng);
  const options = shuffle([item.reference.en, ...wrongs], ctx.rng);

  out.push({
    id: `${item.id}-correct`,
    type: 'mcq',
    itemId: item.id,
    conceptId: item.topicId,
    skill: 'grammar',
    difficulty: item.difficulty,
    instruction: 'Choisissez la phrase correcte.',
    prompt: item.reference.fr,
    options,
    answer: options.indexOf(item.reference.en),
    explanation: item.rule,
    audio: item.reference.en,
  });

  // « Repérez l'erreur » : deux phrases correctes de la leçon + une fautive.
  const correctPool = ctx.sentences.map((s) => s.en).filter((s) => s !== item.reference.en);
  if (correctPool.length >= 2 && item.wrong.length > 0) {
    const decoys = sample(correctPool, 2, ctx.rng);
    const faulty = item.wrong[0];
    const opts = shuffle([faulty, ...decoys], ctx.rng);
    out.push({
      id: `${item.id}-error`,
      type: 'findError',
      itemId: item.id,
      conceptId: item.topicId,
      skill: 'grammar',
      difficulty: bump(item.difficulty),
      instruction: 'Repérez la phrase incorrecte.',
      prompt: '',
      options: opts,
      answer: opts.indexOf(faulty),
      explanation: `${item.rule} Forme correcte : « ${item.reference.en} ».`,
    });
  }

  if (item.blank) {
    const { before, after, found } = splitAround(item.reference.en, item.blank);
    if (found) {
      const choices = shuffle(
        [item.blank, ...sample(alternativeForms(item), 3, ctx.rng)],
        ctx.rng
      );
      out.push({
        id: `${item.id}-fill`,
        type: 'fillBlank',
        itemId: item.id,
        conceptId: item.topicId,
        skill: 'grammar',
        difficulty: item.difficulty,
        instruction: 'Complétez la phrase.',
        before,
        after,
        accepted: [item.blank],
        choices: choices.length >= 3 ? choices : undefined,
        hint: item.reference.fr,
        explanation: item.rule,
        audio: item.reference.en,
      });
    }
  }

  out.push({
    id: `${item.id}-tr`,
    type: 'translate',
    itemId: item.id,
    conceptId: item.topicId,
    skill: 'writing',
    difficulty: bump(item.difficulty),
    direction: 'fr-en',
    instruction: 'Traduisez en anglais.',
    source: item.reference.fr,
    accepted: [item.reference.en],
    explanation: item.rule,
    audio: item.reference.en,
  });

  return out;
}

/** Formes fautives réduites au mot qui change — sert de distracteurs de trou. */
function alternativeForms(item: GrammarItem): string[] {
  if (!item.blank) return [];
  const refTokens = tokenizeWords(item.reference.en);
  const idx = refTokens.findIndex((t) => normalizeToken(t) === normalizeToken(item.blank!.split(' ')[0]));
  const out = new Set<string>();
  for (const w of item.wrong) {
    const wTokens = tokenizeWords(w);
    if (idx >= 0 && wTokens[idx] && normalizeToken(wTokens[idx]) !== normalizeToken(refTokens[idx])) {
      out.add(stripPunctuation(wTokens[idx]));
    }
  }
  // Compléments génériques si les formes fautives ne diffèrent pas mot à mot.
  if (out.size < 3) {
    for (const w of ['is', 'are', 'do', 'does', 'was', 'were', 'have', 'has', 'to', 'the']) {
      if (out.size >= 3) break;
      if (normalizeToken(w) !== normalizeToken(item.blank)) out.add(w);
    }
  }
  return [...out];
}

function normalizeToken(s: string | undefined): string {
  return (s ?? '').toLowerCase().replace(/[’']/g, "'").replace(/[.,!?]/g, '');
}

function stripPunctuation(s: string): string {
  return s.replace(/[.,!?;:]$/g, '');
}

// ---------------------------------------------------------------------------
// Compréhension écrite
// ---------------------------------------------------------------------------

function fromReading(item: ReadingItem, _ctx: GenContext): Exercise[] {
  return item.questions.map((q, i) => ({
    id: `${item.id}-q${i + 1}`,
    type: 'reading' as const,
    itemId: item.id,
    conceptId: item.id,
    skill: 'reading' as const,
    difficulty: item.difficulty,
    instruction: 'Lisez le texte, puis répondez.',
    passageTitle: item.title,
    passage: item.text,
    prompt: q.prompt,
    options: q.options,
    answer: q.answer,
    explanation: q.explanation,
  }));
}

// ---------------------------------------------------------------------------
// Dialogue
// ---------------------------------------------------------------------------

function fromDialogue(item: DialogueItem, ctx: GenContext): Exercise[] {
  const out: Exercise[] = [];

  for (const [i, st] of (item.statements ?? []).entries()) {
    out.push({
      id: `${item.id}-tf${i + 1}`,
      type: 'trueFalse',
      itemId: item.id,
      conceptId: item.id,
      skill: 'reading',
      difficulty: item.difficulty,
      instruction: 'Vrai ou faux, d’après le dialogue ?',
      statement: st.en,
      context: item.lines.map((l) => `${l.speaker}: ${l.en}`).join('\n'),
      answer: st.isTrue,
      explanation: st.explanation,
    });
  }

  const line = item.lines[Math.min(1, item.lines.length - 1)];
  if (line && item.lines.length >= 3) {
    const options = shuffle(
      [line.fr, ...item.lines.filter((l) => l !== line).slice(0, 3).map((l) => l.fr)],
      ctx.rng
    );
    out.push({
      id: `${item.id}-listen`,
      type: 'listenChoose',
      itemId: item.id,
      conceptId: item.id,
      skill: 'listening',
      difficulty: bump(item.difficulty),
      instruction: 'Écoutez la réplique, puis choisissez sa traduction.',
      prompt: '',
      options,
      answer: options.indexOf(line.fr),
      explanation: `Vous avez entendu : « ${line.en} ».`,
      audio: line.en,
    });
  }

  return out;
}

// ---------------------------------------------------------------------------
// Utilitaires
// ---------------------------------------------------------------------------

function splitAround(sentence: string, target: string): { before: string; after: string; found: boolean } {
  const idx = sentence.toLowerCase().indexOf(target.toLowerCase());
  if (idx < 0) return { before: sentence, after: '', found: false };
  return {
    before: sentence.slice(0, idx),
    after: sentence.slice(idx + target.length),
    found: true,
  };
}

function bump(d: number): 1 | 2 | 3 | 4 | 5 {
  return Math.min(5, d + 1) as 1 | 2 | 3 | 4 | 5;
}

function posLabel(pos: NonNullable<VocabItem['pos']>): string {
  const map = { n: 'nom', v: 'verbe', adj: 'adjectif', adv: 'adverbe', phrase: 'expression', prep: 'préposition' };
  return map[pos];
}
