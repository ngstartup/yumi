# Yumi — Learn English. Build your future.

Application moderne d'apprentissage de l'anglais pour adultes. MVP fonctionnel de bout en
bout : landing → inscription → onboarding → test de placement → tableau de bord → leçon →
feedback pédagogique → XP / série / badges → statistiques → certificat.

Identité, interface, moteur pédagogique et mascotte sont **entièrement originaux**.

---

## Démarrer

```bash
npm install
npm run dev        # http://localhost:5173
```

Autres commandes :

| Commande | Effet |
| --- | --- |
| `npm run build` | Build de production (`dist/`), PWA installable |
| `npm run build:single` | Build de démonstration en **un seul fichier** (`dist-single/index.html`) |
| `npm run preview` | Sert la build de production |
| `npm test` | Tests unitaires du moteur et intégrité du contenu (Vitest) |
| `npm run typecheck` | Vérification TypeScript stricte |
| `node scripts/smoke.mjs` | Test de bout en bout du parcours complet (Playwright + captures) |
| `npm run mobile:android` | Application Android : build, synchronisation, ouverture d'Android Studio |
| `npm run bundle` | Fabrique le paquet de mise à jour à distance et son manifeste |
| `npm run icons` | Régénère icônes et image de partage depuis le renard Yumi |
| `python3 scripts/make-audio.py --voice <modèle.onnx>` | Réenregistre la voix des exercices d'écoute |

L'application Android et son pipeline de mise à jour sont documentés dans **[ANDROID.md](ANDROID.md)**.

---

## Ce qui est livré

**Parcours utilisateur complet et réellement fonctionnel**

Landing SEO · inscription / connexion / mot de passe oublié / session persistante ·
onboarding en 3 étapes · test de placement adaptatif facultatif · tableau de bord ·
carte de progression · lecteur de leçon · 11 types d'exercices · feedback pédagogique ·
XP, objectif quotidien, série, badges · statistiques par compétence · profil et
paramètres · **retour sonore et haptique réglable** · évaluation de fin de niveau et
certificat · fonctionnement hors connexion.

**Contenu pédagogique réel**

57 leçons, ~490 mots et expressions, 5 parcours :

| Parcours | Niveaux fournis | Unités |
| --- | --- | --- |
| Anglais général | A1, A2, B1 | 22 |
| Business English | B1 | 2 |
| Anglais académique | B1 | 1 |
| Anglais pour voyager | A2 | 2 |
| Entretien d'embauche | B1 | 1 |

Le référentiel CECRL complet (A1 → C2) est modélisé ; les niveaux non encore pourvus
apparaissent comme « prochainement » sans casser la progression.

**Non implémenté volontairement** (conformément au cahier des charges) : abonnement,
publicité, achats intégrés, vies/cœurs, classement, compétition, réseau social,
professeur IA.

---

## Architecture

```
src/
  content/      Contenu pédagogique — DONNÉES, jamais de JSX
  engine/       Moteur : génération d'exercices, correction, difficulté, SRS, XP, badges, placement
  data/         Persistance : IndexedDB + interface Repository (+ adaptateur Supabase)
  auth/         Authentification (locale aujourd'hui, OAuth/Supabase demain)
  state/        Store applicatif (zustand) et sélecteurs dérivés
  ds/           Design system Yumi — composants réutilisables
  mascot/       Le renard Yumi : 6 évolutions × 11 expressions, 100 % SVG
  i18n/         Traductions et contexte de langue
  features/     Écrans, un dossier par domaine
  audio/        Index des extraits enregistrés — GÉNÉRÉ, ne pas éditer
  lib/          Utilitaires (retour son/haptique, voix, texte, aléatoire déterministe, crypto, analytics)
```

### Le moteur pédagogique

Le point central du projet. Le contenu n'est **pas** une liste d'exercices figés : chaque
leçon déclare des *items* typés (vocabulaire, phrases modèles, points de grammaire, textes,
dialogues). Le moteur en dérive à l'exécution toutes les variantes valides :

```
Notion : Present Simple
Phrase de référence : She works in London.
        ↓
QCM « choisissez la phrase correcte » · repérez l'erreur · phrase à trou ·
traduction FR→EN · remise en ordre · dictée · compréhension orale · prononciation
```

Les distracteurs proviennent toujours du même champ lexical, ce qui évite les propositions
absurdes. La génération est **déterministe** (graine) : une même leçon rejouée produit la
même session, ce qui la rend testable.

La sélection d'une session combine trois contraintes : la fenêtre de difficulté du niveau
CECRL de l'apprenant (un débutant ne reçoit jamais de C1), la priorité aux notions
fragiles, et l'alternance des compétences.

### Retour sensoriel — son et vibrations

`src/lib/feedback.ts` est le point d'entrée unique. L'interface déclare une
**intention** (`feedback('correct')`, `feedback('tap')`), jamais une fréquence ni une
durée de vibration : ajuster la charte sensorielle revient à éditer ce seul fichier.

