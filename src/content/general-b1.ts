import type { SectionSpec } from './builder';

/** Anglais général — Niveau B1 (seuil).
 *
 *  C'est le niveau où l'apprenant cesse de juxtaposer des phrases et commence à
 *  nuancer : choisir entre deux passés, poser une hypothèse, rapporter des
 *  propos, effacer l'acteur d'une action. Le contenu reste des DONNÉES : le
 *  moteur en dérive seul les onze types d'exercices.
 */
export const GENERAL_B1: SectionSpec[] = [
  {
    id: 'gen-b1-s1',
    title: 'Nuancer le récit',
    units: [
      {
        id: 'gen-b1-u1',
        title: 'Deux passés',
        subtitle: 'Present perfect ou past simple ?',
        icon: '⚖️',
        lessons: [
          {
            id: 'gen-b1-u1-l1',
            title: 'Le choix qui trahit le niveau',
            objective: 'Choisir le temps juste selon que le moment est précisé ou non.',
            intro:
              "La règle est nette et sans exception : dès qu'un moment précis du passé est mentionné (yesterday, in 2019, last week), on emploie le past simple. Sans repère daté, ou quand la période est encore en cours, c'est le present perfect.",
            note: {
              title: 'Le test du « quand »',
              body: "Si la phrase répond à « quand ? », c'est du past simple. Si elle répond à « est-ce déjà arrivé ? » ou « où en est-on ? », c'est du present perfect.",
              examples: [
                { en: 'I saw him yesterday.', fr: 'Je l’ai vu hier.' },
                { en: 'I have seen him twice.', fr: 'Je l’ai vu deux fois.' },
              ],
            },
            vocab: [
              ['lately', 'dernièrement', 'adv'],
              ['once', 'une fois', 'adv'],
              ['achievement', 'réalisation', 'n'],
              ['deadline', 'échéance', 'n'],
              ['improve', 'améliorer', 'v'],
              ['launch', 'lancer', 'v'],
              ['deliver', 'livrer', 'v'],
              ['increase', 'augmenter', 'v'],
            ],
            sentences: [
              ['We launched the product in March.', 'Nous avons lancé le produit en mars.'],
              ['We have launched three products this year.', 'Nous avons lancé trois produits cette année.'],
              ['Sales have improved a lot lately.', 'Les ventes se sont beaucoup améliorées dernièrement.'],
            ],
            grammar: [
              {
                topicId: 'perfect-vs-past-marker',
                title: 'Un repère daté impose le past simple',
                rule: "Avec « yesterday », « last week », « in 2019 », le present perfect devient impossible : on emploie le past simple.",
                en: 'We launched the product in March.',
                fr: 'Nous avons lancé le produit en mars.',
                wrong: [
                  'We have launched the product in March.',
                  'We have launch the product in March.',
                  'We did launched the product in March.',
                ],
                blank: 'launched',
              },
              {
                topicId: 'perfect-unfinished-period',
                title: 'Période en cours : present perfect',
                rule: "« this year », « today », « this week » désignent une période non terminée : le present perfect s'impose.",
                en: 'We have signed four contracts this year.',
                fr: 'Nous avons signé quatre contrats cette année.',
                wrong: [
                  'We have sign four contracts this year.',
                  'We has signed four contracts this year.',
                  'We are signed four contracts this year.',
                ],
                blank: 'have signed',
              },
            ],
          },
          {
            id: 'gen-b1-u1-l2',
            title: 'Present perfect continu',
            objective: 'Insister sur la durée plutôt que sur le résultat.',
            intro:
              "« have been + -ing » met l'accent sur la durée ou sur l'activité elle-même, là où le present perfect simple met l'accent sur le résultat obtenu.",
            note: {
              title: 'Résultat ou durée ?',
              body: "I have written three emails. (le résultat : trois e-mails) · I have been writing emails all morning. (la durée : toute la matinée)",
              examples: [
                { en: 'She has been working here since January.', fr: 'Elle travaille ici depuis janvier.' },
              ],
            },
            vocab: [
              ['all morning', 'toute la matinée', 'phrase'],
              ['constantly', 'sans arrêt', 'adv'],
              ['progress', 'progrès', 'n'],
              ['negotiate', 'négocier', 'v'],
              ['prepare', 'préparer', 'v'],
              ['train', 'former', 'v'],
              ['grow', 'croître', 'v'],
              ['effort', 'effort', 'n'],
            ],
            sentences: [
              ['I have been working on this file all morning.', 'Je travaille sur ce dossier depuis ce matin.'],
              ['They have been negotiating for three weeks.', 'Ils négocient depuis trois semaines.'],
              ['How long have you been learning English?', 'Depuis combien de temps apprenez-vous l’anglais ?'],
            ],
            grammar: [
              {
                topicId: 'perfect-continuous-form',
                title: 'have been + -ing',
                rule: "La forme est invariable : have / has, puis « been », puis le verbe en -ing. « been » ne disparaît jamais.",
                en: 'I have been working on this file all morning.',
                fr: 'Je travaille sur ce dossier depuis ce matin.',
                wrong: [
                  'I have working on this file all morning.',
                  'I have been work on this file all morning.',
                  'I am been working on this file all morning.',
                ],
                blank: 'have been working',
              },
              {
                topicId: 'how-long-perfect',
                title: '« How long » appelle le present perfect',
                rule: "Pour demander depuis quand, l'anglais emploie « How long » avec le present perfect, jamais le présent simple.",
                en: 'How long have you been learning English?',
                fr: 'Depuis combien de temps apprenez-vous l’anglais ?',
                wrong: [
                  'How long do you learn English?',
                  'How long are you learning English?',
                  'How long you have been learning English?',
                ],
                blank: 'have you been learning',
              },
            ],
          },
        ],
      },
      {
        id: 'gen-b1-u2',
        title: 'Hypothèses',
        subtitle: 'Les conditionnelles',
        icon: '🔀',
        lessons: [
          {
            id: 'gen-b1-u2-l1',
            title: 'Le premier conditionnel',
            objective: 'Exprimer une condition réaliste et sa conséquence.',
            intro:
              "Le premier conditionnel décrit une situation possible dans le futur : « If + présent, will + verbe ». Le piège classique consiste à mettre « will » des deux côtés.",
            note: {
              title: 'Jamais « will » après « if »',
              body: "On dit « If it rains, we will cancel », jamais « If it will rain ». La subordonnée introduite par « if » reste au présent.",
              examples: [
                { en: 'If the bank agrees, we will start in June.', fr: 'Si la banque accepte, nous commencerons en juin.' },
              ],
            },
            vocab: [
              ['unless', 'à moins que', 'prep'],
              ['agree', 'accepter', 'v'],
              ['refuse', 'refuser', 'v'],
              ['delay', 'retard / retarder', 'n'],
              ['budget', 'budget', 'n'],
              ['approve', 'approuver', 'v'],
              ['cancel', 'annuler', 'v'],
              ['on time', 'à temps', 'phrase'],
            ],
            sentences: [
              ['If the bank agrees, we will start in June.', 'Si la banque accepte, nous commencerons en juin.'],
              ['We will lose the client unless we deliver on time.', 'Nous perdrons le client à moins de livrer à temps.'],
              ['If it rains tomorrow, the delivery will be late.', 'S’il pleut demain, la livraison sera en retard.'],
            ],
            grammar: [
              {
                topicId: 'first-conditional',
                title: 'If + présent, will + base verbale',
                rule: "Après « if », le verbe reste au présent ; « will » n'apparaît que dans la proposition principale.",
                en: 'If the bank agrees, we will start in June.',
                fr: 'Si la banque accepte, nous commencerons en juin.',
                wrong: [
                  'If the bank will agree, we will start in June.',
                  'If the bank agree, we will start in June.',
                  'If the bank agrees, we would start in June.',
                ],
                blank: 'agrees',
              },
              {
                topicId: 'unless',
                title: '« unless » contient déjà la négation',
                rule: "« unless we deliver » signifie « si nous ne livrons pas ». On n'ajoute donc jamais « not » derrière « unless ».",
                en: 'We will lose the client unless we deliver on time.',
                fr: 'Nous perdrons le client à moins de livrer à temps.',
                wrong: [
                  'We will lose the client unless we do not deliver on time.',
                  'We will lose the client unless we will deliver on time.',
                  'We will lose the client if unless we deliver on time.',
                ],
                blank: 'unless',
              },
            ],
          },
          {
            id: 'gen-b1-u2-l2',
            title: 'Le deuxième conditionnel',
            objective: 'Parler d’une situation imaginaire ou peu probable.',
            intro:
              "Le deuxième conditionnel décrit l'irréel du présent : « If + prétérit, would + verbe ». Le passé n'y désigne pas le passé, mais l'hypothèse.",
            note: {
              title: '« If I were »',
              body: "À la première et à la troisième personne, l'anglais soigné emploie « were » et non « was » : « If I were you… ».",
              examples: [
                { en: 'If I were you, I would ask for a discount.', fr: 'À votre place, je demanderais une remise.' },
              ],
            },
            vocab: [
              ['imagine', 'imaginer', 'v'],
              ['afford', 'avoir les moyens de', 'v'],
              ['invest', 'investir', 'v'],
              ['risk', 'risque', 'n'],
              ['opportunity', 'occasion', 'n'],
              ['advice', 'conseil', 'n'],
              ['choice', 'choix', 'n'],
              ['rate', 'taux', 'n'],
            ],
            sentences: [
              ['If I had more time, I would learn Spanish too.', 'Si j’avais plus de temps, j’apprendrais aussi l’espagnol.'],
              ['If I were you, I would ask for a discount.', 'À votre place, je demanderais une remise.'],
              ['We would invest more if the rates were lower.', 'Nous investirions davantage si les taux étaient plus bas.'],
            ],
            grammar: [
              {
                topicId: 'second-conditional',
                title: 'If + prétérit, would + base verbale',
                rule: "Après « if », le prétérit marque l'hypothèse ; « would » n'apparaît que dans la principale, suivi de la base verbale.",
                en: 'If I had more time, I would learn Spanish.',
                fr: 'Si j’avais plus de temps, j’apprendrais l’espagnol.',
                wrong: [
                  'If I would have more time, I would learn Spanish.',
                  'If I had more time, I will learn Spanish.',
                  'If I have more time, I would learn Spanish.',
                ],
                blank: 'would learn',
              },
              {
                topicId: 'if-i-were-you',
                title: '« If I were you »',
                rule: "Pour donner un conseil, l'anglais fige la formule « If I were you » ; « was » y est tenu pour incorrect.",
                en: 'If I were you, I would ask for a discount.',
                fr: 'À votre place, je demanderais une remise.',
                wrong: [
                  'If I was you, I would ask for a discount.',
                  'If I am you, I would ask for a discount.',
                  'If I were you, I will ask for a discount.',
                ],
                blank: 'were',
              },
            ],
          },
        ],
      },
      {
        id: 'gen-b1-u3',
        title: 'Devoir, pouvoir, supposer',
        subtitle: 'Les modaux au quotidien',
        icon: '🔑',
        lessons: [
          {
            id: 'gen-b1-u3-l1',
            title: 'Obligation et interdiction',
            objective: 'Dire ce qui est obligatoire, interdit ou simplement facultatif.',
            intro:
              "« must » exprime une obligation ressentie par celui qui parle ; « have to » une obligation imposée de l'extérieur. La négation change tout : « mustn't » interdit, « don't have to » libère.",
            note: {
              title: 'mustn’t n’est pas don’t have to',
              body: "You mustn’t park here. (c’est interdit) · You don’t have to park here. (ce n’est pas obligatoire)",
              examples: [
                { en: 'Visitors must wear a badge.', fr: 'Les visiteurs doivent porter un badge.' },
              ],
            },
            vocab: [
              ['must', 'devoir', 'v'],
              ['have to', 'être obligé de', 'phrase'],
              ['allowed', 'autorisé', 'adj'],
              ['forbidden', 'interdit', 'adj'],
              ['rule', 'règle', 'n'],
              ['safety', 'sécurité', 'n'],
              ['badge', 'badge', 'n'],
              ['permission', 'autorisation', 'n'],
            ],
            sentences: [
              ['Visitors must wear a badge at all times.', 'Les visiteurs doivent porter un badge en permanence.'],
              ['You do not have to come on Saturday.', 'Vous n’êtes pas obligé de venir samedi.'],
              ['We must not share these figures outside the company.', 'Nous ne devons pas communiquer ces chiffres hors de l’entreprise.'],
            ],
            grammar: [
              {
                topicId: 'must-base',
                title: '« must » + base verbale',
                rule: "« must » ne prend jamais « to » ni « -s » : « He must sign », jamais « He musts to sign ».",
                en: 'Visitors must wear a badge.',
                fr: 'Les visiteurs doivent porter un badge.',
                wrong: [
                  'Visitors must to wear a badge.',
                  'Visitors musts wear a badge.',
                  'Visitors must wearing a badge.',
                ],
                blank: 'must wear',
              },
              {
                topicId: 'dont-have-to',
                title: '« do not have to » n’interdit rien',
                rule: "« do not have to » signifie « ce n'est pas obligatoire ». Pour interdire, il faut « must not ».",
                en: 'You do not have to come on Saturday.',
                fr: 'Vous n’êtes pas obligé de venir samedi.',
                wrong: [
                  'You do not must come on Saturday.',
                  'You have not to come on Saturday.',
                  'You do not have come on Saturday.',
                ],
                blank: 'do not have to',
              },
            ],
          },
          {
            id: 'gen-b1-u3-l2',
            title: 'Probabilité et déduction',
            objective: 'Graduer une certitude : must, might, may, can’t.',
            intro:
              "L'anglais gradue la certitude par les modaux : « must » pour une déduction quasi certaine, « might » ou « may » pour une simple possibilité, « can't » pour une impossibilité logique.",
            note: {
              title: 'L’échelle de certitude',
              body: "It must be true. (presque certain) · It might be true. (possible) · It can’t be true. (impossible)",
              examples: [
                { en: 'He must be at the airport by now.', fr: 'Il doit être à l’aéroport à présent.' },
              ],
            },
            vocab: [
              ['might', 'il se pourrait que', 'v'],
              ['may', 'il est possible que', 'v'],
              ['certain', 'certain', 'adj'],
              ['likely', 'probable', 'adj'],
              ['unlikely', 'peu probable', 'adj'],
              ['guess', 'deviner', 'v'],
              ['assume', 'supposer', 'v'],
              ['evidence', 'preuve', 'n'],
            ],
            sentences: [
              ['He must be at the airport by now.', 'Il doit être à l’aéroport à présent.'],
              ['She might call us this afternoon.', 'Elle nous appellera peut-être cet après-midi.'],
              ['That cannot be the right address.', 'Ce ne peut pas être la bonne adresse.'],
            ],
            grammar: [
              {
                topicId: 'modal-deduction-must',
                title: '« must » de déduction',
                rule: "« must » exprime aussi une déduction logique : « He must be tired » signifie « il doit être fatigué », et non une obligation.",
                en: 'He must be at the airport by now.',
                fr: 'Il doit être à l’aéroport à présent.',
                wrong: [
                  'He must to be at the airport by now.',
                  'He must being at the airport by now.',
                  'He musts be at the airport by now.',
                ],
                blank: 'must be',
              },
              {
                topicId: 'modal-might',
                title: '« might » + base verbale',
                rule: "« might » et « may » se construisent sans « to » et ne s'accordent jamais : « She might call ».",
                en: 'She might call us this afternoon.',
                fr: 'Elle nous appellera peut-être cet après-midi.',
                wrong: [
                  'She might to call us this afternoon.',
                  'She mights call us this afternoon.',
                  'She might calls us this afternoon.',
                ],
                blank: 'might call',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'gen-b1-s2',
    title: 'Relier, rapporter, transformer',
    units: [
      {
        id: 'gen-b1-u4',
        title: 'Les relatives',
        subtitle: 'who, which, where, whose',
        icon: '🔗',
        lessons: [
          {
            id: 'gen-b1-u4-l1',
            title: 'Préciser de qui l’on parle',
            objective: 'Relier deux informations en une seule phrase.',
            intro:
              "La relative précise de qui ou de quoi l'on parle : « who » pour une personne, « which » pour une chose, « that » pour les deux. « where » désigne un lieu et « whose » la possession.",
            note: {
              title: 'Le pronom qui peut disparaître',
              body: "Quand le relatif est complément, on peut l'omettre : « the man (whom) I met ». Quand il est sujet, jamais : « the man who called me ».",
              examples: [
                { en: 'The supplier who called yesterday is from Accra.', fr: 'Le fournisseur qui a appelé hier vient d’Accra.' },
              ],
            },
            vocab: [
              ['who', 'qui (personne)', 'phrase'],
              ['which', 'qui / que (chose)', 'phrase'],
              ['whose', 'dont / à qui', 'phrase'],
              ['warehouse', 'entrepôt', 'n'],
              ['colleague', 'collègue', 'n'],
              ['document', 'document', 'n'],
              ['store', 'stocker', 'v'],
              ['client', 'client', 'n'],
            ],
            sentences: [
              ['The supplier who called yesterday is from Accra.', 'Le fournisseur qui a appelé hier vient d’Accra.'],
              ['This is the warehouse where we store the panels.', 'Voici l’entrepôt où nous stockons les panneaux.'],
              ['The client whose office we visited signed today.', 'Le client dont nous avons visité le bureau a signé aujourd’hui.'],
            ],
            grammar: [
              {
                topicId: 'relative-who',
                title: '« who » pour les personnes',
                rule: "« who » remplace une personne sujet de la relative : « the man who called ». « which » est réservé aux choses.",
                en: 'The supplier who called yesterday is from Accra.',
                fr: 'Le fournisseur qui a appelé hier vient d’Accra.',
                wrong: [
                  'The supplier which called yesterday is from Accra.',
                  'The supplier who he called yesterday is from Accra.',
                  'The supplier what called yesterday is from Accra.',
                ],
                blank: 'who',
              },
              {
                topicId: 'relative-where',
                title: '« where » pour les lieux',
                rule: "Pour un lieu, l'anglais emploie « where » : « the office where I work ». « which » exigerait une préposition.",
                en: 'This is the warehouse where we store the panels.',
                fr: 'Voici l’entrepôt où nous stockons les panneaux.',
                wrong: [
                  'This is the warehouse which we store the panels.',
                  'This is the warehouse who we store the panels.',
                  'This is the warehouse where we store there the panels.',
                ],
                blank: 'where',
              },
            ],
          },
        ],
      },
      {
        id: 'gen-b1-u5',
        title: 'Rapporter des propos',
        subtitle: 'Le discours indirect',
        icon: '💬',
        lessons: [
          {
            id: 'gen-b1-u5-l1',
            title: 'Dire ce que l’autre a dit',
            objective: 'Rapporter fidèlement les propos de quelqu’un.',
            intro:
              "Rapporter, c'est reculer d'un cran dans le temps : le présent devient prétérit, le prétérit devient past perfect, « will » devient « would ». Les pronoms et les repères de temps suivent le même recul.",
            note: {
              title: 'Le recul des temps',
              body: "« I am busy » → He said he was busy. · « I will call » → He said he would call. · « yesterday » → the day before.",
              examples: [
                { en: 'She said she was waiting outside.', fr: 'Elle a dit qu’elle attendait dehors.' },
              ],
            },
            vocab: [
              ['tell', 'dire à', 'v'],
              ['explain', 'expliquer', 'v'],
              ['mention', 'mentionner', 'v'],
              ['reply', 'répondre', 'v'],
              ['promise', 'promettre', 'v'],
              ['whether', 'si (interrogation)', 'prep'],
              ['invoice', 'facture', 'n'],
              ['auditor', 'auditeur', 'n'],
            ],
            sentences: [
              ['He said he was busy that morning.', 'Il a dit qu’il était occupé ce matin-là.'],
              ['She told me she would send the invoice.', 'Elle m’a dit qu’elle enverrait la facture.'],
              ['They asked whether we could deliver earlier.', 'Ils ont demandé si nous pouvions livrer plus tôt.'],
            ],
            grammar: [
              {
                topicId: 'reported-backshift',
                title: 'Le recul des temps',
                rule: "Au discours indirect, le présent devient prétérit : « I am busy » donne « he said he was busy ».",
                en: 'He said he was busy that morning.',
                fr: 'Il a dit qu’il était occupé ce matin-là.',
                wrong: [
                  'He said he is busy that morning.',
                  'He said he has been busy that morning.',
                  'He said that he being busy that morning.',
                ],
                blank: 'was busy',
              },
              {
                topicId: 'say-vs-tell',
                title: 'say ou tell ?',
                rule: "« tell » exige un destinataire (« tell me ») ; « say » n'en prend pas (« say that »). On ne dit jamais « he told that ».",
                en: 'She told me she would send the invoice.',
                fr: 'Elle m’a dit qu’elle enverrait la facture.',
                wrong: [
                  'She said me she would send the invoice.',
                  'She told she would send the invoice.',
                  'She told to me she would send the invoice.',
                ],
                blank: 'told me',
              },
            ],
            dialogue: {
              context: 'À la sortie d’une réunion, Awa résume à son collègue ce que le client vient de dire.',
              lines: [
                { speaker: 'Awa', en: 'I have just spoken to the client.', fr: 'Je viens de parler au client.' },
                { speaker: 'Moussa', en: 'What did he say?', fr: 'Qu’a-t-il dit ?' },
                { speaker: 'Awa', en: 'He said the budget was approved, but he told me the deadline had changed.', fr: 'Il a dit que le budget était approuvé, mais il m’a dit que l’échéance avait changé.' },
                { speaker: 'Moussa', en: 'Did he explain why?', fr: 'A-t-il expliqué pourquoi ?' },
                { speaker: 'Awa', en: 'He explained that their auditor would arrive in March, so everything must be ready before then.', fr: 'Il a expliqué que leur auditeur arriverait en mars, donc tout doit être prêt avant.' },
              ],
              statements: [
                { en: 'The budget was refused.', isTrue: false, explanation: 'Awa rapporte « the budget was approved ».' },
                { en: 'The deadline has changed.', isTrue: true, explanation: '« he told me the deadline had changed ».' },
                { en: 'The auditor will arrive in March.', isTrue: true, explanation: '« their auditor would arrive in March ».' },
              ],
            },
          },
        ],
      },
      {
        id: 'gen-b1-u6',
        title: 'La voix passive',
        subtitle: 'Quand l’acteur importe peu',
        icon: '🔄',
        lessons: [
          {
            id: 'gen-b1-u6-l1',
            title: 'Mettre l’action en avant',
            objective: 'Employer le passif là où l’auteur de l’action n’est pas le sujet du propos.',
            intro:
              "Le passif se forme avec « be » au temps voulu, suivi du participe passé. Il s'impose quand l'auteur de l'action est inconnu, évident ou sans importance — un usage très fréquent à l'écrit professionnel.",
            note: {
              title: 'Le complément d’agent',
              body: "Il n'apparaît que s'il apporte une information utile : « The report was written by our auditor ». Sinon on l'omet purement et simplement.",
              examples: [
                { en: 'The contract was signed last week.', fr: 'Le contrat a été signé la semaine dernière.' },
              ],
            },
            vocab: [
              ['be built', 'être construit', 'phrase'],
              ['be sent', 'être envoyé', 'phrase'],
              ['be signed', 'être signé', 'phrase'],
              ['by', 'par', 'prep'],
              ['inspect', 'inspecter', 'v'],
              ['repair', 'réparer', 'v'],
              ['engineer', 'ingénieur', 'n'],
              ['traffic', 'circulation', 'n'],
            ],
            sentences: [
              ['The contract was signed last week.', 'Le contrat a été signé la semaine dernière.'],
              ['The reports are sent every Monday.', 'Les rapports sont envoyés tous les lundis.'],
              ['The road is being repaired at the moment.', 'La route est en cours de réparation.'],
            ],
            grammar: [
              {
                topicId: 'passive-form',
                title: 'be + participe passé',
                rule: "Le passif se construit toujours avec « be » conjugué, suivi du participe passé : « was signed », « are sent ».",
                en: 'The contract was signed last week.',
                fr: 'Le contrat a été signé la semaine dernière.',
                wrong: [
                  'The contract was sign last week.',
                  'The contract is signed last week.',
                  'The contract has signed last week.',
                ],
                blank: 'was signed',
              },
              {
                topicId: 'passive-agent',
                title: '« by » introduit l’agent',
                rule: "L'auteur de l'action, lorsqu'il est mentionné, est introduit par « by » : « written by our auditor ».",
                en: 'The report was written by our auditor.',
                fr: 'Le rapport a été rédigé par notre auditeur.',
                wrong: [
                  'The report was written from our auditor.',
                  'The report was written of our auditor.',
                  'The report was wrote by our auditor.',
                ],
                blank: 'by our auditor',
              },
            ],
            reading: {
              title: 'How the bridge was built',
              text: "The new bridge over the river was designed by a team of engineers from three countries. Work started in 2021 and was interrupted twice by the rainy season. More than four hundred workers were employed on the site. The bridge was opened to traffic in January, six months later than planned. Since then, travel time between the two districts has been reduced by half.",
              questions: [
                {
                  prompt: 'Who designed the bridge?',
                  options: ['A single engineer', 'A team from three countries', 'The local council', 'Four hundred workers'],
                  answer: 1,
                  explanation: '« was designed by a team of engineers from three countries ».',
                },
                {
                  prompt: 'Why was the work interrupted?',
                  options: ['Lack of money', 'The rainy season', 'A strike', 'A design error'],
                  answer: 1,
                  explanation: '« was interrupted twice by the rainy season ».',
                },
                {
                  prompt: 'What has changed since the opening?',
                  options: ['Travel time has doubled', 'Travel time has been halved', 'The river has moved', 'The bridge has closed'],
                  answer: 1,
                  explanation: '« travel time between the two districts has been reduced by half ».',
                },
              ],
            },
          },
        ],
      },
    ],
  },
];
