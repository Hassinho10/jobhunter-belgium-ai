# Plan Projet

Ce document décrit les étapes prévues pour construire JobHunter Belgium AI progressivement, sans connecter de comptes externes au départ.

## MVP 1 - Base locale

Objectif : disposer d'une structure claire et de modèles prêts à remplir.

- Créer l'arborescence du projet.
- Préparer le template de CV HTML/CSS.
- Rédiger les prompts de base.
- Créer les modèles CSV pour le suivi FOREM.
- Documenter l'architecture cible.

Livrable : projet local prêt à recevoir le CV de base et des exemples d'offres.

## MVP 2 - Analyse manuelle d'offres

Objectif : analyser des offres copiées manuellement.

- Ajouter un fichier ou formulaire local pour coller une offre.
- Appliquer le prompt d'analyse.
- Produire un résumé de l'offre.
- Identifier les critères importants : poste, contrat, lieu, compétences, expérience, langue, diplôme.
- Enregistrer le résultat dans `offres-detectees.csv`.

Livrable : une offre peut être analysée sans automatisation externe.

## MVP 3 - Scoring par rapport au CV

Objectif : comparer une offre au CV de base.

- Structurer les données du CV.
- Extraire les critères de l'offre.
- Calculer un score IA.
- Expliquer les points forts, écarts et risques.
- Définir une recommandation : candidater, attendre, refuser ou modifier.

Livrable : chaque offre reçoit un score et une justification lisible.

## MVP 4 - Adaptation du CV

Objectif : générer une version adaptée du CV sans mentir.

- Utiliser le CV HTML/CSS comme base.
- Réorganiser les sections selon l'offre.
- Reformuler uniquement des informations réelles.
- Mettre en avant les compétences pertinentes.
- Préparer une future génération PDF.

Livrable : un CV HTML adapté à une offre précise.

## MVP 5 - Message de candidature

Objectif : préparer un message professionnel et personnalisable.

- Générer un email ou message court.
- Adapter le ton au type d'offre.
- Mentionner les éléments les plus pertinents du CV.
- Ne pas prétendre avoir envoyé la candidature.

Livrable : message prêt à être validé ou modifié.

## MVP 6 - Validation humaine

Objectif : imposer une étape de décision humaine.

- Présenter le résumé de l'offre.
- Présenter le score IA.
- Présenter le CV adapté et le message.
- Demander une décision : OUI, NON ou MODIFIER.
- Journaliser la décision dans les tableaux.

Livrable : aucune candidature ne part sans validation.

## MVP 7 - Suivi FOREM

Objectif : produire un suivi fiable et vérifiable.

- Compléter les tableaux `candidatures.csv`, `preuves-forem.csv` et `relances.csv`.
- Stocker les liens vers preuves.
- Suivre les relances prévues.
- Préparer une vue claire pour la conseillère FOREM.

Livrable : suivi exploitable pour rendez-vous, contrôle ou accompagnement.

## MVP 8 - Automatisation contrôlée

Objectif : connecter progressivement n8n, Google Sheets, Gmail, Google Drive et OpenAI.

- Connecter Google Sheets comme base de suivi.
- Ajouter Google Drive pour les CV, PDF et preuves.
- Ajouter Gmail pour recevoir ou préparer les messages.
- Ajouter OpenAI pour les analyses et générations.
- Ajouter n8n comme orchestrateur.
- Conserver la validation humaine obligatoire.

Livrable : workflow automatisé, mais contrôlé.

## MVP final - Assistant complet

Objectif : disposer d'un assistant complet de recherche d'emploi/stage.

- Collecte multi-sources.
- Analyse et scoring.
- CV adapté.
- Message de candidature.
- Validation humaine.
- Envoi ou préparation de candidature.
- Preuves stockées.
- Relances suivies.
- Historique IA auditable.

Livrable : assistant opérationnel avec suivi précis pour le FOREM.
