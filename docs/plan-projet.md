# Plan projet

Ce document présente l'évolution fonctionnelle de JobHunter Belgium AI.

## Version locale

Objectif : disposer d'une application utilisable sans compte externe.

- Structurer le profil candidat.
- Préparer les modèles HTML du CV et de la lettre.
- Ajouter une offre de démonstration.
- Calculer un score de compatibilité.
- Préparer un plan d'adaptation contrôlé.
- Enregistrer une validation humaine.
- Générer un dossier local de candidature.
- Produire un suivi FOREM local.

## Version recherche d'offres

Objectif : réduire la saisie manuelle.

- Interroger FOREM Open Data.
- Ajouter Adzuna et Jooble si des clés sont disponibles.
- Normaliser les offres dans un format commun.
- Dédupliquer les résultats.
- Classer les offres par score.
- Préparer une candidature depuis une offre sélectionnée.

## Version suivi

Objectif : produire un suivi clair et vérifiable.

- Exporter les données en CSV.
- Préparer l'import manuel dans Google Sheets.
- Conserver les preuves réelles lorsqu'elles existent.
- Éviter toute relance ou preuve inventée.
- Garder un historique exploitable pour un rendez-vous FOREM.

## Version orchestration

Objectif : connecter progressivement des services externes, uniquement après validation.

- Orchestration n8n.
- Synchronisation Google Sheets.
- Stockage Google Drive.
- Brouillons Gmail.
- Moteur d'analyse avancé optionnel.

La validation humaine reste obligatoire dans toutes les versions.

## Version finale

Objectif : disposer d'un assistant complet de recherche d'emploi/stage.

- Collecte multi-sources autorisée.
- Analyse et scoring.
- Adaptation contrôlée des documents.
- Validation humaine.
- Suivi FOREM.
- Preuves réelles.
- Relances justifiées.
- Package de candidature vérifiable.
