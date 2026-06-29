# Scripts

Ce dossier accueillera plus tard les scripts locaux du projet.

Exemples prévus :

- génération du CV HTML adapté ;
- génération d'un PDF à partir du CV HTML/CSS ;
- préparation de fichiers de preuve ;
- exports ou contrôles locaux avant intégration avec n8n.

Aucun script n'est encore nécessaire à ce stade.

## score-offer.js

`score-offer.js` est le premier moteur local de scoring du projet.

Il lit :

- `cv-template/profile-data.json`
- `test-data/offre-test.json`

Il compare :

- les compétences ;
- les outils ;
- les langues ;
- les objectifs ;
- la localisation ;
- le type de contrat ;
- le niveau attendu.

Il applique la méthode décrite dans `docs/methode-scoring.md` et génère :

- `reports/compatibility-test-001.json`
- `reports/compatibility-test-001.md`

Commande :

```bash
npm run score:test
```

Le script utilise uniquement Node.js natif et ne connecte aucun service externe.

## prepare-adaptation.js

`prepare-adaptation.js` génère une proposition écrite d'adaptation à partir du profil, de l'offre test et du rapport de compatibilité.

Il lit :

- `cv-template/profile-data.json`
- `test-data/offre-test.json`
- `reports/compatibility-test-001.json`
- `docs/regles-adaptation-cv.md`

Il génère :

- `reports/adaptation-plan-test-001.json`
- `reports/adaptation-plan-test-001.md`
- `generated/messages/message-test-001.txt`

Commande :

```bash
npm run adapt:test
```

Le script ne modifie pas le CV original, ne modifie pas la lettre originale, ne génère pas de PDF et n'envoie aucune candidature.

## validate-application.js

`validate-application.js` enregistre une décision humaine locale pour une offre.

Il lit :

- `reports/adaptation-plan-test-001.json`

Il génère :

- `validations/validation-test-001.json`
- `validations/validation-test-001.md`

Commandes :

```bash
npm run validate:oui
npm run validate:non
npm run validate:modifier
```

Règles :

- `OUI` autorise seulement l'étape suivante de génération locale.
- `NON` refuse l'offre et indique qu'elle doit être archivée.
- `MODIFIER` bloque la génération finale tant que le plan d'adaptation n'est pas corrigé.

Aucune candidature n'est envoyée automatiquement.

## apply-clarifications.js

`apply-clarifications.js` vérifie les réponses de clarification avant toute génération finale.

Il lit :

- `validations/hassan-answers-test-001.json`

Il bloque la suite tant qu'une valeur reste vide ou égale à `a_confirmer`.

Si toutes les réponses sont confirmées, il génère :

- `validations/clarifications-test-001.md`

Commande :

```bash
npm run clarify:test
```

Une compétence en cours d'apprentissage peut seulement être mentionnée comme apprentissage. Une réponse `non` ne doit pas être utilisée comme argument fort.

## generate-cv-html.js

`generate-cv-html.js` génère une copie HTML adaptée du CV pour l'offre TEST-001.

Il vérifie d'abord que `validations/validation-test-001.json` contient :

- `decision_humaine = OUI`
- `statut_validation = valide_pour_generation`
- `prochaine_action = generer_cv_et_message`

Il lit ensuite le CV original, le plan d'adaptation, les clarifications et les règles d'adaptation, puis génère :

- `generated/cv-html/cv-test-001.html`
- `generated/cv-html/style-test-001.css` seulement si un CSS séparé est utilisé par le HTML
- `reports/cv-generation-test-001.md`

Commande :

```bash
npm run generate:cv:test
```

Le script ne modifie pas le CV original, ne génère pas de PDF et n'envoie aucune candidature.

## generate-lettre-html.js

`generate-lettre-html.js` génère une copie HTML adaptée de la lettre de motivation pour l'offre TEST-001.

Il vérifie d'abord que `validations/validation-test-001.json` contient :

- `decision_humaine = OUI`
- `statut_validation = valide_pour_generation`
- `prochaine_action = generer_cv_et_message`

Il lit ensuite la lettre originale, l'offre test, le plan d'adaptation, le message court validé, les clarifications et les règles d'adaptation, puis génère :

- `generated/lettre-html/lettre-test-001.html`
- `reports/lettre-generation-test-001.md`

Commande :

```bash
npm run generate:lettre:test
```

Le script ne modifie pas la lettre originale, ne modifie pas le CV original, ne génère pas de PDF et n'envoie aucune candidature.

## check-generated-html.js

`check-generated-html.js` vérifie statiquement les fichiers HTML générés avant toute conversion PDF.

Il contrôle :

- l'existence du CV HTML généré ;
- l'existence de la lettre HTML générée ;
- la structure HTML minimale ;
- la présence du charset UTF-8 ;
- le titre adapté ;
- l'absence de formulations interdites autour de n8n, Make et Trello.

Il génère :

- `reports/html-check-test-001.md`

Commande :

```bash
npm run check:html:test
```

Le script ne corrige pas le design. Toute correction visuelle doit être faite dans une étape séparée.

## generate-pdf.js

`generate-pdf.js` convertit localement les fichiers HTML générés en PDF.

Il vérifie d'abord que `validations/validation-test-001.json` contient :

- `decision_humaine = OUI`
- `statut_validation = valide_pour_generation`
- `prochaine_action = generer_cv_et_message`

Il vérifie aussi que les HTML générés existent, puis produit :

- `generated/pdf/cv-test-001.pdf`
- `generated/pdf/lettre-test-001.pdf`
- `reports/pdf-generation-test-001.md`

