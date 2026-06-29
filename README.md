# JobHunter Belgium AI

JobHunter Belgium AI est une base locale pour construire un assistant IA de recherche d'emploi et de stage en Belgique.

L'objectif est de préparer un système capable de centraliser des offres, les comparer à un CV de base, produire un score de compatibilite, adapter un CV HTML/CSS sans inventer d'information, générer un message de candidature, demander une validation humaine, puis conserver un suivi clair pour la conseillère FOREM.

## Objectifs du projet

- Recevoir ou collecter des offres depuis des sources belges comme FOREM, Actiris, VDAB, Jooble, Adzuna ou des emails.
- Analyser chaque offre par rapport au CV de base.
- Donner un score de compatibilite explicable.
- Adapter le CV HTML/CSS en reformulant et en mettant en avant uniquement les informations réelles.
- Générer un message de candidature professionnel.
- Préparer une validation humaine obligatoire avant toute candidature.
- Alimenter des tableaux de suivi compatibles avec Google Sheets.
- Stocker les preuves utiles pour le suivi FOREM.

## Etat actuel

Cette version prépare seulement la base locale du projet.

Aucune connexion n'est faite avec Gmail, Google Drive, n8n, OpenAI ou un autre service externe. Aucune clé API n'est demandée. Aucune action n'est effectuée dans un compte personnel.

## Structure

```text
jobhunter-belgium-ai/
├── README.md
├── docs/
│   ├── plan-projet.md
│   └── architecture.md
├── cv-template/
│   ├── README.md
│   ├── CV_Hassan_Chajai_BASE.html
│   ├── index.html
│   ├── style.css
│   └── data-example.json
├── lettre-template/
│   ├── README.md
│   ├── Lettre_Motivation_Hassan_Chajai_BASE.html
│   └── index.html
├── prompts/
│   ├── analyse-offre.txt
│   ├── scoring-offre.txt
│   ├── adapter-cv.txt
│   ├── message-candidature.txt
│   └── validation-humaine.txt
├── sheets-templates/
│   ├── offres-detectees.csv
│   ├── candidatures.csv
│   ├── preuves-forem.csv
│   ├── relances.csv
│   ├── historique-ia.csv
│   └── parametres.csv
├── scripts/
│   └── README.md
└── n8n-workflows/
    └── README.md
```

## Principe important

Le CV adapté ne doit jamais inventer d'expérience, de diplôme, de compétence, de résultat ou de certification.

Le système pourra seulement :

- reformuler des éléments déjà présents dans le CV de base ;
- réorganiser les sections ;
- mettre en avant les compétences et expériences les plus pertinentes ;
- adapter le vocabulaire au poste visé ;
- retirer ou déplacer des informations moins utiles pour une offre précise.

La lettre de motivation suit le même principe : elle peut être personnalisée selon l'offre, mais elle ne doit pas inventer d'éléments absents du profil réel.

## Tableaux de suivi

Les fichiers du dossier `sheets-templates` servent de modèles pour de futurs Google Sheets :

- `offres-detectees.csv` : suivi des offres trouvées ou reçues.
- `candidatures.csv` : suivi des candidatures réellement envoyées.
- `preuves-forem.csv` : preuves à conserver pour le FOREM.
- `relances.csv` : dates et statut des relances.
- `historique-ia.csv` : journal des analyses et décisions IA.
- `parametres.csv` : informations personnelles et préférences de recherche.

## Prochaines grandes étapes

1. Ajouter le CV réel dans `cv-template`.
2. Définir les sources d'offres prioritaires.
3. Tester les modèles CSV dans Google Sheets.
4. Construire le premier workflow n8n local ou manuel.
5. Ajouter plus tard les connexions externes, seulement après validation humaine.

## Étape 3 — Offre test

Le dossier `test-data` contient une première offre fictive réaliste : `offre-test.json`.

Cette offre sert à tester localement le futur moteur d'analyse et de scoring avant de connecter de vraies sources d'offres, n8n, Gmail, Google Drive ou Google Sheets.