Aucun fichier audio n'est embarqué. Les 18 signaux sont synthétisés à la volée en Web
Audio (oscillateurs + enveloppe attaque/décroissance), ce qui garde l'application légère
et pleinement fonctionnelle hors connexion. Chaque signal a son pendant haptique
(`navigator.vibrate`), avec des motifs dont seules les impulsions sont amplifiées par le
réglage d'intensité — les pauses restent intactes, sinon le rythme du motif se déforme.

Ce qui déclenche un retour : appui sur un bouton, sélection d'une réponse, bascule d'un
interrupteur, navigation, ouverture d'une modale, bonne réponse / réponse presque juste /
erreur, série de 3 bonnes réponses, fin de leçon, badge obtenu, objectif quotidien
atteint, montée de niveau, notifications système.

Les navigateurs interdisent le son avant un geste de l'utilisateur : `bindAudioUnlock()`
prépare le contexte audio au premier appui, sans rien émettre. Sur un appareil sans
vibreur ou sans Web Audio, les appels sont inertes — jamais d'exception, jamais d'erreur
affichée.

Réglages exposés dans **Profil → Son et vibrations** : activation des sons, volume
(0–100 %), activation des vibrations, intensité (légère / moyenne / forte), et un bouton
de test pour chacun. Tout est persisté par utilisateur et re-appliqué au démarrage ; les
options indisponibles sur l'appareil sont désactivées avec l'explication correspondante.

### La voix des exercices d'écoute

Elle est **enregistrée**, pas synthétisée sur l'appareil. C'est la seule façon d'obtenir
du son partout.

La démonstration est vite faite : dans une WebView Android, `window.speechSynthesis`
existe mais n'a aucune voix — l'API répond, `speak()` ne lève rien, et il ne sort aucun
son. Le moteur vocal du système, lui, s'atteint par un plugin natif, mais il met un temps
variable à se lier (de 0,2 à plusieurs secondes après le lancement) et n'a pas forcément
de voix anglaise installée : un téléphone vendu au Niger n'en a souvent aucune. Chacun de
ces cas donne le même résultat pour l'apprenant — un exercice de compréhension orale
silencieux, sans le moindre message d'erreur.

Un fichier, lui, se joue partout, hors connexion, et toujours avec la même prononciation
de référence. C'est aussi meilleur pédagogiquement : l'apprenant n'entend pas une voix
différente à chaque appareil.

`scripts/make-audio.py` fait l'inventaire de tout ce que le moteur peut donner à
prononcer — les champs anglais du contenu et la banque de placement, 722 énoncés — puis
les enregistre avec Piper (voix `en_GB-cori-high`), rogne les silences, normalise le
niveau et encode en Opus 24 kb/s : environ 4 Mo pour l'ensemble. Le nom du fichier est
calculé à partir du texte lui-même (`clipId`, écrit à l'identique en Python et en
TypeScript), si bien qu'ajouter une phrase au contenu et relancer le script suffit — rien
à renommer, rien à référencer à la main. Un test refuse d'ailleurs tout énoncé du contenu
qui n'aurait pas son enregistrement, et tout enregistrement devenu orphelin.

À l'exécution (`src/lib/tts.ts`), trois moyens sont essayés dans l'ordre :
l'enregistrement embarqué, puis le moteur vocal du système, puis celui du navigateur. Les
deux derniers ne servent plus qu'aux textes ajoutés après la dernière génération. Le
bouton « écouter lentement » des dictées ne change pas de fichier : il joue le même à
vitesse réduite, sans monter dans les aigus (`preservesPitch`).

**Profil → Son et vibrations** affiche ce qui parle réellement, avec un bouton d'essai —
et, si l'on en était réduit au moteur du système sans voix anglaise, un raccourci vers
l'écran Android d'installation des données vocales.

### Répétition espacée

Chaque notion (`conceptId`) porte une facilité, un intervalle et une date de prochaine
révision (variante de SM-2). Une erreur remet l'intervalle à zéro et fait baisser la
facilité : la notion revient vite. L'onglet **Révisions** construit une session à partir
des notions dues, quelle que soit la leçon d'origine.

### Persistance et hors connexion

Toute l'application passe par l'interface `Repository` (`src/data/repository.ts`) — jamais
par IndexedDB ni par un client HTTP directement.

- `LocalRepository` : IndexedDB, avec repli mémoire silencieux si le stockage est bloqué.
- `SupabaseRepository` : squelette prêt à compléter.
- `supabase/schema.sql` : schéma PostgreSQL complet (24 tables + RLS + données de référence),
  aligné 1:1 sur les entités de `src/data/schema.ts`.

Passer au cloud = écrire l'adaptateur et changer l'aiguillage dans `src/data/index.ts`.
Aucun écran à modifier.

Une file de synchronisation (`syncQueue`) enregistre les écritures ; elle est rejouée au
retour de la connexion. L'audio des exercices d'écoute et les polices Inter et Sora sont
embarqués dans la build : plus aucune requête réseau au lancement, et une application
identique avec ou sans connexion.

### Internationalisation

