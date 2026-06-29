# Déploiement recruteur

## Objectif

Rendre JobHunter Belgium AI testable par un recruteur sans connecter de compte personnel et sans envoyer de candidature.

## Mode recommandé pour publication GitHub

Publier le code source avec :

- `app/`
- `scripts/`
- `sources/`
- `config/`
- `cv-template/`
- `lettre-template/`
- `test-data/offre-test.json`
- `README.md`
- `README_RECRUITER.md`
- `.env.example`

Ne pas publier :

- `.env`
- `generated/`
- `review-packages/`
- `proofs/`
- `tracking/`
- fichiers temporaires de navigateur ;
- preuves personnelles ;
- candidatures réelles.

Le fichier `.gitignore` prépare cette séparation.

## Commandes utiles

Contrôle avant publication :

```bash
npm run publish:check
```

Lancement local :

```bash
npm run app:start
```

Lancement sur réseau local :

```bash
npm run app:network
```

## Hébergement web possible

L'app est un serveur Node.js natif. Elle peut être déployée sur un hébergeur Node.js simple.

## Option simple : Render

Le fichier `render.yaml` prépare un Web Service Render gratuit :

- build : `npm install`
- start : `npm start`
- `HOST=0.0.0.0`

Étapes :

1. Publier le projet sur GitHub.
2. Aller sur Render.
3. Créer un nouveau Web Service depuis le dépôt GitHub.
4. Laisser Render détecter `render.yaml`.
5. Déployer.

Variables possibles :

- `PORT` : port fourni par l'hébergeur.
- `HOST` : souvent `0.0.0.0` sur un hébergeur.

Commande de démarrage :

```bash
node app/server.js
```

## Limites en hébergement

La recherche FOREM Open Data nécessite un accès réseau sortant.

La génération PDF nécessite Chrome, Edge ou un runtime compatible. Si l'hébergeur ne fournit pas de navigateur headless, l'app génère quand même les fichiers HTML, le message et le suivi, puis indique que les PDF doivent être générés localement.

## Message court pour recruteur

> J'ai développé JobHunter Belgium AI, un prototype local Node.js qui recherche des offres, les score par rapport à mon profil, prépare un CV/une lettre adaptés, génère un suivi FOREM et bloque tout envoi tant qu'une validation humaine n'est pas donnée. Le projet montre ma capacité à structurer un outil utile, automatiser un flux métier et rester rigoureux sur la traçabilité.
