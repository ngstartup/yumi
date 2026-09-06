import type { CEFR, SkillKey } from './types';

/** Banque de questions du test de placement.
 *  Chaque question porte un niveau CECRL et une compétence, ce qui permet
 *  au moteur adaptatif de monter/descendre en difficulté et de produire un
 *  profil par compétence à la fin. */
export interface PlacementQuestion {
  id: string;
  level: CEFR;
  skill: SkillKey;
  prompt: string;
  /** Texte support (compréhension écrite) ou phrase à écouter (compréhension orale). */
  support?: string;
  /** Si présent, la question est audio : le texte est lu par la synthèse vocale. */
  audio?: string;
  options: string[];
  answer: number;
  explanation: string;
}

export const PLACEMENT_BANK: PlacementQuestion[] = [
  // ---------------- A1 ----------------
  {
    id: 'p-a1-1',
    level: 'A1',
    skill: 'grammar',
    prompt: 'Choose the correct sentence.',
    options: ['She work in Paris.', 'She works in Paris.', 'She working in Paris.', 'She is work in Paris.'],
    answer: 1,
    explanation: 'Au présent simple, « she » impose la terminaison -s : She works.',
  },
  {
    id: 'p-a1-2',
    level: 'A1',
    skill: 'vocabulary',
    prompt: 'What is the French for “bread”?',
    options: ['le lait', 'le pain', 'la viande', 'le riz'],
    answer: 1,
    explanation: '“bread” = le pain.',
  },
  {
    id: 'p-a1-3',
    level: 'A1',
    skill: 'grammar',
    prompt: 'Complete: “There ___ two chairs in the kitchen.”',
    options: ['is', 'are', 'have', 'has'],
    answer: 1,
    explanation: '« there are » s’emploie avec un nom pluriel.',
  },
  {
    id: 'p-a1-4',
    level: 'A1',
    skill: 'listening',
    prompt: 'Listen and choose what you hear.',
    audio: 'My brother lives in London.',
    options: ['My brother leaves in London.', 'My brother lives in London.', 'My mother lives in London.', 'My brother lives in Lisbon.'],
    answer: 1,
    explanation: 'On entend “brother”, “lives” et “London”.',
  },
  {
    id: 'p-a1-5',
    level: 'A1',
    skill: 'grammar',
    prompt: 'Complete: “I ___ a teacher.”',
    options: ['am', 'is', 'are', 'be'],
    answer: 0,
    explanation: 'Avec « I », le verbe be devient « am ».',
  },

  // ---------------- A2 ----------------
  {
    id: 'p-a2-1',
    level: 'A2',
    skill: 'grammar',
    prompt: 'Choose the correct sentence.',
    options: [
      'Yesterday I go to the market.',
      'Yesterday I went to the market.',
      'Yesterday I goed to the market.',
      'Yesterday I have go to the market.',
    ],
    answer: 1,
    explanation: '« yesterday » impose le past simple ; go → went (irrégulier).',
  },
  {
    id: 'p-a2-2',
    level: 'A2',
    skill: 'vocabulary',
    prompt: 'Which word means “échéance” in a professional context?',
    options: ['schedule', 'deadline', 'agenda', 'appointment'],
    answer: 1,
    explanation: '“deadline” = la date limite, l’échéance.',
  },
  {
    id: 'p-a2-3',
    level: 'A2',
    skill: 'grammar',
    prompt: 'Complete: “She ___ drink coffee in the evening.”',
    options: ['doesn’t', 'don’t', 'isn’t', 'not'],
    answer: 0,
    explanation: 'À la 3ᵉ personne du singulier, la négation du présent simple est « doesn’t ».',
  },
  {
    id: 'p-a2-4',
    level: 'A2',
    skill: 'reading',
    prompt: 'The bus leaves at 7 a.m. What must Sara do?',
    support: 'Sara has to be at the bus station 20 minutes before departure. The bus leaves at 7 a.m.',
    options: ['Arrive at 7:20', 'Arrive at 6:40', 'Arrive at 7:00', 'Arrive at 6:00'],
    answer: 1,
    explanation: '20 minutes avant 7 h 00 = 6 h 40.',
  },
  {
    id: 'p-a2-5',
    level: 'A2',
    skill: 'listening',
    prompt: 'Listen and choose the correct answer.',
    audio: 'The meeting has been moved to Thursday afternoon.',
    options: ['The meeting is on Tuesday morning.', 'The meeting is cancelled.', 'The meeting is on Thursday afternoon.', 'The meeting is at noon.'],
    answer: 2,
    explanation: '“moved to Thursday afternoon” — déplacée à jeudi après-midi.',
  },

  // ---------------- B1 ----------------
  {
    id: 'p-b1-1',
    level: 'B1',
    skill: 'grammar',
    prompt: 'Choose the correct sentence.',
    options: [
      'I have worked here since six years.',
      'I work here since six years.',
      'I have worked here for six years.',
      'I am working here since six years.',
    ],
    answer: 2,
    explanation: '« for » + durée ; « since » + point de départ. Ici : for six years.',
  },
  {
    id: 'p-b1-2',
    level: 'B1',
    skill: 'grammar',
    prompt: 'Complete: “If you ___ today, we will deliver on Monday.”',
    options: ['will confirm', 'confirm', 'confirmed', 'would confirm'],
    answer: 1,
    explanation: 'Premier conditionnel : If + présent simple, will + base verbale.',
  },
  {
    id: 'p-b1-3',
    level: 'B1',
    skill: 'vocabulary',
    prompt: 'Which sentence is the most appropriate in a professional email?',
    options: [
      'Give me the report now.',
      'Could you send me the report by Friday?',
      'I want the report.',
      'You must send the report.',
    ],
    answer: 1,
    explanation: '« Could you… ? » est la forme polie standard en contexte professionnel.',
  },
  {
    id: 'p-b1-4',
    level: 'B1',
    skill: 'reading',
    prompt: 'What does the writer suggest?',
    support:
      'The results are promising; however, the sample was small. Further research is therefore needed before drawing firm conclusions.',
    options: [
      'The conclusions are certain.',
      'More research is needed.',
      'The results are useless.',
      'The sample was very large.',
    ],
    answer: 1,
    explanation: '« Further research is therefore needed » — davantage de recherche est nécessaire.',
  },
  {
    id: 'p-b1-5',
    level: 'B1',
    skill: 'listening',
    prompt: 'Listen and choose the correct answer.',
    audio: 'We would need your confirmation by the end of the month to keep the current rates.',
    options: [
      'The rates will change after the end of the month without confirmation.',
      'The rates have already changed.',
      'No confirmation is needed.',
      'The confirmation is due next year.',
    ],
    answer: 0,
    explanation: 'La confirmation avant la fin du mois conditionne le maintien des tarifs.',
  },

  // ---------------- B2 ----------------
  {
    id: 'p-b2-1',
    level: 'B2',
    skill: 'grammar',
    prompt: 'Choose the correct sentence.',
    options: [
      'If I had known, I would have called you.',
      'If I would have known, I would have called you.',
      'If I knew, I would have called you yesterday morning.',
      'If I have known, I would call you.',
    ],
    answer: 0,
    explanation: 'Troisième conditionnel : If + past perfect, would have + participe passé.',
  },
  {
    id: 'p-b2-2',
    level: 'B2',
    skill: 'vocabulary',
    prompt: 'Choose the best word: “The report ___ that costs will rise by 8%.”',
    options: ['tells', 'says', 'indicates', 'speaks'],
    answer: 2,
    explanation: '« indicates » est le verbe attendu dans un registre analytique.',
  },
  {
    id: 'p-b2-3',
    level: 'B2',
    skill: 'reading',
    prompt: 'What is the author’s attitude?',
    support:
      'While the initiative is undoubtedly well-intentioned, its implementation has been, at best, uneven.',
    options: ['Fully supportive', 'Critical but nuanced', 'Completely hostile', 'Indifferent'],
    answer: 1,
    explanation: '« well-intentioned » mais « at best, uneven » : critique nuancée.',
  },
  {
    id: 'p-b2-4',
    level: 'B2',
    skill: 'grammar',
    prompt: 'Complete: “She insisted ___ paying for the meal.”',
    options: ['to', 'on', 'in', 'for'],
    answer: 1,
    explanation: '« insist on » + verbe en -ing.',
  },

  // ---------------- C1 ----------------
  {
    id: 'p-c1-1',
    level: 'C1',
    skill: 'vocabulary',
    prompt: 'Choose the closest meaning of “to hedge” in academic writing.',
    options: ['to exaggerate a claim', 'to qualify a claim cautiously', 'to reject a claim', 'to repeat a claim'],
    answer: 1,
    explanation: '« hedging » = nuancer prudemment une affirmation.',
  },
  {
    id: 'p-c1-2',
    level: 'C1',
    skill: 'grammar',
    prompt: 'Choose the correct sentence.',
    options: [
      'Rarely I have seen such a well-argued paper.',
      'Rarely have I seen such a well-argued paper.',
      'Rarely I had seen such a well-argued paper.',
      'Rarely did I seen such a well-argued paper.',
    ],
    answer: 1,
    explanation: 'Après un adverbe négatif en tête de phrase, l’inversion est obligatoire.',
  },
  {
    id: 'p-c1-3',
    level: 'C1',
    skill: 'reading',
    prompt: 'What does “notwithstanding” signal here?',
    support: 'Notwithstanding the funding shortfall, the programme met all of its stated targets.',
    options: ['A cause', 'A concession', 'A condition', 'A consequence'],
    answer: 1,
    explanation: '« notwithstanding » introduit une concession : malgré.',
  },
];

/** Ordre de difficulté utilisé par le moteur adaptatif. */
export const PLACEMENT_LADDER: CEFR[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
