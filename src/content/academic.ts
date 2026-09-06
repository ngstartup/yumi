import type { SectionSpec } from './builder';

/** Anglais académique — démonstration B1/B2. */
export const ACADEMIC_B1: SectionSpec[] = [
  {
    id: 'aca-b1-s1',
    title: 'Étudier en anglais',
    units: [
      {
        id: 'aca-b1-u1',
        title: 'Vocabulaire académique',
        subtitle: 'Les mots des cours et de la recherche',
        icon: '🎓',
        lessons: [
          {
            id: 'aca-b1-u1-l1',
            title: 'Le lexique du cours et de la recherche',
            objective: 'Comprendre les termes récurrents d’un cours universitaire.',
            intro:
              "L'anglais académique privilégie des verbes précis : « to argue », « to suggest », « to demonstrate ». Les employer correctement change immédiatement la qualité perçue d'un écrit.",
            vocab: [
              ['research', 'recherche', 'n'],
              ['evidence', 'preuves / données probantes', 'n'],
              ['hypothesis', 'hypothèse', 'n'],
              ['findings', 'résultats', 'n'],
              ['to argue', 'soutenir (une thèse)', 'v'],
              ['to suggest', 'suggérer', 'v'],
              ['to assess', 'évaluer', 'v'],
              ['framework', 'cadre théorique', 'n'],
              ['sample', 'échantillon', 'n'],
              ['peer-reviewed', 'évalué par les pairs', 'adj'],
            ],
            sentences: [
              ['The author argues that the model is incomplete.', 'L’auteur soutient que le modèle est incomplet.'],
              ['These findings suggest a strong correlation.', 'Ces résultats suggèrent une forte corrélation.'],
              ['The sample consisted of 240 participants.', 'L’échantillon comptait 240 participants.'],
            ],
            grammar: [
              {
                topicId: 'reporting-verbs',
                title: 'Verbes de citation + that',
                rule: "« argue », « suggest », « claim » sont suivis d'une proposition introduite par « that » : « The author argues that… ».",
                en: 'The author argues that the data are incomplete.',
                fr: 'L’auteur soutient que les données sont incomplètes.',
                wrong: [
                  'The author argues the data to be incomplete that.',
                  'The author argues for that the data are incomplete.',
                  'The author is arguing that the data is incomplete that.',
                ],
                blank: 'that',
              },
            ],
          },
          {
            id: 'aca-b1-u1-l2',
            title: 'Argumenter et nuancer',
            objective: 'Structurer un argument et exprimer la prudence scientifique.',
            intro:
              "L'écrit académique anglais évite les affirmations absolues. On « nuance » (hedging) : « may », « tends to », « appears to », « suggests ».",
            note: {
              title: 'Connecteurs logiques',
              body: "Ajouter : moreover, furthermore · Opposer : however, nevertheless · Conséquence : therefore, consequently · Illustrer : for instance.",
            },
            vocab: [
              ['however', 'cependant', 'adv'],
              ['therefore', 'par conséquent', 'adv'],
              ['moreover', 'de plus', 'adv'],
              ['nevertheless', 'néanmoins', 'adv'],
              ['on the other hand', 'd’un autre côté', 'phrase'],
              ['to some extent', 'dans une certaine mesure', 'phrase'],
              ['it appears that', 'il semble que', 'phrase'],
              ['significant', 'significatif', 'adj'],
            ],
            sentences: [
              ['The results are promising; however, the sample was small.', 'Les résultats sont prometteurs ; cependant, l’échantillon était réduit.'],
              ['This may indicate a seasonal effect.', 'Cela pourrait indiquer un effet saisonnier.'],
              ['Therefore, further research is needed.', 'Par conséquent, des recherches supplémentaires sont nécessaires.'],
            ],
            grammar: [
              {
                topicId: 'hedging',
                title: 'Nuancer avec « may » et « tend to »',
                rule: "« may » + base verbale exprime la possibilité ; « tend to » + base exprime une tendance. Ni l'un ni l'autre ne prend -s.",
                en: 'These results may indicate a seasonal effect.',
                fr: 'Ces résultats pourraient indiquer un effet saisonnier.',
                wrong: [
                  'These results may indicates a seasonal effect.',
                  'These results may to indicate a seasonal effect.',
                  'These results mays indicate a seasonal effect.',
                ],
                blank: 'indicate',
              },
              {
                topicId: 'passive-voice',
                title: 'La voix passive académique',
                rule: "« be » + participe passé met en avant le résultat plutôt que l'auteur : « The data were collected in 2024 ».",
                en: 'The data were collected in 2024.',
                fr: 'Les données ont été collectées en 2024.',
                wrong: [
                  'The data were collect in 2024.',
                  'The data was collected by in 2024.',
                  'The data collected were in 2024.',
                ],
                blank: 'were collected',
              },
            ],
            reading: {
              title: 'Reading an abstract',
              text: "This study examines the impact of solar mini-grids on small businesses in rural Sahel. Data were collected from 180 enterprises across three regions between 2023 and 2025. The findings suggest that access to reliable electricity increases average monthly revenue by 22%, although the effect is smaller for businesses without prior access to credit. The authors argue that energy policy should therefore be combined with microfinance instruments. Further research is needed to assess long-term effects.",
              questions: [
                {
                  prompt: 'What does the study measure?',
                  options: [
                    'The cost of solar panels',
                    'The impact of solar mini-grids on small businesses',
                    'Electricity consumption in cities',
                    'Microfinance interest rates',
                  ],
                  answer: 1,
                  explanation: 'Première phrase : « examines the impact of solar mini-grids on small businesses ».',
                },
                {
                  prompt: 'For which businesses is the effect smaller?',
                  options: ['Larger ones', 'Those without prior access to credit', 'Those in cities', 'Newly created ones'],
                  answer: 1,
                  explanation: '« the effect is smaller for businesses without prior access to credit ».',
                },
                {
                  prompt: 'What do the authors recommend?',
                  options: [
                    'Stopping the mini-grid programme',
                    'Combining energy policy with microfinance',
                    'Increasing electricity prices',
                    'Focusing only on urban areas',
                  ],
                  answer: 1,
                  explanation: '« energy policy should therefore be combined with microfinance instruments ».',
                },
              ],
            },
          },
        ],
      },
    ],
  },
];
