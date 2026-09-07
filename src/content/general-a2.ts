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
  {
    id: 'gen-a2-s2',
    title: 'Comparer, quantifier, nuancer',
    units: [
      {
        id: 'gen-a2-u4',
        title: 'Comparer',
        subtitle: 'Plus grand, le plus grand',
        icon: '📊',
        lessons: [
          {
            id: 'gen-a2-u4-l1',
            title: 'Le comparatif',
            objective: 'Comparer deux choses ou deux personnes.',
            intro:
              "Pour comparer deux éléments, l'anglais ajoute -er aux adjectifs courts (cheap → cheaper) et place « more » devant les adjectifs longs (expensive → more expensive). Le second terme est toujours introduit par « than ».",
            note: {
              title: 'Les trois irréguliers à connaître',
              body: "Trois adjectifs très fréquents ne suivent aucune règle : good → better, bad → worse, far → further. Ils s'apprennent tels quels, et ne prennent jamais « more ».",
              examples: [
                { en: 'This connection is better than the one at home.', fr: 'Cette connexion est meilleure que celle de la maison.' },
                { en: 'The traffic is worse than yesterday.', fr: 'La circulation est pire qu’hier.' },
              ],
            },
            vocab: [
              ['cheap', 'bon marché', 'adj'],
              ['expensive', 'cher', 'adj'],
              ['heavy', 'lourd', 'adj'],
              ['quiet', 'calme', 'adj'],
              ['better', 'meilleur', 'adj'],
              ['worse', 'pire', 'adj'],
              ['than', 'que (comparaison)', 'prep'],
              ['as … as', 'aussi … que', 'phrase'],
              ['almost', 'presque', 'adv'],
            ],
            sentences: [
              ['This phone is cheaper than that one.', 'Ce téléphone est moins cher que celui-là.'],
              ['The bus is slower than the plane.', 'Le bus est plus lent que l’avion.'],
              ['My new office is not as big as the old one.', 'Mon nouveau bureau n’est pas aussi grand que l’ancien.'],
            ],
            grammar: [
              {
                topicId: 'comparative-short',
                title: 'Comparatif des adjectifs courts',
                rule: "Adjectif court + -er, puis « than » : « cheaper than ». On ne dit jamais « more cheap ».",
                en: 'This hotel is cheaper than the other one.',
                fr: 'Cet hôtel est moins cher que l’autre.',
                wrong: [
                  'This hotel is more cheap than the other one.',
                  'This hotel is cheaper that the other one.',
                  'This hotel is more cheaper than the other one.',
                ],
                blank: 'cheaper',
              },
              {
                topicId: 'comparative-long',
                title: 'Comparatif des adjectifs longs',
                rule: "Adjectif long : « more » devant l'adjectif. On n'ajoute pas -er : « more expensive », jamais « expensiver ».",
                en: 'Lagos is more expensive than Niamey.',
                fr: 'Lagos est plus cher que Niamey.',
                wrong: [
                  'Lagos is expensiver than Niamey.',
                  'Lagos is more expensive that Niamey.',
                  'Lagos is more expensiver than Niamey.',
                ],
                blank: 'more expensive',
              },
              {
                topicId: 'comparative-irregular',
                title: 'better et worse',
                rule: "« good » devient « better », « bad » devient « worse ». Ces formes remplacent l'adjectif : ni -er, ni « more ».",
                en: 'This connection is better than the one at home.',
                fr: 'Cette connexion est meilleure que celle de la maison.',
                wrong: [
                  'This connection is gooder than the one at home.',
                  'This connection is more good than the one at home.',
                  'This connection is more better than the one at home.',
                ],
                blank: 'better',
              },
            ],
          },
          {
            id: 'gen-a2-u4-l2',
            title: 'Le superlatif',
            objective: 'Désigner ce qui se distingue de tout un groupe.',
            intro:
              "Le superlatif désigne l'extrême d'un ensemble : « the cheapest », « the most expensive ». Les adjectifs courts prennent -est, les longs sont précédés de « the most ». L'article « the » est obligatoire.",
            vocab: [
              ['the best', 'le meilleur', 'phrase'],
              ['the worst', 'le pire', 'phrase'],
              ['crowded', 'bondé', 'adj'],
              ['famous', 'célèbre', 'adj'],
              ['powerful', 'puissant', 'adj'],
              ['guarantee', 'garantie', 'n'],
              ['delivery', 'livraison', 'n'],
              ['supplier', 'fournisseur', 'n'],
            ],
            sentences: [
              ['Lagos is the biggest city in Nigeria.', 'Lagos est la plus grande ville du Nigeria.'],
              ['This is the best restaurant in Niamey.', 'C’est le meilleur restaurant de Niamey.'],
              ['August is the most humid month here.', 'Août est le mois le plus humide ici.'],
            ],
            grammar: [
              {
                topicId: 'superlative-short',
                title: 'Superlatif des adjectifs courts',
                rule: "« the » + adjectif + -est : « the cheapest ». L'article « the » ne disparaît jamais.",
                en: 'This is the cheapest option.',
                fr: 'C’est l’option la moins chère.',
                wrong: [
                  'This is cheapest option.',
                  'This is the most cheap option.',
                  'This is the cheaper option of all.',
                ],
                blank: 'the cheapest',
              },
              {
                topicId: 'superlative-long',
                title: 'Superlatif des adjectifs longs',
                rule: "« the most » + adjectif : « the most expensive ». On n'ajoute jamais -est à un adjectif long.",
                en: 'This is the most expensive hotel in the city.',
                fr: 'C’est l’hôtel le plus cher de la ville.',
                wrong: [
                  'This is the expensivest hotel in the city.',
                  'This is the most expensivest hotel in the city.',
                  'This is most expensive hotel in the city.',
                ],
                blank: 'the most expensive',
              },
            ],
            reading: {
              title: 'Choosing a supplier',
              text: "Aïcha needed new solar panels for her shop in Niamey, so she compared three suppliers. The first was the cheapest, but the delivery took six weeks. The second was more expensive, and its panels were the most powerful of the three. The third had the best guarantee: five years instead of two. In the end she chose the third one, because a long guarantee mattered more to her than the price.",
              questions: [
                {
                  prompt: 'What was the problem with the first supplier?',
                  options: ['The panels were weak', 'The delivery took six weeks', 'There was no guarantee', 'The shop was too far'],
                  answer: 1,
                  explanation: '« The first was the cheapest, but the delivery took six weeks. »',
                },
                {
                  prompt: 'Which supplier did Aïcha choose?',
                  options: ['The first', 'The second', 'The third', 'None of them'],
                  answer: 2,
                  explanation: '« In the end she chose the third one. »',
                },
                {
                  prompt: 'Why did she choose it?',
                  options: ['It was the cheapest', 'It had the best guarantee', 'It delivered fastest', 'It was the closest'],
                  answer: 1,
                  explanation: '« The third had the best guarantee … a long guarantee mattered more to her than the price. »',
                },
              ],
            },
          },
        ],
      },
      {
        id: 'gen-a2-u5',
        title: 'Quantités et courses',
        subtitle: 'Compter, mesurer, acheter',
        icon: '🛒',
        lessons: [
          {
            id: 'gen-a2-u5-l1',
            title: 'Dénombrable ou non ?',
            objective: 'Choisir entre some, any, much et many.',
            intro:
              "L'anglais sépare ce qui se compte (two bags) de ce qui ne se compte pas (some water). Cette distinction commande le choix entre « much » et « many », et l'emploi de « some » ou « any ».",
            note: {
              title: 'some ou any ?',
              body: "« some » s'emploie dans les phrases affirmatives et dans les offres polies ; « any » dans les négations et dans la plupart des questions.",
              examples: [
                { en: 'I need some sugar.', fr: 'J’ai besoin de sucre.' },
                { en: 'We don’t have any milk.', fr: 'Nous n’avons pas de lait.' },
              ],
            },
            vocab: [
              ['some', 'du / de la / des', 'adj'],
              ['any', 'aucun / du (nég. et quest.)', 'adj'],
              ['much', 'beaucoup (indénombrable)', 'adj'],
              ['many', 'beaucoup (dénombrable)', 'adj'],
              ['a few', 'quelques', 'phrase'],
              ['a little', 'un peu de', 'phrase'],
              ['bottle', 'bouteille', 'n'],
              ['bag', 'sac', 'n'],
              ['rice', 'riz', 'n'],
            ],
            sentences: [
              ['I need some rice and two bottles of water.', 'J’ai besoin de riz et de deux bouteilles d’eau.'],
              ['We don’t have any sugar left.', 'Il ne nous reste plus de sucre.'],
              ['How many bags do you want?', 'Combien de sacs voulez-vous ?'],
            ],
            grammar: [
              {
                topicId: 'quantifier-many',
                title: 'many + dénombrable',
                rule: "« many » se place devant un nom qui se compte : « many bags ». Devant un nom qui ne se compte pas, on emploie « much ».",
                en: 'How many bags do you need?',
                fr: 'Combien de sacs vous faut-il ?',
                wrong: [
                  'How much bags do you need?',
                  'How many bag do you need?',
                  'How many bags you need?',
                ],
                blank: 'many',
              },
              {
                topicId: 'quantifier-much',
                title: 'much + indénombrable',
                rule: "« much » accompagne ce qui ne se compte pas : « much water ». Le nom reste au singulier.",
                en: 'We do not have much water.',
                fr: 'Nous n’avons pas beaucoup d’eau.',
                wrong: [
                  'We do not have many water.',
                  'We do not have much waters.',
                  'We do not have a much water.',
                ],
                blank: 'much',
              },
              {
                topicId: 'quantifier-any',
                title: 'any dans la négation',
                rule: "Dans une phrase négative, « some » devient « any » : « I don't have any money ».",
                en: 'I do not have any money today.',
                fr: 'Je n’ai pas d’argent aujourd’hui.',
                wrong: [
                  'I do not have some money today.',
                  'I do not have no money today.',
                  'I do not have any moneys today.',
                ],
                blank: 'any',
              },
            ],
          },
          {
            id: 'gen-a2-u5-l2',
            title: 'Au marché',
            objective: 'Demander un prix, négocier, payer.',
            intro:
              "Au marché comme en boutique, quelques formules reviennent toujours : demander le prix, annoncer une quantité, proposer un autre montant et réclamer un reçu.",
            vocab: [
              ['How much is it?', 'Combien ça coûte ?', 'phrase'],
              ['price', 'prix', 'n'],
              ['cash', 'espèces', 'n'],
              ['change', 'monnaie', 'n'],
              ['receipt', 'reçu', 'n'],
              ['discount', 'remise', 'n'],
              ['too expensive', 'trop cher', 'phrase'],
              ['each', 'chacun / la pièce', 'adv'],
            ],
            sentences: [
              ['How much is this bag?', 'Combien coûte ce sac ?'],
              ['Can you give me a discount?', 'Pouvez-vous me faire une remise ?'],
              ['I’ll take two, please.', 'J’en prends deux, s’il vous plaît.'],
            ],
            grammar: [
              {
                topicId: 'how-much-price',
                title: '« How much » pour un prix',
                rule: "Pour demander un prix, l'anglais dit « How much is …? ». « How many » compterait des objets, pas de l'argent.",
                en: 'How much is this bag?',
                fr: 'Combien coûte ce sac ?',
                wrong: [
                  'How many is this bag?',
                  'How much this bag is?',
                  'How much cost this bag?',
                ],
                blank: 'How much',
              },
            ],
            dialogue: {
              context: 'Au grand marché de Niamey, Salif achète du tissu.',
              lines: [
                { speaker: 'Salif', en: 'Good morning. How much is this fabric?', fr: 'Bonjour. Combien coûte ce tissu ?' },
                { speaker: 'Vendor', en: 'It is twelve thousand francs for six metres.', fr: 'Douze mille francs les six mètres.' },
                { speaker: 'Salif', en: 'That is a bit too expensive for me. Can you do ten thousand?', fr: 'C’est un peu trop cher pour moi. Vous pouvez faire dix mille ?' },
                { speaker: 'Vendor', en: 'Eleven thousand, and I will add a metre.', fr: 'Onze mille, et j’ajoute un mètre.' },
                { speaker: 'Salif', en: 'That works. Here is the cash. Can I have a receipt?', fr: 'Ça me va. Voici les espèces. Puis-je avoir un reçu ?' },
              ],
              statements: [
                { en: 'Salif pays twelve thousand francs.', isTrue: false, explanation: 'Ils s’accordent sur onze mille francs.' },
                { en: 'The vendor offers an extra metre of fabric.', isTrue: true, explanation: '« Eleven thousand, and I will add a metre. »' },
                { en: 'Salif asks for a receipt.', isTrue: true, explanation: '« Can I have a receipt? »' },
              ],
            },
          },
        ],
      },
      {
        id: 'gen-a2-u6',
        title: 'Le passé qui dure',
        subtitle: 'Poser le décor d’un récit',
        icon: '⏳',
        lessons: [
          {
            id: 'gen-a2-u6-l1',
            title: 'Ce qui était en cours',
            objective: 'Décrire une action en cours dans le passé, interrompue par une autre.',
            intro:
              "Le past continuous (was / were + verbe en -ing) décrit une action en train de se dérouler à un moment du passé. Il sert de décor à une action soudaine, elle au past simple.",
            note: {
              title: 'when et while',
              body: "« while » introduit l'action longue, « when » l'action courte qui l'interrompt : « While I was working, the phone rang. »",
              examples: [
                { en: 'While I was working, the power went off.', fr: 'Pendant que je travaillais, le courant a été coupé.' },
              ],
            },
            vocab: [
              ['while', 'pendant que', 'prep'],
              ['suddenly', 'soudain', 'adv'],
              ['power cut', 'coupure de courant', 'n'],
              ['wait', 'attendre', 'v'],
              ['drive', 'conduire', 'v'],
              ['ring', 'sonner', 'v'],
              ['happen', 'se passer', 'v'],
              ['noise', 'bruit', 'n'],
            ],
            sentences: [
              ['I was working when the power went off.', 'Je travaillais quand le courant a été coupé.'],
              ['They were waiting outside while it was raining.', 'Ils attendaient dehors pendant qu’il pleuvait.'],
              ['What were you doing at eight o’clock?', 'Que faisiez-vous à huit heures ?'],
            ],
            grammar: [
              {
                topicId: 'past-continuous-form',
                title: 'was / were + -ing',
                rule: "Le past continuous se forme avec « was » (I, he, she, it) ou « were » (you, we, they), suivi du verbe en -ing.",
                en: 'I was working when the power went off.',
                fr: 'Je travaillais quand le courant a été coupé.',
                wrong: [
                  'I were working when the power went off.',
                  'I was work when the power went off.',
                  'I was working when the power was go off.',
                ],
                blank: 'was working',
              },
              {
                topicId: 'past-continuous-vs-simple',
                title: 'Action longue, action courte',
                rule: "L'action qui dure va au past continuous, celle qui l'interrompt au past simple.",
                en: 'She called while I was driving.',
                fr: 'Elle a appelé pendant que je conduisais.',
                wrong: [
                  'She was calling while I drove.',
                  'She called while I drive.',
                  'She call while I was driving.',
                ],
                blank: 'was driving',
              },
            ],
          },
        ],
      },
      {
        id: 'gen-a2-u7',
        title: 'Ce qu’on a déjà fait',
        subtitle: 'Le present perfect',
        icon: '✅',
        lessons: [
          {
            id: 'gen-a2-u7-l1',
            title: 'Present perfect : l’expérience',
            objective: 'Parler d’une expérience sans préciser quand.',
            intro:
              "Le present perfect (have / has + participe passé) relie le passé au présent : ce qui compte est l'expérience, pas la date. « I have visited Ghana » — peu importe quand.",
            note: {
              title: 'Le participe passé',
              body: "Régulier : -ed (worked). Irrégulier : la troisième forme du verbe (go → went → gone, see → saw → seen, be → was → been).",
              examples: [
                { en: 'I have never been to London.', fr: 'Je ne suis jamais allé à Londres.' },
              ],
            },
            vocab: [
              ['ever', 'déjà (dans une question)', 'adv'],
              ['never', 'jamais', 'adv'],
              ['already', 'déjà', 'adv'],
              ['just', 'à peine / juste', 'adv'],
              ['been', 'été / allé (participe)', 'v'],
              ['gone', 'allé (participe)', 'v'],
              ['seen', 'vu (participe)', 'v'],
              ['done', 'fait (participe)', 'v'],
            ],
            sentences: [
              ['I have never been to London.', 'Je ne suis jamais allé à Londres.'],
              ['Have you ever worked abroad?', 'Avez-vous déjà travaillé à l’étranger ?'],
              ['She has just finished the report.', 'Elle vient de terminer le rapport.'],
            ],
            grammar: [
              {
                topicId: 'present-perfect-form',
                title: 'have / has + participe passé',
                rule: "« have » pour I, you, we, they ; « has » pour he, she, it. Le verbe se met au participe passé, jamais à l'infinitif.",
                en: 'She has finished the report.',
                fr: 'Elle a terminé le rapport.',
                wrong: [
                  'She have finished the report.',
                  'She has finish the report.',
                  'She has finishing the report.',
                ],
                blank: 'has finished',
              },
              {
                topicId: 'present-perfect-ever',
                title: 'ever dans la question',
                rule: "« ever » se place entre le sujet et le participe passé : « Have you ever worked…? ».",
                en: 'Have you ever worked abroad?',
                fr: 'Avez-vous déjà travaillé à l’étranger ?',
                wrong: [
                  'Have you ever work abroad?',
                  'Did you have ever worked abroad?',
                  'Have you worked ever abroad?',
                ],
                blank: 'ever worked',
              },
            ],
          },
          {
            id: 'gen-a2-u7-l2',
            title: 'for, since, already, yet',
            objective: 'Situer une durée et nuancer ce qui est fait ou reste à faire.',
            intro:
              "« for » introduit une durée (for three years), « since » un point de départ (since 2019). « already » marque ce qui est fait plus tôt que prévu, « yet » ce qui manque encore.",
            vocab: [
              ['for', 'depuis (durée)', 'prep'],
              ['since', 'depuis (date)', 'prep'],
              ['so far', 'jusqu’ici', 'phrase'],
              ['recently', 'récemment', 'adv'],
              ['twice', 'deux fois', 'adv'],
              ['abroad', 'à l’étranger', 'adv'],
              ['experience', 'expérience', 'n'],
              ['contract', 'contrat', 'n'],
            ],
            sentences: [
              ['I have worked here for three years.', 'Je travaille ici depuis trois ans.'],
              ['She has lived in Niamey since 2019.', 'Elle vit à Niamey depuis 2019.'],
              ['They haven’t signed the contract yet.', 'Ils n’ont pas encore signé le contrat.'],
            ],
            grammar: [
              {
                topicId: 'for-vs-since',
                title: 'for ou since ?',
                rule: "« for » précède une durée (for three years) ; « since » précède un point de départ (since 2019).",
                en: 'I have worked here for three years.',
                fr: 'Je travaille ici depuis trois ans.',
                wrong: [
                  'I have worked here since three years.',
                  'I have worked here for 2019.',
                  'I work here for three years.',
                ],
                blank: 'for three years',
              },
              {
                topicId: 'yet-position',
                title: '« yet » en fin de phrase',
                rule: "Dans une phrase négative, « yet » se place à la fin : « They haven't signed it yet ».",
                en: 'They have not signed the contract yet.',
                fr: 'Ils n’ont pas encore signé le contrat.',
                wrong: [
                  'They have not yet signed the contract already.',
                  'They have not signed yet the contract.',
                  'They do not have signed the contract yet.',
                ],
                blank: 'yet',
              },
            ],
            reading: {
              title: 'A reputation built slowly',
              text: "Fatouma has run a small catering business in Niamey since 2019. She has never advertised on television, but she has built a strong reputation through word of mouth. Last year she hired two assistants. So far she has served more than two hundred weddings. She has not opened a second kitchen yet, but she has already found the building.",
              questions: [
                {
                  prompt: 'When did Fatouma start her business?',
                  options: ['In 2019', 'Last year', 'Two hundred weddings ago', 'She has not started yet'],
                  answer: 0,
                  explanation: '« has run a small catering business in Niamey since 2019 ».',
                },
                {
                  prompt: 'How has she become known?',
                  options: ['Through television advertising', 'Through word of mouth', 'Through a newspaper', 'Through a second kitchen'],
                  answer: 1,
                  explanation: '« she has built a strong reputation through word of mouth ».',
                },
                {
                  prompt: 'What has she NOT done yet?',
                  options: ['Hired assistants', 'Served weddings', 'Opened a second kitchen', 'Found a building'],
                  answer: 2,
                  explanation: '« She has not opened a second kitchen yet ».',
                },
              ],
            },
          },
        ],
      },
    ],
  },
];
