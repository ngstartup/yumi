import type { SectionSpec } from './builder';

/** Anglais pour l'entretien d'embauche — démonstration B1. */
export const INTERVIEW_B1: SectionSpec[] = [
  {
    id: 'itw-b1-s1',
    title: 'Réussir l’entretien',
    units: [
      {
        id: 'itw-b1-u1',
        title: 'Se présenter en entretien',
        subtitle: 'Parcours, forces, motivation',
        icon: '🎤',
        lessons: [
          {
            id: 'itw-b1-u1-l1',
            title: '« Tell me about yourself »',
            objective: 'Présenter son parcours en 60 secondes.',
            intro:
              "La réponse attendue n'est pas une biographie : présent (ce que vous faites), passé (ce qui vous y a mené), futur (pourquoi ce poste). Trois phrases suffisent.",
            note: {
              title: 'Present perfect pour l’expérience',
              body: "« I have worked in logistics for six years » relie le passé au présent : l'expérience continue. Avec une date précise et terminée, on repasse au past simple : « I worked there in 2019 ».",
            },
            vocab: [
              ['background', 'parcours', 'n'],
              ['experience', 'expérience', 'n'],
              ['skill', 'compétence', 'n'],
              ['strength', 'point fort', 'n'],
              ['weakness', 'point faible', 'n'],
              ['achievement', 'réalisation', 'n'],
              ['to be responsible for', 'être chargé de', 'phrase'],
              ['team player', 'esprit d’équipe', 'n'],
              ['to look for', 'rechercher', 'v'],
            ],
            sentences: [
              ['I have worked in logistics for six years.', 'Je travaille dans la logistique depuis six ans.'],
              ['I’m currently responsible for a team of eight.', 'Je suis actuellement responsable d’une équipe de huit personnes.'],
              ['I’m looking for a role with more international exposure.', 'Je recherche un poste avec davantage de dimension internationale.'],
            ],
            grammar: [
              {
                topicId: 'present-perfect-for-since',
                title: 'Present perfect : for / since',
                rule: "« for » + durée (for six years) · « since » + point de départ (since 2019). Le temps utilisé est « have / has » + participe passé.",
                en: 'I have worked here for six years.',
                fr: 'Je travaille ici depuis six ans.',
                wrong: ['I have worked here since six years.', 'I work here for six years.', 'I am working here since six years.'],
                blank: 'for',
              },
            ],
          },
          {
            id: 'itw-b1-u1-l2',
            title: 'Les questions difficiles',
            objective: 'Répondre aux questions sur les faiblesses et les échecs.',
            intro:
              "Sur une faiblesse ou un échec, la structure gagnante est : le fait, la mesure prise, le résultat. Court, factuel, orienté solution.",
            vocab: [
              ['challenge', 'défi', 'n'],
              ['to overcome', 'surmonter', 'v'],
              ['to improve', 'améliorer', 'v'],
              ['feedback', 'retour / critique constructive', 'n'],
              ['deadline pressure', 'pression des délais', 'n'],
              ['to delegate', 'déléguer', 'v'],
              ['to prioritise', 'hiérarchiser', 'v'],
              ['lesson learned', 'leçon tirée', 'phrase'],
            ],
            sentences: [
              ['I used to take on too much myself, so I learned to delegate.', 'J’avais tendance à trop tout assumer, alors j’ai appris à déléguer.'],
              ['The project was delayed, but we recovered two weeks.', 'Le projet a pris du retard, mais nous avons rattrapé deux semaines.'],
              ['I would say my main strength is staying calm under pressure.', 'Je dirais que ma principale force est de rester calme sous pression.'],
            ],
            grammar: [
              {
                topicId: 'used-to',
                title: '« used to » — l’habitude passée',
                rule: "« used to » + verbe de base décrit une habitude passée qui n'existe plus : « I used to work nights ».",
                en: 'I used to work at night.',
                fr: 'Je travaillais de nuit (autrefois).',
                wrong: ['I used to working at night.', 'I use to work at night.', 'I used work at night.'],
                blank: 'used to',
              },
            ],
            reading: {
              title: 'Interview feedback',
              text: "Dear Fatou,\n\nThank you for coming in on Wednesday. The panel was impressed by your operational experience and by the way you described the supplier crisis you managed last year. Two points came up in our discussion: we would have liked more detail on how you measure team performance, and your answer on budget planning was quite short.\n\nWe would like to invite you to a second interview on 14 May with the regional director.\n\nKind regards,\nJames Okonkwo",
              questions: [
                {
                  prompt: 'What impressed the panel?',
                  options: ['Her budget planning', 'Her operational experience', 'Her written English', 'Her availability'],
                  answer: 1,
                  explanation: '« impressed by your operational experience and by the way you described the supplier crisis ».',
                },
                {
                  prompt: 'What was missing in her answers?',
                  options: [
                    'Detail on measuring team performance',
                    'Her salary expectations',
                    'Her previous employers',
                    'Her language skills',
                  ],
                  answer: 0,
                  explanation: '« we would have liked more detail on how you measure team performance ».',
                },
                {
                  prompt: 'What happens next?',
                  options: ['She is rejected', 'A second interview on 14 May', 'She starts on 14 May', 'She must send references'],
                  answer: 1,
                  explanation: '« invite you to a second interview on 14 May ».',
                },
              ],
            },
          },
        ],
      },
    ],
  },
];
