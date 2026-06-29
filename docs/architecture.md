# Architecture

Ce document décrit l'architecture cible de JobHunter Belgium AI. Pour l'instant, aucune connexion externe n'est configurée.

## Vue d'ensemble

JobHunter Belgium AI sera construit autour de plusieurs briques :

- n8n pour orchestrer les étapes.
- Google Sheets pour le suivi structuré.
- Gmail pour recevoir ou préparer des candidatures.
- Google Drive pour stocker CV, messages, PDF et preuves.
- OpenAI pour analyser, scorer, reformuler et générer.
- Un CV HTML/CSS comme source de mise en page personnalisable.
- Une validation humaine obligatoire avant toute action sensible.

## n8n

n8n jouera le rôle d'orchestrateur.

Il pourra plus tard :

- déclencher une analyse lorsqu'une nouvelle offre est reçue ;
- envoyer les données de l'offre au module IA ;
- mettre à jour Google Sheets ;
- préparer un CV adapté ;
- préparer un message de candidature ;
- demander une validation humaine ;
- stocker les preuves ;
- planifier les relances.

n8n ne devra pas envoyer automatiquement une candidature sans validation humaine.

## Google Sheets

Google Sheets servira de base de suivi.

Les modèles CSV du dossier `sheets-templates` pourront devenir des onglets Google Sheets :

- offres détectées ;
- candidatures envoyées ;
- preuves FOREM ;
- relances ;
- historique IA ;
- paramètres personnels.

L'objectif est d'avoir un suivi clair, vérifiable et facilement partageable avec une conseillère FOREM.

## Gmail

Gmail pourra être utilisé plus tard pour :

- détecter des offres reçues par email ;
- préparer des brouillons de candidature ;
- conserver les échanges avec les recruteurs ;
- identifier les réponses reçues.

Au stade actuel, Gmail n'est pas connecté.

## Google Drive

Google Drive pourra stocker :

- le CV de base ;
- les CV adaptés ;
- les versions PDF ;
- les messages de candidature ;
- les captures ou preuves d'envoi ;
- les documents utiles pour le FOREM.

Les tableaux contiendront seulement des liens vers ces fichiers.

## OpenAI

OpenAI pourra intervenir plus tard pour :

- analyser une offre ;
- extraire les critères importants ;
- comparer l'offre au CV ;
- calculer un score de compatibilite ;
- expliquer le score ;
- adapter le CV sans inventer ;
- générer un message de candidature ;
- préparer une demande de validation humaine.

Règle essentielle : l'IA ne doit jamais inventer d'expérience, de diplôme, de compétence ou de certification.

## CV HTML/CSS

Le dossier `cv-template` contient la base du CV.

Le CV HTML/CSS permettra :

- une mise en page contrôlée ;
- une adaptation fine selon l'offre ;
- une future génération PDF ;
- une séparation claire entre contenu, données et style.

Le fichier `data-example.json` sert d'exemple de structure pour les données du CV.

## Validation humaine

La validation humaine est une étape centrale.

Avant toute candidature, le système devra présenter :

- l'offre analysée ;
- le score IA ;
- les raisons du score ;
- les points à vérifier ;
- le CV adapté ;
- le message proposé.

La personne doit choisir :

- OUI : la candidature peut être préparée ou envoyée selon le workflow futur ;
- NON : l'offre est refusée ou mise de côté ;
- MODIFIER : le CV, le message ou l'analyse doit être corrigé.

## Stockage des preuves

Chaque candidature doit pouvoir être prouvée.

Les preuves possibles incluent :

- confirmation d'envoi ;
- capture d'écran ;
- email envoyé ;
- réponse automatique ;
- document PDF ;
- lien vers une plateforme.

Ces preuves seront référencées dans `preuves-forem.csv`.
