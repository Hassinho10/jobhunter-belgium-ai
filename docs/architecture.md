# Architecture

Ce document présente l'architecture fonctionnelle de JobHunter Belgium AI.

## Vue d'ensemble

L'application repose sur plusieurs blocs :

- Interface locale JobHunter Studio.
- Profil candidat structuré en JSON.
- Moteur de scoring local.
- Générateurs HTML pour CV, lettre et message.
- Conversion PDF locale lorsque le navigateur le permet.
- Suivi FOREM en CSV, JSON et Markdown.
- Validation humaine obligatoire avant toute génération finale.
- Connecteurs d'offres autorisés, avec FOREM Open Data en priorité.

## Pipeline local

1. Une offre est saisie manuellement ou récupérée via une source autorisée.
2. L'offre est normalisée dans un format commun.
3. Le moteur compare l'offre au profil candidat.
4. Un score, une décision et des points d'attention sont produits.
5. Un plan d'adaptation est préparé sans modifier les originaux.
6. La personne valide OUI / NON / MODIFIER.
7. Après OUI, le dossier local de candidature est généré.
8. Le suivi FOREM est mis à jour avec le statut approprié.

## Données locales

- `cv-template/profile-data.json` : profil structuré.
- `test-data/` : offres de démonstration.
- `data/` : résultats de recherche courants.
- `reports/` : rapports de compatibilité et de contrôle.
- `validations/` : décisions et clarifications humaines.
- `generated/` : fichiers produits localement.
- `tracking/` : suivi FOREM local.
- `proofs/` : index de preuves réelles.

## Recherche d'offres

Les sources autorisées sont utilisées par API ou fichier structuré. Le projet ne contourne pas les protections de sites, ne scrape pas les plateformes protégées et ne franchit pas de CAPTCHA ou de login.

## Documents de candidature

Le CV et la lettre de base servent de modèles. Les adaptations autorisées portent sur le titre, le résumé, l'ordre des éléments et la mise en avant des informations réelles.

Les informations absentes du profil ne doivent pas être ajoutées.

## Validation humaine

Avant toute génération finale, l'application présente :

- l'offre analysée ;
- le score de compatibilité ;
- les points forts ;
- les points faibles ;
- le plan proposé ;
- les éléments à vérifier.

La décision possible est :

- `OUI` : génération locale autorisée ;
- `NON` : offre refusée ou mise de côté ;
- `MODIFIER` : correction requise avant génération.

## Suivi FOREM

Le suivi conserve :

- l'offre ;
- le score ;
- la décision ;
- les documents préparés ;
- le statut courant ;
- les preuves réelles lorsqu'elles existent ;
- les relances uniquement lorsqu'elles sont justifiées.

Aucune candidature ne doit être indiquée comme envoyée sans action réelle et preuve réelle.
