# Preuves FOREM

Ce document définit la façon de stocker les preuves de candidature dans JobHunter Belgium AI.

## Preuves acceptables

Une preuve acceptable doit correspondre à une action réelle.

Exemples :

- email envoyé ;
- accusé de réception ;
- capture écran de formulaire envoyé ;
- réponse automatique de plateforme ;
- réponse recruteur ;
- invitation entretien ;
- relance envoyée.

## Ne jamais inventer une preuve

Une preuve ne doit jamais être créée pour simuler une action.

Il est interdit de :

- créer une fausse confirmation d'envoi ;
- créer une capture fictive ;
- marquer une candidature comme envoyée si elle ne l'est pas ;
- inventer une date de relance ;
- inventer une réponse recruteur.

## Nommage des fichiers

Utiliser un nom clair avec :

- l'identifiant de l'offre ;
- le type de preuve ;
- la date réelle ;
- une extension adaptée.

Exemples :

- `TEST-001_email-envoye_2026-06-05.pdf`
- `TEST-001_accuse-reception_2026-06-05.pdf`
- `TEST-001_capture-formulaire_2026-06-05.png`
- `TEST-001_reponse-recruteur_2026-06-10.pdf`

## Relier une preuve à une candidature

Chaque preuve doit être ajoutée dans le dossier correspondant à l'offre :

```text
proofs/TEST-001/
```

Le fichier `proof-index.json` devra ensuite référencer :

- le type de preuve ;
- le chemin du fichier ;
- la date réelle ;
- un commentaire si nécessaire.

## Mise à jour du suivi

Quand une vraie preuve est ajoutée :

1. Ajouter le fichier dans `proofs/TEST-001/`.
2. Mettre à jour `proof-index.json`.
3. Mettre à jour le suivi FOREM.
4. Changer le statut uniquement si l'action réelle a eu lieu.

Tant qu'aucune candidature n'est réellement envoyée, le statut doit rester `candidature_prete_non_envoyee`.
