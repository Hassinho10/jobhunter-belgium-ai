# Intégration recherche automatique vers génération

## Avant

La recherche automatique affichait les offres, tandis que la génération utilisait principalement une offre générique `CURRENT-OFFER` et des noms de fichiers fixes.

L'utilisateur devait encore passer par un flux proche du formulaire manuel et les offres sous le seuil ne pouvaient pas être préparées.

## Maintenant

Chaque offre affichée possède :

- son identifiant ;
- son poste ;
- son entreprise ;
- son lieu ;
- sa source ;
- son score ;
- un résumé court ;
- un bouton `Préparer candidature`.

Le bouton utilise directement les données stockées dans `data/jobs-ranked.json` ou `data/jobs-found.json`.

## Routes

### Préparation

```text
POST /api/jobs/:id/prepare
```

Cette route :

- retrouve l'offre ;
- écrit `data/current-offer.json` ;
- écrit `test-data/current-offer.json` ;
- calcule le score ;
- crée le plan d'adaptation ;
- réinitialise la validation à `en_attente` ;
- retourne les informations à l'interface.

### Génération

```text
POST /api/jobs/:id/generate
```

Cette route :

- exige `confirmation = OUI` ;
- vérifie que l'identifiant correspond à l'offre préparée ;
- génère le CV et la lettre HTML ;
- génère les deux PDF ;
- génère le message ;
- génère le suivi FOREM ;
- crée un index de preuves vide ;
- crée le package local d'examen.

## Noms dynamiques

Exemple pour `FOREM-1958728` :

- `generated/cv-html/cv-FOREM-1958728.html`
- `generated/pdf/cv-FOREM-1958728.pdf`
- `generated/lettre-html/lettre-FOREM-1958728.html`
- `generated/pdf/lettre-FOREM-1958728.pdf`
- `generated/messages/message-FOREM-1958728.txt`
- `tracking/forem-suivi-FOREM-1958728.csv`
- `review-packages/FOREM-1958728/`

## Utilisation

1. Lancer JobHunter Studio.
2. Chercher les offres.
3. Cliquer sur `Préparer candidature`.
4. Relire l'offre et le score.
5. Confirmer OUI uniquement si la candidature doit être générée.
6. Ouvrir les fichiers proposés.

## Limites

- Le FOREM Open Data ne fournit pas toujours la description complète.
- Un score faible reste affiché et doit inciter à la prudence.
- La génération ne signifie jamais que la candidature est envoyée.
- Aucune preuve d'envoi n'est créée.
- Les services externes ne sont pas connectés.

## Test en ligne de commande

```bash
npm.cmd run jobs:rank
npm.cmd run pipeline:current -- data/current-offer.json OUI
```
