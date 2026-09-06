import type { SectionSpec } from './builder';

/** Anglais pour voyager — démonstration A2. */
export const TRAVEL_A2: SectionSpec[] = [
  {
    id: 'trv-a2-s1',
    title: 'En déplacement',
    units: [
      {
        id: 'trv-a2-u1',
        title: 'Aéroport et hôtel',
        subtitle: 'Enregistrement, contrôles, réservation',
        icon: '✈️',
        lessons: [
          {
            id: 'trv-a2-u1-l1',
            title: 'À l’aéroport',
            objective: 'Comprendre les annonces et répondre aux questions au contrôle.',
            intro:
              "Les mêmes questions reviennent à chaque voyage. Les reconnaître à l'oreille évite la panique au guichet.",
            vocab: [
              ['boarding pass', 'carte d’embarquement', 'n'],
              ['gate', 'porte d’embarquement', 'n'],
              ['luggage / baggage', 'bagages', 'n'],
              ['carry-on', 'bagage à main', 'n'],
              ['check-in desk', 'comptoir d’enregistrement', 'n'],
              ['delayed', 'retardé', 'adj'],
              ['flight', 'vol', 'n'],
              ['aisle seat', 'siège côté couloir', 'n'],
              ['window seat', 'siège côté hublot', 'n'],
              ['customs', 'douane', 'n'],
            ],
            sentences: [
              ['Is this the check-in desk for flight AT 512?', 'Est-ce le comptoir d’enregistrement du vol AT 512 ?'],
              ['I have one suitcase and one carry-on.', 'J’ai une valise et un bagage à main.'],
              ['The flight is delayed by two hours.', 'Le vol est retardé de deux heures.'],
              ['Could I have an aisle seat, please?', 'Pourrais-je avoir un siège côté couloir, s’il vous plaît ?'],
            ],
            grammar: [
              {
                topicId: 'questions-yes-no',
                title: 'Questions fermées avec « to be »',
                rule: "Avec « to be », la question se forme par inversion : « Is this the gate? ». Pas besoin de « do ».",
                en: 'Is this the gate for flight 512?',
                fr: 'Est-ce la porte du vol 512 ?',
                wrong: ['Do this is the gate for flight 512?', 'This is the gate for flight 512?', 'Is this is the gate for flight 512?'],
                blank: 'Is',
              },
            ],
            dialogue: {
              context: 'Au comptoir d’enregistrement.',
              lines: [
                { speaker: 'Agent', en: 'Good morning. May I see your passport, please?', fr: 'Bonjour. Puis-je voir votre passeport, s’il vous plaît ?' },
                { speaker: 'Traveller', en: 'Here you are. I have one bag to check in.', fr: 'Voilà. J’ai un bagage à enregistrer.' },
                { speaker: 'Agent', en: 'Window or aisle seat?', fr: 'Siège hublot ou couloir ?' },
                { speaker: 'Traveller', en: 'Aisle, please. What time is boarding?', fr: 'Couloir, s’il vous plaît. À quelle heure est l’embarquement ?' },
                { speaker: 'Agent', en: 'Boarding starts at 10:40 at gate 14.', fr: 'L’embarquement commence à 10 h 40, porte 14.' },
              ],
              statements: [
                { en: 'The traveller wants a window seat.', isTrue: false, explanation: 'Il répond « Aisle, please » — côté couloir.' },
                { en: 'Boarding is at gate 14.', isTrue: true, explanation: '« Boarding starts at 10:40 at gate 14. »' },
              ],
            },
          },
          {
            id: 'trv-a2-u1-l2',
            title: 'À l’hôtel',
            objective: 'Réserver, arriver, signaler un problème.',
            intro:
              "À l'hôtel, deux verbes suffisent pour l'essentiel : « to book » (réserver) et « to check in / out ».",
            vocab: [
              ['to book', 'réserver', 'v'],
              ['reservation', 'réservation', 'n'],
              ['single room', 'chambre simple', 'n'],
              ['double room', 'chambre double', 'n'],
              ['key card', 'carte magnétique', 'n'],
              ['breakfast included', 'petit-déjeuner inclus', 'phrase'],
              ['to check out', 'quitter l’hôtel', 'v'],
              ['air conditioning', 'climatisation', 'n'],
              ['towel', 'serviette', 'n'],
            ],
            sentences: [
              ['I have a reservation under the name Traoré.', 'J’ai une réservation au nom de Traoré.'],
              ['Is breakfast included?', 'Le petit-déjeuner est-il inclus ?'],
              ['The air conditioning isn’t working.', 'La climatisation ne fonctionne pas.'],
            ],
            grammar: [
              {
                topicId: 'present-continuous-negative',
                title: 'Négation au présent continu',
                rule: "« isn't » + verbe en -ing : « The lift isn't working ». On ne remet pas la marque de la négation sur le verbe.",
                en: 'The air conditioning isn’t working.',
                fr: 'La climatisation ne fonctionne pas.',
                wrong: ['The air conditioning isn’t work.', 'The air conditioning doesn’t working.', 'The air conditioning not working.'],
                blank: 'isn’t working',
              },
            ],
          },
        ],
      },
      {
        id: 'trv-a2-u2',
        title: 'S’orienter et gérer les imprévus',
        subtitle: 'Demander de l’aide, signaler un problème',
        icon: '🧭',
        lessons: [
          {
            id: 'trv-a2-u2-l1',
            title: 'Se repérer en ville',
            objective: 'Demander un itinéraire et comprendre la réponse.',
            intro:
              "Deux formules suffisent pour ne jamais être perdu : « How do I get to… ? » et « Is it far from here? ».",
            vocab: [
              ['map', 'carte / plan', 'n'],
              ['crossroads', 'carrefour', 'n'],
              ['roundabout', 'rond-point', 'n'],
              ['on your left', 'sur votre gauche', 'phrase'],
              ['nearby', 'à proximité', 'adv'],
              ['bus stop', 'arrêt de bus', 'n'],
              ['entrance', 'entrée', 'n'],
              ['exit', 'sortie', 'n'],
            ],
            sentences: [
              ['How do I get to the city centre?', 'Comment rejoindre le centre-ville ?'],
              ['Is it far from here?', 'Est-ce loin d’ici ?'],
              ['Take the second exit at the roundabout.', 'Prenez la deuxième sortie au rond-point.'],
            ],
            grammar: [
              {
                topicId: 'questions-how-do-i',
                title: '« How do I… ? » pour demander la marche à suivre',
                rule: "« How do I get to… ? » se construit avec l'auxiliaire « do » et le verbe de base. On ne dit pas « How I get to… ? ».",
                en: 'How do I get to the station?',
                fr: 'Comment rejoindre la gare ?',
                wrong: ['How I get to the station?', 'How do I to get to the station?', 'How do I getting to the station?'],
                blank: 'do',
              },
            ],
          },
          {
            id: 'trv-a2-u2-l2',
            title: 'Un problème pendant le voyage',
            objective: 'Signaler une perte, un retard ou un souci de santé.',
            intro:
              "Pour signaler un problème, l'anglais préfère la voix passive ou « to be » + adjectif : « My bag is missing », « My flight was cancelled ».",
            vocab: [
              ['missing', 'manquant / perdu', 'adj'],
              ['cancelled', 'annulé', 'adj'],
              ['to report', 'signaler', 'v'],
              ['insurance', 'assurance', 'n'],
              ['pharmacy', 'pharmacie', 'n'],
              ['embassy', 'ambassade', 'n'],
              ['emergency', 'urgence', 'n'],
              ['wallet', 'portefeuille', 'n'],
            ],
            sentences: [
              ['My suitcase is missing.', 'Ma valise a disparu.'],
              ['My flight was cancelled this morning.', 'Mon vol a été annulé ce matin.'],
              ['Where is the nearest pharmacy?', 'Où est la pharmacie la plus proche ?'],
            ],
            grammar: [
              {
                topicId: 'passive-past',
                title: 'Passif au passé : was / were + participe',
                rule: "« was » (singulier) ou « were » (pluriel) suivi du participe passé : « The flight was cancelled ».",
                en: 'My flight was cancelled.',
                fr: 'Mon vol a été annulé.',
                wrong: ['My flight was cancel.', 'My flight is cancelled yesterday by.', 'My flight were cancelled.'],
                blank: 'was cancelled',
              },
            ],
          },
        ],
      },
    ],
  },
];
