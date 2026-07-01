# Scripts

Ce dossier contient les moteurs locaux de JobHunter Belgium AI.

## Analyse et scoring

- `score-offer.js` : compare le profil local avec l'offre TEST-001.
- `search-jobs.js` : recherche des offres via sources autorisées.
- `search-and-score-jobs.js` : recherche, score et classe les offres.
- `studio-pipeline.js` : pipeline utilisé par l'interface web locale.

Commandes :

```bash
npm run score:test
npm run jobs:search
npm run jobs:rank
```

## Adaptation et validation

- `prepare-adaptation.js` : prépare un plan d'adaptation écrit.
- `validate-application.js` : enregistre OUI / NON / MODIFIER.
- `apply-clarifications.js` : vérifie les réponses de clarification.

Commandes :

```bash
npm run adapt:test
npm run validate:oui
npm run validate:non
npm run validate:modifier
npm run clarify:test
```

## Documents

- `generate-cv-html.js` : génère une copie HTML adaptée du CV.
- `generate-lettre-html.js` : génère une copie HTML adaptée de la lettre.
- `check-generated-html.js` : contrôle les HTML avant conversion.
- `generate-pdf.js` : convertit les HTML en PDF si un navigateur compatible est disponible.
- `generate-upgraded-cv-pdfs.js` : convertit les CV améliorés en PDF.

Commandes :

```bash
npm run generate:cv:test
npm run generate:lettre:test
npm run check:html:test
npm run generate:pdf:test
npm run cv:upgrade:pdf
```

## Suivi et preuves

- `generate-tracking.js` : crée le suivi FOREM local.
- `check-proofs.js` : vérifie l'index de preuves.
- `create-review-package.js` : prépare un package local d'examen.
- `prepare-google-sheets-import.js` : prépare les CSV pour import manuel.

Commandes :

```bash
npm run tracking:test
npm run proofs:test
npm run package:review:test
npm run sheets:prepare:test
```

## Publication

- `publish-check.js` : contrôle les fichiers essentiels et rappelle les dossiers à ne pas publier.

Commande :

```bash
npm run publish:check
```

Les scripts restent locaux. Ils ne se connectent pas à des comptes personnels, n'envoient aucune candidature, ne créent aucune preuve fictive et ne marquent jamais une candidature comme envoyée sans action réelle.
