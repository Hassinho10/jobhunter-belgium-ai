# JobHunter Belgium AI - Démo recruteur

JobHunter Belgium AI est une mini-application locale qui accompagne une recherche d'emploi ou de stage en Belgique.

Elle permet de tester un flux complet : analyser une offre, mesurer sa compatibilité avec un profil junior, préparer des documents de candidature et produire un suivi FOREM, sans envoi automatique.

## Ce que la démo montre

- Recherche d'offres via sources autorisées, avec FOREM Open Data en priorité.
- Analyse locale d'une offre collée ou trouvée automatiquement.
- Score de compatibilité transparent.
- Recommandation : OUI / NON / MODIFIER.
- Génération locale d'un CV HTML, d'une lettre HTML, d'un message et d'un suivi FOREM.
- Génération PDF si Chrome ou Edge est disponible.
- Traçabilité : aucune candidature envoyée, aucune preuve inventée.

## Lancer en local

Prérequis : Node.js.

```bash
npm install
npm run app:start
```

Ouvrir ensuite :

```text
http://localhost:4173
```

## Tester rapidement

1. Cliquer sur `Charger TEST-001`.
2. Cliquer sur `Analyser l'offre`.
3. Lire le score et les points forts/faibles.
4. Cliquer sur `Générer candidature`.
5. Confirmer `OUI`.
6. Ouvrir les fichiers générés depuis les liens affichés.

## Limites assumées

- Aucun envoi réel de candidature.
- Aucune connexion à un compte personnel.
- Les clés Adzuna et Jooble sont optionnelles et absentes par défaut.
- Sur un hébergement web, la génération PDF dépend du navigateur disponible sur le serveur. Si les PDF ne sont pas disponibles, les versions HTML restent consultables.
- Le projet est un prototype local orienté démonstration de méthode, pas un SaaS multi-utilisateur.

## Sécurité et éthique

Le projet ne scrape pas LinkedIn, Indeed, StepStone ou des sites protégés. Il ne contourne aucun CAPTCHA, login ou mécanisme anti-bot.

Chaque candidature reste bloquée tant qu'une validation humaine explicite n'est pas donnée.