Le fichier `test-data/analyse-attendue-test-001.md` décrit l'analyse manuelle attendue pour comparer plus tard les résultats du moteur avec une référence humaine.

## Étape 4 — Moteur local de scoring

Le script `scripts/score-offer.js` compare `cv-template/profile-data.json` avec `test-data/offre-test.json`.

Il applique une méthode simple de scoring sur 100 points et génère deux rapports :

- `reports/compatibility-test-001.json`
- `reports/compatibility-test-001.md`

Commande à lancer :

```bash
npm run score:test
```

Ce moteur reste local, transparent et sans connexion externe.

## Étape 5 — Plan d’adaptation contrôlé

Le script `scripts/prepare-adaptation.js` prépare une proposition d'adaptation sans modifier le CV ou la lettre originaux.

Il lit le profil, l'offre test, le rapport de compatibilité et les règles d'adaptation, puis génère :

- `reports/adaptation-plan-test-001.json`
- `reports/adaptation-plan-test-001.md`
- `generated/messages/message-test-001.txt`

Commande à lancer :

```bash
npm run adapt:test
```

Cette étape produit seulement un plan et un message brouillon. Toute candidature reste bloquée tant qu'Hassan n'a pas répondu OUI.

## Étape 6 — Validation humaine

Le script `scripts/validate-application.js` enregistre une décision humaine locale avant toute génération finale.

Commandes disponibles :

```bash
npm run validate:oui
npm run validate:non
npm run validate:modifier
```

La validation génère :

- `validations/validation-test-001.json`
- `validations/validation-test-001.md`

Un choix `MODIFIER` bloque la génération finale. Un choix `NON` archive l'offre. Un choix `OUI` autorise seulement l'étape suivante de génération locale, sans envoyer de candidature.

## Étape 6.5 — Clarifications humaines

Le dossier `validations` contient maintenant les questions à poser avant toute génération finale :

- `validations/questions-test-001.md`
- `validations/hassan-answers-test-001.json`

Le script `scripts/apply-clarifications.js` vérifie si toutes les réponses sont confirmées.

Commande :

```bash
npm run clarify:test
```

Tant qu'une valeur reste vide ou égale à `a_confirmer`, la génération finale reste bloquée.

## Étape 7 — Génération locale du CV HTML adapté

Le script `scripts/generate-cv-html.js` génère une copie HTML adaptée du CV uniquement si la validation humaine est `OUI`.

Sorties :

- `generated/cv-html/cv-test-001.html`
- `generated/cv-html/style-test-001.css` seulement si nécessaire
- `reports/cv-generation-test-001.md`

Commande :

```bash
npm run generate:cv:test
```

Cette étape ne modifie pas le CV original, ne génère pas de PDF, ne connecte aucun service externe et n'envoie aucune candidature.

## Étape 8 — Génération locale de la lettre HTML adaptée

Le script `scripts/generate-lettre-html.js` génère une copie HTML adaptée de la lettre uniquement si la validation humaine est `OUI`.

Sorties :

- `generated/lettre-html/lettre-test-001.html`
- `reports/lettre-generation-test-001.md`

Commande :

```bash
npm run generate:lettre:test
```

Cette étape ne modifie pas la lettre originale, ne modifie pas le CV original, ne génère pas de PDF, ne connecte aucun service externe et n'envoie aucune candidature.

## Étape 8.5 — Vérification visuelle HTML

Le script `scripts/check-generated-html.js` contrôle les fichiers HTML générés avant toute conversion PDF.

Fichiers vérifiés :

- `generated/cv-html/cv-test-001.html`
- `generated/lettre-html/lettre-test-001.html`

Rapport généré :

- `reports/html-check-test-001.md`

Commande :

```bash
npm run check:html:test
```

Cette étape documente les contrôles et les points à vérifier manuellement. Elle ne corrige pas automatiquement le design.

## Étape 9 — Génération locale des PDF

Le script `scripts/generate-pdf.js` convertit localement le CV HTML généré et la lettre HTML générée en PDF.

Sorties :

