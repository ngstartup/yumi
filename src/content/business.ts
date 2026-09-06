import type { SectionSpec } from './builder';

/** Business English — démonstration B1. */
export const BUSINESS_B1: SectionSpec[] = [
  {
    id: 'biz-b1-s1',
    title: 'Communiquer au travail',
    units: [
      {
        id: 'biz-b1-u1',
        title: 'Réunions',
        subtitle: 'Ouvrir, intervenir, conclure',
        icon: '💼',
        lessons: [
          {
            id: 'biz-b1-u1-l1',
            title: 'Conduire une réunion',
            objective: 'Ouvrir une réunion, distribuer la parole et conclure.',
            intro:
              "Une réunion en anglais suit des formules très stables. Les maîtriser vous fait gagner en assurance immédiatement, même avec un vocabulaire limité.",
            note: {
              title: 'Les charnières d’une réunion',
              body: "Ouvrir : « Let's get started. » · Donner la parole : « Sarah, would you like to comment? » · Recentrer : « Let's come back to the main point. » · Conclure : « To sum up… ».",
            },
            vocab: [
              ['agenda', 'ordre du jour', 'n'],
              ['minutes', 'compte rendu', 'n'],
              ['deadline', 'échéance', 'n'],
              ['stakeholder', 'partie prenante', 'n'],
              ['to follow up', 'assurer le suivi', 'v'],
              ['action item', 'action à mener', 'n'],
              ['to postpone', 'reporter', 'v'],
              ['budget', 'budget', 'n'],
              ['issue', 'problème / point', 'n'],
              ['update', 'point d’avancement', 'n'],
            ],
            sentences: [
              ['Let’s get started — we have a lot to cover.', 'Commençons — nous avons beaucoup à voir.'],
              ['Could you walk us through the numbers?', 'Pourriez-vous nous détailler les chiffres ?'],
              ['To sum up, we agreed on three action items.', 'En résumé, nous avons convenu de trois actions.'],
              ['I’m afraid we’ll have to postpone that decision.', 'Je crains que nous devions reporter cette décision.'],
            ],
            grammar: [
              {
                topicId: 'polite-suggestions',
                title: 'Suggérer poliment',
                rule: "« Let's » + verbe de base propose une action commune : « Let's start ». « Shall we…? » est une variante plus formelle.",
                en: 'Let’s move on to the next point.',
                fr: 'Passons au point suivant.',
                wrong: ['Let’s to move on to the next point.', 'Let’s moving on to the next point.', 'Let us moves on to the next point.'],
                blank: 'move',
              },
              {
                topicId: 'modal-could-polite',
                title: '« Could » pour une demande professionnelle',
                rule: "« Could you… ? » est plus poli que « Can you… ? » en contexte professionnel. Le verbe qui suit reste à la base.",
                en: 'Could you send me the report by Friday?',
                fr: 'Pourriez-vous m’envoyer le rapport d’ici vendredi ?',
                wrong: ['Could you sending me the report by Friday?', 'Could you to send me the report by Friday?', 'Could you sent me the report by Friday?'],
                blank: 'send',
              },
            ],
          },
          {
            id: 'biz-b1-u1-l2',
            title: 'E-mails professionnels',
            objective: 'Rédiger un e-mail clair, poli et efficace.',
            intro:
              "Un e-mail professionnel anglais est plus direct qu'en français, mais toujours poli. Une formule d'ouverture, une demande claire, une formule de clôture : trois lignes suffisent souvent.",
            note: {
              title: 'Formules essentielles',
              body: "Ouverture : « Dear Ms Bello, » / « Hi Tom, ». Motif : « I'm writing to… ». Demande : « Could you please… ». Clôture : « Best regards, » (formel) ou « Best, » (courant).",
            },
            vocab: [
              ['attachment', 'pièce jointe', 'n'],
              ['to attach', 'joindre', 'v'],
              ['regarding', 'concernant', 'prep'],
              ['as discussed', 'comme convenu', 'phrase'],
              ['please find enclosed', 'veuillez trouver ci-joint', 'phrase'],
              ['at your earliest convenience', 'dès que possible', 'phrase'],
              ['I look forward to hearing from you', 'dans l’attente de votre réponse', 'phrase'],
              ['best regards', 'cordialement', 'phrase'],
            ],
            sentences: [
              ['I’m writing regarding the invoice dated 12 March.', 'Je vous écris au sujet de la facture du 12 mars.'],
              ['Please find attached the signed contract.', 'Veuillez trouver ci-joint le contrat signé.'],
              ['Could you confirm receipt of this email?', 'Pourriez-vous confirmer la réception de cet e-mail ?'],
              ['I look forward to hearing from you.', 'Dans l’attente de votre réponse.'],
            ],
            grammar: [
              {
                topicId: 'look-forward-to',
                title: '« look forward to » + -ing',
                rule: "Ici « to » est une préposition, pas un infinitif : le verbe qui suit prend -ing. « I look forward to hearing from you ».",
                en: 'I look forward to hearing from you.',
                fr: 'Dans l’attente de votre réponse.',
                wrong: ['I look forward to hear from you.', 'I look forward hearing from you.', 'I am looking forward to hear from you.'],
                blank: 'hearing',
              },
            ],
            reading: {
              title: 'A follow-up email',
              text: "Dear Mr Diallo,\n\nThank you for meeting us on Tuesday. As discussed, please find attached our revised quotation for the water supply project. The price includes delivery to Niamey but not installation, which we can quote separately.\n\nWe would need your confirmation by 30 April in order to keep the current rates. Should you have any questions, please do not hesitate to contact me.\n\nBest regards,\nAnna Kowalski",
              questions: [
                {
                  prompt: 'What is attached to the email?',
                  options: ['An invoice', 'A revised quotation', 'A delivery note', 'A contract'],
                  answer: 1,
                  explanation: '« please find attached our revised quotation ».',
                },
                {
                  prompt: 'Does the price include installation?',
                  options: ['Yes, everything is included', 'No, it is quoted separately', 'Only for Niamey', 'The email does not say'],
                  answer: 1,
                  explanation: '« not installation, which we can quote separately ».',
                },
                {
                  prompt: 'Why is the 30 April deadline important?',
                  options: ['The project starts then', 'To keep the current rates', 'The office closes', 'To pay the invoice'],
                  answer: 1,
                  explanation: '« by 30 April in order to keep the current rates ».',
                },
              ],
            },
          },
        ],
      },
      {
        id: 'biz-b1-u2',
        title: 'Négocier et vendre',
        subtitle: 'Défendre une position, trouver un accord',
        icon: '🤝',
        lessons: [
          {
            id: 'biz-b1-u2-l1',
            title: 'Le langage de la négociation',
            objective: 'Formuler une offre, une contre-offre et une concession.',
            intro:
              "En négociation, l'anglais professionnel privilégie les formes conditionnelles : elles laissent une porte ouverte sans engager définitivement.",
            note: {
              title: 'Le conditionnel de négociation',
              body: "« If you order 500 units, we can offer a 5% discount. » — Structure : If + présent, … can / will + base. C'est le premier conditionnel.",
            },
            vocab: [
              ['discount', 'remise', 'n'],
              ['quotation / quote', 'devis', 'n'],
              ['terms', 'conditions', 'n'],
              ['to negotiate', 'négocier', 'v'],
              ['supplier', 'fournisseur', 'n'],
              ['delivery', 'livraison', 'n'],
              ['invoice', 'facture', 'n'],
              ['agreement', 'accord', 'n'],
              ['to meet halfway', 'faire un compromis', 'phrase'],
            ],
            sentences: [
              ['If you order 500 units, we can offer a 5% discount.', 'Si vous commandez 500 unités, nous pouvons proposer 5 % de remise.'],
              ['That’s slightly above our budget.', 'C’est légèrement au-dessus de notre budget.'],
              ['Would you consider a longer payment period?', 'Envisageriez-vous un délai de paiement plus long ?'],
            ],
            grammar: [
              {
                topicId: 'first-conditional',
                title: 'Premier conditionnel',
                rule: "If + présent simple, puis « will » ou « can » + base verbale. On ne met jamais « will » après « if » dans cette structure.",
                en: 'If you confirm today, we will deliver on Monday.',
                fr: 'Si vous confirmez aujourd’hui, nous livrerons lundi.',
                wrong: [
                  'If you will confirm today, we will deliver on Monday.',
                  'If you confirm today, we deliver will on Monday.',
                  'If you confirmed today, we will deliver on Monday.',
                ],
                blank: 'confirm',
              },
            ],
          },
          {
            id: 'biz-b1-u2-l2',
            title: 'Présenter des chiffres',
            objective: 'Commenter un graphique et une évolution chiffrée.',
            intro:
              "Commenter un chiffre suppose un verbe de mouvement (rise, fall) et une mesure de l'écart (slightly, sharply). C'est un lexique restreint et très rentable.",
            note: {
              title: 'Verbe + adverbe',
              body: "Revenue rose sharply. · Costs fell slightly. · Margins remained stable. Le verbe donne la direction, l'adverbe l'intensité.",
            },
            vocab: [
              ['revenue', 'chiffre d’affaires', 'n'],
              ['to rise / rose', 'augmenter', 'v'],
              ['to fall / fell', 'baisser', 'v'],
              ['sharply', 'fortement', 'adv'],
              ['slightly', 'légèrement', 'adv'],
              ['forecast', 'prévision', 'n'],
              ['margin', 'marge', 'n'],
              ['quarter', 'trimestre', 'n'],
              ['to break even', 'atteindre l’équilibre', 'phrase'],
            ],
            sentences: [
              ['Revenue rose sharply in the third quarter.', 'Le chiffre d’affaires a fortement augmenté au troisième trimestre.'],
              ['Costs fell slightly compared with last year.', 'Les coûts ont légèrement baissé par rapport à l’an dernier.'],
              ['We expect to break even by December.', 'Nous prévoyons d’atteindre l’équilibre d’ici décembre.'],
            ],
            grammar: [
              {
                topicId: 'comparatives',
                title: 'Comparer : « compared with » et « than »',
                rule: "Après un comparatif (higher, lower), on utilise « than » ; pour une mise en regard, « compared with / to ».",
                en: 'Costs are lower than last year.',
                fr: 'Les coûts sont inférieurs à l’an dernier.',
                wrong: [
                  'Costs are lower that last year.',
                  'Costs are more low than last year.',
                  'Costs are lower as last year.',
                ],
                blank: 'than',
              },
            ],
          },
        ],
      },
    ],
  },
];