Commande :

```bash
npm run generate:pdf:test
```

Le script utilise Playwright/Puppeteer seulement s'ils sont disponibles. Dans l'environnement actuel, il utilise un navigateur Chromium local en mode headless, sans connexion externe.

## generate-tracking.js

`generate-tracking.js` crée un suivi FOREM local pour l'offre TEST-001.

Il lit :

- `test-data/offre-test.json`
- `reports/compatibility-test-001.json`
- `reports/adaptation-plan-test-001.json`
- `validations/validation-test-001.json`
- `generated/pdf/cv-test-001.pdf`
- `generated/pdf/lettre-test-001.pdf`
- `generated/messages/message-test-001.txt`

Il génère :

- `tracking/forem-suivi-test-001.json`
- `tracking/forem-suivi-test-001.csv`
- `tracking/forem-suivi-test-001.md`
- `reports/tracking-generation-test-001.md`

Commande :

```bash
npm run tracking:test
```

Le script ne marque jamais une candidature comme envoyée et n'invente ni preuve d'envoi ni relance.

## check-proofs.js

`check-proofs.js` vérifie l'index local des preuves FOREM pour l'offre TEST-001.

Il lit :

- `proofs/TEST-001/proof-index.json`

Il vérifie que le dossier de preuves existe et indique si des preuves réelles sont listées.

Commande :

```bash
npm run proofs:test
```

Le script ne crée jamais automatiquement une preuve et ne marque jamais une candidature comme envoyée.

## create-review-package.js

`create-review-package.js` crée un package local d'examen pour l'offre TEST-001.

Il copie dans `review-packages/TEST-001/` les PDF, le message, le suivi FOREM, l'index de preuves, les rapports et validations disponibles.

Il génère aussi :

- `review-packages/TEST-001/README.md`
- `reports/review-package-test-001.md`

Commande :

```bash
npm run package:review:test
```

Ce package sert uniquement à examiner une candidature prête. Il n'envoie rien, ne crée aucune preuve fictive et ne marque pas la candidature comme envoyée.
# Google Sheets import

`prepare-google-sheets-import.js` prépare les CSV locaux à importer manuellement dans Google Sheets pour le suivi FOREM.

Il lit `test-data/offre-test.json`, `reports/compatibility-test-001.json`, `validations/validation-test-001.json`, `tracking/forem-suivi-test-001.csv`, `proofs/TEST-001/proof-index.json` et `validations/hassan-answers-test-001.json`.

Il génère les fichiers `google-sheets-import/01_dashboard.csv` à `google-sheets-import/07_parametres.csv`, le README du dossier d'import et `reports/google-sheets-import-test-001.md`.

Commande :

```bash
npm run sheets:prepare:test
```

Le script ne connecte pas Google Sheets et ne marque jamais la candidature comme envoyée.
# JobHunter Studio

`studio-pipeline.js` fournit le pipeline local utilisé par l'application :

- création de `test-data/current-offer.json` ;
- scoring vers `reports/current-compatibility.json` et `.md` ;
- validation humaine OUI ;
- génération sous `generated/current/` ;
- suivi sous `tracking/current/` ;
- package sous `review-packages/CURRENT-OFFER/`.

`run-test-pipeline.js` relance le pipeline historique complet sur TEST-001.

Commandes :

```bash
npm.cmd run app:start
npm.cmd run pipeline:test
```

Ces scripts restent locaux et n'envoient aucune candidature.

## Recherche automatique d'offres

`search-jobs.js` lit `config/search-profile.json`, interroge le FOREM Open Data en priorité et utilise Adzuna ou Jooble seulement si les clés optionnelles existent dans `.env`.

`search-and-score-jobs.js` relance la recherche, applique le moteur local à chaque offre, trie les résultats et conserve dans le classement principal les scores supérieurs ou égaux au seuil configuré.

Commandes :

```bash
npm.cmd run jobs:search
npm.cmd run jobs:rank
```

Aucun site protégé n'est scrappé et aucune candidature n'est envoyée.

## Pipeline dynamique par offre

`run-pipeline-for-offer.js` accepte un identifiant d'offre présent dans les derniers résultats ou un chemin JSON.

Préparation seulement :

```bash
npm.cmd run pipeline:current -- FOREM-123456
```

Préparation puis génération après validation humaine :

```bash
npm.cmd run pipeline:current -- FOREM-123456 OUI
```

Les sorties utilisent l'identifiant de l'offre et ne dépendent pas de TEST-001.
## CV Pro Upgrade

`generate-upgraded-cv-pdfs.js` convertit localement les deux nouvelles versions du CV en PDF :

- `cv-upgrade/visual/cv-hassan-visual-upgraded.pdf`
- `cv-upgrade/ats/cv-hassan-ats.pdf`

Commande :

```bash
npm.cmd run cv:upgrade:pdf
```

Le script utilise Chrome ou Edge local via Node.js natif. S'il ne trouve pas de navigateur compatible, il crée un rapport avec la méthode manuelle d'impression PDF. Il ne modifie pas le CV original et ne change pas le pipeline JobHunter automatique.
## publish-check.js

`publish-check.js` vérifie que les fichiers essentiels de la démo recruteur existent et signale les éléments à ne pas publier, comme `.env`, `node_modules` ou les dossiers de sortie locale.

Commande :

```bash
npm run publish:check
```

Le script ne supprime rien. Il sert uniquement de contrôle avant publication GitHub ou partage avec un recruteur.
