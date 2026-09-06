import type { SectionSpec } from './builder';

/** Anglais général — Niveau A2 (élémentaire).
 *  Démontre la continuité du parcours au-delà de A1. */
export const GENERAL_A2: SectionSpec[] = [
  {
    id: 'gen-a2-s1',
    title: 'Raconter et se débrouiller',
    units: [
      {
        id: 'gen-a2-u1',
        title: 'Parler du passé',
        subtitle: 'Le past simple, régulier et irrégulier',
        icon: '📜',
        lessons: [
          {
            id: 'gen-a2-u1-l1',
            title: 'Past simple : verbes réguliers',
            objective: 'Raconter des événements terminés.',
            intro:
              "Le past simple décrit une action terminée à un moment précis du passé. Les verbes réguliers prennent -ed : work → worked. La forme est la même à toutes les personnes.",
            note: {
              title: 'Négation et question au passé',
              body: "La négation utilise « didn't » + base verbale : « I didn't work ». La question aussi : « Did you work? ». Après « did », le verbe ne porte JAMAIS la marque du passé.",
              examples: [
                { en: 'I worked late yesterday.', fr: 'J’ai travaillé tard hier.' },
                { en: 'She didn’t call me.', fr: 'Elle ne m’a pas appelé.' },
              ],
            },
            vocab: [
              ['yesterday', 'hier', 'adv'],
              ['last week', 'la semaine dernière', 'phrase'],
              ['ago', 'il y a (durée)', 'adv'],
              ['finished', 'terminé', 'v'],
              ['arrived', 'arrivé', 'v'],
              ['visited', 'visité', 'v'],
              ['decided', 'décidé', 'v'],
              ['stayed', 'resté', 'v'],
            ],
            sentences: [
              ['I worked late yesterday.', 'J’ai travaillé tard hier.'],
              ['They arrived two hours ago.', 'Ils sont arrivés il y a deux heures.'],
              ['We didn’t stay at the hotel.', 'Nous ne sommes pas restés à l’hôtel.'],
            ],
            grammar: [
              {
                topicId: 'past-simple-regular',
                title: 'Past simple régulier',
                rule: "Verbe + -ed pour toutes les personnes : « She worked ». Pas de -s supplémentaire au passé.",
                en: 'She worked in Paris last year.',
                fr: 'Elle a travaillé à Paris l’année dernière.',
                wrong: ['She worked in Paris last year ago.', 'She works in Paris last year.', 'She did worked in Paris last year.'],
                blank: 'worked',
              },
              {
                topicId: 'past-simple-negative',
                title: 'Négation au passé',
                rule: "Après « didn't », le verbe revient à sa forme de base : « didn't go », jamais « didn't went ».",
                en: 'They didn’t go to the meeting.',
                fr: 'Ils ne sont pas allés à la réunion.',
                wrong: ['They didn’t went to the meeting.', 'They not went to the meeting.', 'They don’t went to the meeting.'],
                blank: 'go',
              },
            ],
          },
          {
            id: 'gen-a2-u1-l2',
            title: 'Past simple : verbes irréguliers',
            objective: 'Maîtriser les 15 verbes irréguliers les plus fréquents.',
            intro:
              "Les verbes irréguliers ne suivent pas la règle du -ed : go → went, take → took. Ils sont peu nombreux mais représentent la majorité des verbes utilisés au quotidien.",
            vocab: [
              ['go → went', 'aller → alla', 'v'],
              ['have → had', 'avoir → eut', 'v'],
              ['take → took', 'prendre → prit', 'v'],
              ['make → made', 'faire → fit', 'v'],
              ['see → saw', 'voir → vit', 'v'],
              ['come → came', 'venir → vint', 'v'],
              ['give → gave', 'donner → donna', 'v'],
              ['buy → bought', 'acheter → acheta', 'v'],
              ['write → wrote', 'écrire → écrivit', 'v'],
              ['speak → spoke', 'parler → parla', 'v'],
            ],
            sentences: [
              ['I went to Accra last summer.', 'Je suis allé à Accra l’été dernier.'],
              ['She bought a new laptop.', 'Elle a acheté un nouvel ordinateur portable.'],
              ['We spoke to the manager yesterday.', 'Nous avons parlé au responsable hier.'],
            ],
            grammar: [
              {
                topicId: 'past-simple-irregular',
                title: 'Verbes irréguliers',
                rule: "« go » devient « went », sans -ed. Ces formes s'apprennent par cœur : elles n'obéissent à aucune règle.",
                en: 'I went to the bank this morning.',
                fr: 'Je suis allé à la banque ce matin.',
                wrong: ['I goed to the bank this morning.', 'I did went to the bank this morning.', 'I was go to the bank this morning.'],
                blank: 'went',
              },
            ],
            reading: {
              title: 'A difficult journey',
              text: "Last March, Ibrahim travelled from Niamey to Lagos for a trade fair. He took the bus on Monday evening. The journey was long: the bus broke down twice and he arrived a day late. He didn't see the opening ceremony, but he met three suppliers and signed his first contract. On the way back, he decided to take the plane.",
              questions: [
                {
                  prompt: 'Why did Ibrahim arrive late?',
                  options: ['He missed the bus', 'The bus broke down twice', 'He left on Tuesday', 'The fair started early'],
                  answer: 1,
                  explanation: '« the bus broke down twice and he arrived a day late ».',
                },
                {
                  prompt: 'What did he do at the fair?',
                  options: ['He saw the opening ceremony', 'He met three suppliers', 'He sold his bus', 'He cancelled his contract'],
                  answer: 1,
                  explanation: '« he met three suppliers and signed his first contract ».',
                },
                {
                  prompt: 'How did he go back?',
                  options: ['By bus', 'By train', 'By plane', 'By car'],
                  answer: 2,
                  explanation: '« On the way back, he decided to take the plane. »',
                },
              ],
            },
          },
        ],
      },
      {
        id: 'gen-a2-u2',
        title: 'Projets et futur',
        subtitle: 'going to, will, et les projets',
        icon: '🗓️',
        lessons: [
          {
            id: 'gen-a2-u2-l1',
            title: 'Parler de ses projets',
            objective: 'Distinguer « going to » et « will ».',
            intro:
              "« be going to » annonce une intention déjà décidée ; « will » exprime une décision prise sur le moment, une prédiction ou une promesse.",
            note: {
              title: 'going to vs will',
              body: "I'm going to open a shop. (projet décidé) · It's heavy — I'll help you. (décision immédiate) · I think it will rain. (prédiction)",
            },
            vocab: [
              ['plan', 'projet / prévoir', 'n'],
              ['next month', 'le mois prochain', 'phrase'],
              ['soon', 'bientôt', 'adv'],
              ['maybe', 'peut-être', 'adv'],
              ['probably', 'probablement', 'adv'],
              ['hope', 'espérer', 'v'],
              ['decide', 'décider', 'v'],
            ],
            sentences: [
              ['I’m going to start a business next year.', 'Je vais lancer une entreprise l’année prochaine.'],
              ['I’ll call you tomorrow.', 'Je t’appellerai demain.'],
              ['It will probably rain this afternoon.', 'Il pleuvra probablement cet après-midi.'],
            ],
            grammar: [
              {
                topicId: 'future-going-to',
                title: 'be going to',
                rule: "« be going to » se construit avec « am / is / are » + « going to » + verbe de base : « She is going to travel ».",
                en: 'She is going to travel next month.',
                fr: 'Elle va voyager le mois prochain.',
                wrong: ['She is going travel next month.', 'She going to travel next month.', 'She is going to travelling next month.'],
                blank: 'going to',
              },
              {
                topicId: 'future-will',
                title: 'will + base verbale',
                rule: "Après « will », le verbe reste à l'infinitif sans « to » : « I will call », jamais « I will to call ».",
                en: 'I will call you tomorrow.',
                fr: 'Je t’appellerai demain.',
                wrong: ['I will to call you tomorrow.', 'I will calling you tomorrow.', 'I will called you tomorrow.'],
                blank: 'call',
              },
            ],
          },
        ],
      },
      {
        id: 'gen-a2-u3',
        title: 'Santé et urgences',
        subtitle: 'Se faire comprendre chez le médecin',
        icon: '🩺',
        lessons: [
          {
            id: 'gen-a2-u3-l1',
            title: 'Chez le médecin',
            objective: 'Décrire un symptôme et comprendre un conseil.',
            intro:
              "Pour décrire un problème de santé, l'anglais dit « I have a headache » ou « My back hurts ». « I am sick » signifie « je suis malade ».",
            vocab: [
              ['doctor', 'médecin', 'n'],
              ['headache', 'mal de tête', 'n'],
              ['stomach ache', 'mal au ventre', 'n'],
              ['fever', 'fièvre', 'n'],
              ['cough', 'toux / tousser', 'n'],
              ['tired', 'fatigué', 'adj'],
              ['medicine', 'médicament', 'n'],
              ['appointment', 'rendez-vous', 'n'],
              ['rest', 'se reposer', 'v'],
            ],
            sentences: [
              ['I have a headache and a fever.', 'J’ai mal à la tête et de la fièvre.'],
              ['You should rest for two days.', 'Vous devriez vous reposer deux jours.'],
              ['I’d like to make an appointment.', 'Je voudrais prendre rendez-vous.'],
            ],
            grammar: [
              {
                topicId: 'modal-should',
                title: '« should » pour conseiller',
                rule: "« should » + verbe de base donne un conseil : « You should rest ». Jamais de « to » après « should ».",
                en: 'You should rest for two days.',
                fr: 'Vous devriez vous reposer deux jours.',
                wrong: ['You should to rest for two days.', 'You should resting for two days.', 'You shoulds rest for two days.'],
                blank: 'rest',
              },
            ],
          },
        ],
      },
    ],
  },
];
