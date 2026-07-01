# JobHunter Belgium AI

JobHunter Belgium AI est une application locale Node.js pour organiser une recherche d'emploi ou de stage en Belgique.

Le projet centralise des offres, calcule un score de compatibilité avec un profil candidat, prépare des documents de candidature contrôlés et produit un suivi FOREM vérifiable. La génération reste locale et aucune candidature n'est envoyée automatiquement.

## Fonctionnalités

- Recherche d'offres via sources autorisées, avec FOREM Open Data en priorité.
- Saisie manuelle d'une offre depuis l'interface locale.
- Scoring local sur 100 avec points forts, points faibles et recommandation.
- Préparation d'un CV HTML, d'une lettre HTML et d'un message de candidature.
- Génération PDF lorsque Chrome ou Edge est disponible sur l'environnement.
- Validation humaine obligatoire avant toute génération de dossier.
- Suivi FOREM local en JSON, CSV et Markdown.
- Package d'examen regroupant les documents utiles avant candidature réelle.
- Stockage structuré des preuves, sans création de preuve fictive.

## Principes

- Le CV et la lettre de base ne sont jamais modifiés.
- Le système ne doit jamais inventer d'expérience, diplôme, compétence, certification, entreprise, durée ou preuve.
- Une compétence en apprentissage est présentée comme telle.
- Une candidature ne peut pas être marquée comme envoyée sans action réelle et preuve réelle.
- Les connexions externes sensibles restent désactivées par défaut.

## Lancer l'application

Prérequis : Node.js.

```bash
npm install
npm run app:start
```

Ouvrir ensuite :

```text
http://localhost:4173
```

Pour un test sur le même réseau local :

```bash
npm run app:network
```

## Scripts utiles

```bash
npm run score:test
npm run adapt:test
npm run validate:oui
npm run generate:cv:test
npm run generate:lettre:test
npm run generate:pdf:test
npm run tracking:test
npm run package:review:test
npm run jobs:search
npm run jobs:rank
npm run publish:check
```

## Structure principale

```text
app/                     Interface JobHunter Studio
config/                  Paramètres de recherche
cv-template/             CV HTML/CSS de base et profil structuré
cv-upgrade/              Versions améliorées du CV
docs/                    Documentation produit et architecture
google-sheets-import/    CSV prêts pour import manuel
lettre-template/         Lettre HTML de base
n8n-workflows/           Emplacement prévu pour workflows exportés
reports/                 Rapports locaux de compatibilité et contrôle
scripts/                 Moteurs locaux et commandes projet
sheets-templates/        Modèles CSV FOREM
sources/                 Connecteurs d'offres autorisés
test-data/               Données de démonstration
validations/             Validations et clarifications humaines
```

Les dossiers `generated/`, `tracking/`, `proofs/` et `review-packages/` sont utilisés localement et ne sont pas destinés à contenir des preuves ou candidatures réelles dans le dépôt public.

## Démo recruteur

Voir :

- `README_RECRUITER.md`
- `docs/deploiement-recruteur.md`

Résumé court :

> Application locale de recherche d'emploi/stage : collecte d'offres, scoring de compatibilité, adaptation contrôlée de CV/lettre, validation humaine et suivi FOREM, sans envoi automatique.
