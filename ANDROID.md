# Yumi sur Android

Deux choses vivent côte à côte :

| | Ce que c'est | Quand ça change |
| --- | --- | --- |
| **L'APK** | La coquille de l'application : icône, permissions, plugins natifs | Rarement — seulement si on ajoute une capacité de l'appareil |
| **Le paquet web** | Tout Yumi : écrans, leçons, moteur pédagogique, sons | À chaque modification du code |

Le paquet web se met à jour **tout seul, à distance**. C'est pour cela qu'on
n'aura presque jamais à réinstaller l'APK.

---

## Mise en route — une seule fois

### 1. Créer le dépôt

Sur [github.com/new](https://github.com/new) : un dépôt nommé `yumi`, **privé**.
Ne cochez rien d'autre (pas de README, pas de .gitignore) — le projet en a déjà.

### 2. Envoyer le code

Dans le dossier du projet, en remplaçant `VOTRE-COMPTE` :

```bash
git remote add origin https://github.com/VOTRE-COMPTE/yumi.git
git branch -M main
git push -u origin main
```

### 3. Déposer la clé de signature

La clé est déjà créée. Elle sert à une seule chose, mais elle est essentielle :
Android n'accepte d'installer une nouvelle version par-dessus l'ancienne que si
les deux sont signées par **la même clé**. Perdez-la, et la seule issue serait
de désinstaller Yumi — donc d'effacer la progression.

Dans le dépôt : **Settings → Secrets and variables → Actions → New repository
secret**. Créez ces trois secrets (les valeurs sont dans `SECRETS.txt`) :

| Nom du secret | Valeur |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | le contenu de `yumi-release.jks.base64` |
| `ANDROID_KEYSTORE_PASSWORD` | `MF5WilKFh2cncEbIKyx8PfCMyVii` |
| `ANDROID_KEY_PASSWORD` | `MF5WilKFh2cncEbIKyx8PfCMyVii` |

Gardez le fichier `yumi-release.jks` en lieu sûr, hors du dépôt.

### 4. Récupérer l'APK

Le premier `git push` déclenche la compilation. Onglet **Actions** du dépôt :
comptez cinq à huit minutes. Une fois terminé, allez dans **Releases** :
`Yumi-0.1.1.apk` s'y trouve.

**Sur le téléphone**, ouvrez la page de la Release, téléchargez le `.apk` et
ouvrez-le. Android demandera d'autoriser l'installation depuis cette source :
c'est normal pour une application qui ne vient pas du Play Store.

---

## Au quotidien

```bash
git add -A && git commit -m "ce que j'ai changé" && git push
```

Et c'est tout. Le pipeline :

1. vérifie que le code compile et que les 50 tests passent — **un test rouge
   arrête la publication**, rien ne part vers le téléphone ;
2. attribue le numéro de version suivant, automatiquement ;
3. fabrique le paquet de mise à jour et l'APK signé ;
4. publie le tout dans une Release.

Sur le téléphone, au prochain démarrage de Yumi : la mise à jour est détectée,
téléchargée en arrière-plan, puis activée **au démarrage suivant**. Jamais
pendant une leçon — recharger l'application au milieu d'un exercice ferait
perdre la réponse en cours.

Pour la voir tout de suite : **Profil → Version et mises à jour → Rechercher
une mise à jour**, puis fermer et rouvrir l'application.

### Les versions

Vous n'avez rien à numéroter. Le pipeline prend `0.1` dans `package.json` et y
ajoute le numéro de compilation : `0.1.1`, `0.1.2`, `0.1.3`… Pour marquer une
étape importante, passez `package.json` à `0.2.0` — les versions suivantes
deviendront `0.2.x`.

---

## Ce que la mise à jour à distance ne peut pas faire

La frontière est nette : **ce qui est dans `dist/` part à distance, le reste
non.**

Se met à jour tout seul : écrans, leçons, vocabulaire, moteur pédagogique,
corrections, styles, sons, traductions — c'est-à-dire la quasi-totalité du
travail.

Exige un nouvel APK : ajouter un plugin natif, demander une nouvelle permission
Android, changer l'icône, le nom ou l'identifiant de l'application.

Dans ce cas, ajoutez `YUMI_MIN_NATIVE` au manifeste : les téléphones dont
l'APK est trop ancien afficheront « cette mise à jour demande une nouvelle
installation » au lieu de télécharger un paquet qui appellerait du code absent.

## Si une version ne démarre pas

Le mécanisme se protège lui-même. Une version publiée n'est considérée comme
saine qu'après s'être **réellement affichée** — c'est l'appel
`confirmAppStarted()` dans `App.tsx`. Si le paquet contient une erreur qui
empêche l'application de démarrer, ce signal n'arrive jamais et le système
restaure la version précédente au bout de vingt secondes.

Une mauvaise publication ne peut donc pas rendre l'application inutilisable.
Corrigez, poussez, la version suivante remplacera la fautive.

---

## Ce qui a été configuré, et pourquoi

**`androidScheme: 'https'`** — rend la WebView « contexte sécurisé ». Sans
cela `crypto.subtle` est indisponible et le hachage PBKDF2 des mots de passe
échouerait à la création du premier compte.

**Retour haptique natif** — `navigator.vibrate` donne un bourdonnement de
durée fixe. `src/native/haptics.ts` traduit chaque impulsion de la charte en
`Haptics.impact()` calibré par le système : le rythme des motifs est conservé,
la texture devient celle de l'appareil.

**Bouton retour** — intercepté, sans quoi un appui ferme l'application en
pleine leçon.

**Clavier** — quand il s'ouvre, la barre d'onglets du bas se poserait sur le
clavier, juste au-dessus du champ de saisie ; elle est masquée.

**Service worker désactivé en natif** — les fichiers sont déjà sur l'appareil ;
il n'apporterait rien et intercepterait chaque navigation.

**Reconnaissance vocale** — le moteur du système remplace la Web Speech API au
démarrage. Il fonctionne hors connexion, là où Chrome envoie l'audio à un
serveur. Permissions déjà déclarées : `RECORD_AUDIO`, plus le bloc `<queries>`
sans lequel Android 11+ ne laisse pas voir le moteur de reconnaissance.

**Aucun service tiers** — le manifeste est un fichier statique sur vos
Releases. Rien ne sort du téléphone vers un serveur de statistiques.

---

## Compiler soi-même (facultatif)

Avec Android Studio installé :

```bash
npm run mobile:android    # build + synchronisation + ouverture d'Android Studio
```

Toute modification du code web doit passer par `npm run mobile:sync` avant
d'être visible dans Android Studio.

---

## Limites connues

- **Polices distantes.** `src/styles.css` importe Inter et Sora depuis Google
  Fonts. Au premier lancement sans réseau, l'application s'affiche avec la
  police système. Les héberger dans `public/fonts/` supprimerait la dernière
  dépendance réseau au démarrage.
- **Synthèse vocale.** Elle utilise le moteur du système ; certains appareils
  n'ont aucune voix anglaise installée. L'exercice reste jouable, sans audio.
- **Play Store.** Rien n'y oblige. Si vous publiez un jour, la clé actuelle
  devient la clé officielle de l'application — raison de plus pour la garder.