- `generated/pdf/cv-test-001.pdf`
- `generated/pdf/lettre-test-001.pdf`
- `reports/pdf-generation-test-001.md`

Commande :

```bash
npm run generate:pdf:test
```

Cette étape vérifie la validation humaine `OUI`, ne modifie pas les originaux et n'envoie aucune candidature.

## Étape 10 — Suivi FOREM local

Le script `scripts/generate-tracking.js` crée un suivi FOREM local pour l'offre TEST-001.

Sorties :

- `tracking/forem-suivi-test-001.json`
- `tracking/forem-suivi-test-001.csv`
- `tracking/forem-suivi-test-001.md`
- `reports/tracking-generation-test-001.md`

Commande :

```bash
npm run tracking:test
```

Cette étape ne connecte pas Google Sheets, Gmail, Google Drive, n8n ou OpenAI. La candidature reste prête localement mais non envoyée.

## Étape 10.5 — Préparation des preuves FOREM

Le dossier `proofs/TEST-001` prépare le stockage des preuves réelles liées à l'offre TEST-001.

Fichiers :

- `proofs/TEST-001/README.md`
- `proofs/TEST-001/proof-index.json`
- `docs/preuves-forem.md`

Commande de vérification :

```bash
npm run proofs:test
```

Aucune preuve fictive n'est créée. La candidature ne doit pas être marquée comme envoyée tant qu'une preuve réelle d'envoi n'existe pas.

## Étape 10.6 — Package local d’examen

Le script `scripts/create-review-package.js` regroupe les fichiers utiles dans :

- `review-packages/TEST-001/`

Commande :

```bash
npm run package:review:test
```

Le package sert uniquement à examiner la candidature prête localement. Il ne postule pas, ne crée aucune preuve fictive et ne marque rien comme envoyé.
# Étape 11 — Préparer les CSV Google Sheets FOREM

Le script `scripts/prepare-google-sheets-import.js` prépare des CSV prêts à importer manuellement dans Google Sheets.

Sorties :

- `google-sheets-import/01_dashboard.csv`
- `google-sheets-import/02_offres_detectees.csv`
- `google-sheets-import/03_candidatures.csv`
- `google-sheets-import/04_preuves_forem.csv`
- `google-sheets-import/05_relances.csv`
- `google-sheets-import/06_historique_ia.csv`
- `google-sheets-import/07_parametres.csv`
- `google-sheets-import/README.md`
- `reports/google-sheets-import-test-001.md`

Commande :

```bash
npm run sheets:prepare:test
```

Cette étape prépare uniquement l'import manuel. Elle ne connecte pas Google Sheets, Gmail, Drive, n8n ou OpenAI. La candidature TEST-001 reste prête localement mais non envoyée.
# Étape 12 — JobHunter Studio local

JobHunter Studio est une mini-application locale pour analyser une offre collée, afficher son score et préparer une candidature après confirmation humaine explicite.

Commande :

```bash
npm.cmd run app:start
```

URL locale :

```text
http://127.0.0.1:4173
```

Fonctions disponibles :

- saisie ou collage d'une offre ;
- scoring local et transparent ;
- recommandation OUI, NON ou MODIFIER ;
- confirmation humaine avant génération ;
- génération locale du CV, de la lettre, des PDF et du message ;
- création du suivi FOREM et du package d'examen ;
- liens directs vers les fichiers locaux générés.

Le pipeline historique TEST-001 peut être relancé avec :

```bash
npm.cmd run pipeline:test
```

Aucun service externe n'est connecté. Aucune candidature n'est envoyée et aucune preuve d'envoi n'est inventée.

### Utilisation sur téléphone

Le téléphone et le PC doivent être connectés au même réseau Wi-Fi.

Lancer le mode réseau sur Windows :

```bash
npm.cmd run app:network
```

Ouvrir ensuite sur le téléphone l'adresse affichée avec l'adresse IPv4 du PC, par exemple :

```text
http://192.168.129.3:4173
```

