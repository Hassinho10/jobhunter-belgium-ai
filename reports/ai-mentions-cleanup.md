# Rapport de nettoyage documentaire

## Objectif

Présenter le dépôt comme un projet professionnel : application locale de recherche d'emploi/stage, scoring, adaptation contrôlée de documents et suivi FOREM.

## Fichiers modifiés

- `README.md`
- `README_RECRUITER.md`
- `docs/architecture.md`
- `docs/deploiement-recruteur.md`
- `docs/methode-scoring.md`
- `docs/plan-projet.md`
- `docs/regles-adaptation-cv.md`
- `scripts/README.md`
- `n8n-workflows/README.md`
- `test-data/README.md`
- `test-data/offre-test.json`
- `test-data/analyse-attendue-test-001.md`
- `cv-template/index.html`
- `cv-template/profile-data.json`
- `cv-template/cv-analysis.md`
- `cv-upgrade/visual/cv-hassan-visual-upgraded.html`
- `cv-upgrade/ats/cv-hassan-ats.html`
- `reports/*.md` liés à la compatibilité, génération PDF, suivi et import CSV
- `reports/*.json` liés au plan d'adaptation et à la compatibilité
- `scripts/*.js` liés au scoring, PDF, suivi et import CSV
- `google-sheets-import/06_historique_ia.csv`

## Mentions supprimées

- Références à des prompts publics.
- Références directes à un environnement de génération ou d'assistance.
- Références directes à un fournisseur externe dans la documentation de présentation.
- Phrases de documentation structurées comme un journal de construction.

## Mentions reformulées

- `assistant IA de recherche d'emploi` est devenu `application locale de recherche d'emploi/stage`.
- `OpenAI` est devenu `moteur d'analyse avancé optionnel` ou `services externes`.
- `prompts de base` est devenu `règles d'analyse` ou a été retiré.
- `runtime local Codex` est devenu `navigateur local piloté en mode headless`.
- `IA pour le développement` est devenu `outils de développement`.
- `IA / productivité` est devenu `outils numériques / productivité`.
- `Score IA local` est devenu `Score local`.
- `Décision IA` est devenu `Décision`.

## Fichiers retirés du dépôt public

Les fichiers de prompts dans `prompts/` ont été retirés car ils ne sont pas nécessaires au fonctionnement actuel de la démo publique.

## Mentions conservées

- Le nom du projet `JobHunter Belgium AI` reste conservé.
- Les champs historiques de certains CSV gardent leur nom technique pour compatibilité avec les scripts existants.
- Les termes métier comme `assistant digital` sont conservés, car ils décrivent le type de poste visé.

## Nouveau résumé professionnel

JobHunter Belgium AI est une application locale Node.js qui aide à organiser une recherche d'emploi ou de stage en Belgique : recherche d'offres, scoring de compatibilité, adaptation contrôlée de CV et lettre, validation humaine obligatoire, suivi FOREM et préparation d'un package local d'examen, sans envoi automatique de candidature.
