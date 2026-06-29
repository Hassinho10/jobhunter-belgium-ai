# Implémentation de la recherche automatique

## Sources connectées

### FOREM Open Data

La source principale utilise le jeu officiel `offres-d-emploi-forem` publié sur Open Data Wallonie-Bruxelles.

Endpoint :

```text
https://www.odwb.be/api/explore/v2.1/catalog/datasets/offres-d-emploi-forem/records
```

Cette source fonctionne sans clé API.

## Sources optionnelles

### Adzuna

Le connecteur utilise l'API officielle de recherche d'annonces. Il reste désactivé si ces variables sont absentes de `.env` :

```text
ADZUNA_APP_ID
ADZUNA_APP_KEY
```

### Jooble

Le connecteur utilise l'API Jooble uniquement si cette variable est présente :

```text
JOOBLE_API_KEY
```

La documentation publique Jooble peut être protégée par Cloudflare. Le connecteur ne tente jamais de contourner cette protection.

## Normalisation

Toutes les sources sont converties vers un format commun :

- identifiant ;
- source ;
- entreprise ;
- poste ;
- lieu ;
- contrat ;
- lien ;
- description disponible ;
- outils et langues disponibles ;
- niveau d'expérience ;
- date de détection.

Un champ absent reste vide ou porte la valeur `à vérifier`.

## Limites

- Le jeu Open Data FOREM fournit surtout des métadonnées et pas toujours le texte détaillé de l'offre.
- Le scoring dépend donc de la qualité des données publiées.
- Adzuna et Jooble exigent des clés.
- Gmail et les alertes email ne sont pas connectés.
- Une seule recherche est conservée dans les fichiers `jobs-found` et `jobs-ranked`.

## Pourquoi utiliser les API

Les API offrent un accès autorisé, structuré et stable. Le projet ne scrape pas LinkedIn, Indeed, StepStone ou d'autres sites protégés et ne contourne aucun login, CAPTCHA ou mécanisme anti-bot.

## Lancement

```bash
npm.cmd run jobs:search
npm.cmd run jobs:rank
npm.cmd run app:start
```

Dans l'application, utiliser **Chercher des offres automatiquement**, puis **Préparer candidature** sur une offre atteignant le seuil. Une confirmation humaine OUI reste obligatoire avant la génération des documents.

## Sécurité

- aucune candidature envoyée ;
- aucun statut envoyé produit ;
- aucune preuve inventée ;
- aucune relance inventée ;
- aucun service de messagerie connecté.