Le mode `app:start` reste accessible seulement depuis le PC. Le mode `app:network` expose l'application uniquement sur le réseau local tant que le serveur fonctionne.

## Étape 13 — Recherche automatique d'offres

JobHunter Studio peut chercher automatiquement des offres belges avec le bouton **Chercher des offres automatiquement**.

Sources :

- FOREM Open Data : active sans clé ;
- Adzuna : optionnelle avec `ADZUNA_APP_ID` et `ADZUNA_APP_KEY` dans `.env` ;
- Jooble : optionnelle avec `JOOBLE_API_KEY` dans `.env`.

Commandes :

```bash
npm.cmd run jobs:search
npm.cmd run jobs:rank
```

Fichiers générés :

- `data/jobs-found.json`
- `data/jobs-found.csv`
- `data/jobs-ranked.json`
- `data/jobs-ranked.csv`
- `reports/job-search-report.md`
- `reports/job-ranking-report.md`

Les offres sont normalisées, dédupliquées et scorées localement. Le bouton **Préparer candidature** utilise l'offre sélectionnée comme offre courante, prépare le plan d'adaptation puis exige une confirmation humaine avant de générer les documents.

LinkedIn, Indeed, StepStone et les sites protégés ne sont pas scrappés. Aucun CAPTCHA, login ou mécanisme anti-bot n'est contourné.

## Flux principal : recherche automatique → préparation candidature

Le flux principal de JobHunter Studio est maintenant :

1. cliquer sur **Chercher des offres automatiquement** ;
2. choisir une offre dans la liste ;
3. cliquer sur **Préparer candidature** ;
4. vérifier le score, les informations et le plan préparé automatiquement ;
5. répondre OUI ou NON dans la validation humaine ;
6. après OUI, récupérer le CV, la lettre, les PDF, le message, le suivi FOREM et le package d'examen.

L'offre sélectionnée est copiée automatiquement dans :

- `data/current-offer.json`
- `test-data/current-offer.json`

Les fichiers utilisent l'identifiant réel de l'offre :

- `generated/pdf/cv-<id_offre>.pdf`
- `generated/pdf/lettre-<id_offre>.pdf`
- `tracking/forem-suivi-<id_offre>.csv`
- `review-packages/<id_offre>/`

Le formulaire manuel reste disponible comme solution secondaire.

Pipeline en ligne de commande :

```bash
npm.cmd run pipeline:current -- data/current-offer.json OUI
```

Sans le dernier argument `OUI`, seule la préparation est exécutée et la génération finale reste bloquée.
## CV Pro Upgrade

Un espace séparé `cv-upgrade/` contient deux versions améliorées du CV de base, sans modifier les originaux dans `cv-template/` :

- version visuelle sombre/cyan : `cv-upgrade/visual/cv-hassan-visual-upgraded.html`
- version sobre ATS/impression : `cv-upgrade/ats/cv-hassan-ats.html`

Les deux versions gardent les informations réelles du profil, mettent les projets personnels davantage en avant et marquent les informations manquantes avec `à compléter`, `à ajouter` ou `à préciser`.

Génération PDF locale :

```bash
npm.cmd run cv:upgrade:pdf
```

Fichiers de suivi :

- `cv-upgrade/project-links-to-complete.md`
- `cv-upgrade/cv-upgrade-report.md`

Cette étape ne remplace pas encore le template utilisé par le pipeline automatique. Elle sert à examiner les deux nouvelles bases de CV avant de décider laquelle intégrer plus tard.
## Démo recruteur

Le projet peut être présenté comme une mini-application locale Node.js :

- recherche d'offres avec FOREM Open Data ;
- scoring local transparent ;
- génération locale de CV, lettre, message et suivi FOREM ;
- validation humaine obligatoire avant génération ;
- aucune candidature envoyée automatiquement ;
- aucune preuve inventée.

Guide rapide pour un recruteur :

- `README_RECRUITER.md`
- `docs/deploiement-recruteur.md`

Contrôle avant publication GitHub :

```bash
npm run publish:check
```

Lancement de l'app :

```bash
npm run app:start
```
