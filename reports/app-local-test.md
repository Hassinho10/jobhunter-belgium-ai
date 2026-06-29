# JobHunter Studio local

## Lancement

Depuis le dossier `jobhunter-belgium-ai` :

```bash
npm.cmd run app:start
```

Ouvrir ensuite :

```text
http://127.0.0.1:4173
```

## Fonctionnalités disponibles

- saisie des informations principales d'une offre ;
- collage de la description complète ;
- création de `test-data/current-offer.json` ;
- scoring local sur 100 ;
- affichage des points forts et points faibles ;
- recommandation OUI, NON ou MODIFIER ;
- confirmation humaine OUI / NON avant génération ;
- génération locale du CV HTML et PDF ;
- génération locale de la lettre HTML et PDF ;
- génération du message de candidature ;
- création du suivi FOREM local ;
- création d'un index de preuves vide ;
- création d'un package local d'examen.

## Protections

- le CV original et la lettre originale restent inchangés ;
- aucune candidature n'est envoyée ;
- aucun statut envoyé n'est produit ;
- aucune preuve ou relance n'est inventée ;
- la génération est bloquée sans confirmation OUI ;
- aucune compétence ou expérience extérieure à `profile-data.json` n'est considérée comme acquise.

## Limites actuelles

- extraction structurée simple à partir du texte collé ;
- scoring par mots-clés et règles locales ;
- génération à partir de modèles HTML fixes ;
- impression PDF dépendante de Chrome ou Edge installé localement ;
- une seule offre courante est conservée à la fois ;
- aucune gestion multi-utilisateur ou authentification.

## Connexions futures avec n8n

- réception automatique d'offres depuis des sources autorisées ;
- orchestration des analyses par lot ;
- synchronisation validée avec Google Sheets ;
- archivage validé dans Google Drive ;
- préparation contrôlée d'emails Gmail ;
- conservation automatique des preuves réelles après envoi confirmé.

Ces connexions restent désactivées à cette étape.