Aucun texte n'est codé dans un composant. `fr` est la base, `en` est un dictionnaire
partiel fusionné par-dessus — une clé manquante n'a jamais fait planter l'application.
`ar`, `es`, `pt` sont déclarés dans l'architecture (y compris la bascule RTL) et n'attendent
que leurs traductions.

### PWA et Android

`manifest.webmanifest` + service worker (cache de l'app shell, navigation offline-first)
pour le web. Le projet natif `android/` est généré et configuré (Capacitor) : la même
build `dist/` sert le site, la PWA et l'application installée.

Le code web n'a pas été réécrit ; seule une couche `src/native/` s'ajoute, inerte dans
un navigateur. Elle traite trois points qu'une simple mise en coquille laisse cassés :

- **Haptique.** `navigator.vibrate` ne produit qu'un bourdonnement de durée fixe (et
  n'existe pas du tout sur iOS). `src/lib/feedback.ts` expose un pilote injectable ; en
  natif, chaque impulsion du motif devient un `Haptics.impact()` calibré par le système —
  le rythme de la charte est conservé, la texture devient celle de l'appareil.
- **Bouton retour Android**, sans quoi un appui ferme l'application en pleine leçon.
- **Reconnaissance vocale.** La Web Speech API est absente d'iOS et dépend du réseau chez
  Chrome. `src/lib/tts.ts` définit une interface `SpeechProvider` ; le moteur du système
  remplace l'implémentation web au démarrage, sans qu'aucun écran change d'appel.
- **Voix des exercices d'écoute.** Voir la section dédiée ci-dessous : la synthèse vocale
  d'un téléphone ne peut pas être tenue pour acquise, donc l'audio est enregistré.

**Mise à jour à distance.** Modifier le code, pousser sur `main`, et la nouvelle version
descend sur les téléphones au démarrage suivant — sans réinstaller l'APK. Le pipeline
(`.github/workflows/release.yml`) compile, teste, numérote et publie ; l'application
interroge un manifeste statique publié sur les Releases du dépôt, vérifie l'empreinte
SHA-256 du paquet et l'active au lancement suivant, jamais en pleine leçon. Une version
qui ne démarre pas n'atteint jamais `confirmAppStarted()` et la précédente est restaurée
automatiquement.

Détails, permissions, signature et mise en route : **[ANDROID.md](ANDROID.md)**.

---

## Configuration

Copier `.env.example` en `.env` si vous branchez Supabase :

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Aucune clé secrète ne doit être commitée. En local-first, aucune variable n'est requise.

---

## Sécurité

- Les mots de passe ne sont jamais stockés en clair : PBKDF2-SHA256, 150 000 itérations,
  sel aléatoire par compte, comparaison à temps constant.
- Routes protégées côté application (`RequireAuth`), et côté base par les politiques RLS
  du schéma Supabase (chacun ne lit que ses lignes).
- Aucune stack trace n'atteint l'utilisateur (`ErrorBoundary` + messages métier).
- Aucun traceur tiers ; les événements analytiques restent en mémoire.

---

## Tests

- **Unitaires** (`npm test`) — 69 tests : correction des 11 types d'exercices, enchaînement
  des leçons après « Continuer », couverture audio du contenu (tout énoncé prononçable a
  son enregistrement, et réciproquement) et concordance des trois implémentations de
  `clipId`, pilote de synthèse vocale injectable et notification de ses abonnés quand le
  moteur du système se lie enfin, tolérance
  aux fautes de frappe, répétition espacée, série quotidienne, XP, badges, sélection
  adaptative, test de placement, service de retour sensoriel (bornes de volume, mise à
  l'échelle des motifs haptiques, inertie hors navigateur, migration des anciens réglages),
  couche native (pilote haptique injectable, bascule de fournisseur vocal, détection de
  plateforme, comparaison de versions de mise à jour) et intégrité de tout le contenu (identifiants uniques, bonnes réponses
  valides, distracteurs distincts, mot à trou présent dans la phrase).
- **Bout en bout** (`node scripts/smoke.mjs`) — rejoue le parcours complet dans un
  navigateur réel, y compris la manche de reprise des erreurs, vérifie la persistance après
  rechargement, le retour à la racine avec une session ouverte (tableau de bord et non page
  vitrine), le décodage effectif d'un extrait d'écoute (durée réelle, pas seulement la
  présence du fichier), les réglages de son et de
  vibrations (volume enregistré, curseur désactivé quand le son est coupé), l'absence de
  débordement horizontal en 390 px et la bannière hors connexion. Captures dans
  `screenshots/`.

---

## Prochaines étapes suggérées

1. Compléter `SupabaseRepository` et basculer l'authentification sur Supabase Auth.
2. Étendre le contenu B1 → C2 (aucune modification du moteur nécessaire).
3. Back-office de contenu (les tables `courses` → `exercise_options` existent déjà).
4. Export PDF signé des certificats.
5. Fonctionnalités sociales (les modèles `friendships`, `groups` sont déjà dans le schéma).
