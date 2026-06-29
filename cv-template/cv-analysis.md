# Analyse du CV

Analyse réalisée à partir de `cv-template/index.html` et de la copie de référence `cv-template/CV_Hassan_Chajai_BASE.html`.

## Structure HTML actuelle

Le CV est un document HTML autonome :

- `<!DOCTYPE html>` avec langue `fr`.
- Métadonnées classiques : `charset`, `viewport`, titre.
- Import Google Fonts : Space Grotesk, Inter, JetBrains Mono.
- Styles CSS intégrés dans une balise `<style>`.
- Corps principal dans `.cv-container`, au format A4 `210mm x 297mm`.
- Fond visuel `.grid-background`.
- Contenu principal `.content`.
- En-tête `.header`.
- Grille en deux colonnes `.main-grid`.
- Colonne gauche `.left-column`.
- Colonne droite `.right-column`.

Le CV est conçu comme une page A4 visuelle prête pour impression ou export PDF.

## Sections présentes

### En-tête

- Nom : Hassan Chajai.
- Titre professionnel : Développeur Web Fullstack - Stagiaire.
- Accroche : profil atypique en reconversion, rigueur scientifique, passion pour le code, prêt à s'investir.

### Colonne gauche

- Contact.
- Compétences.
- Langues.
- Aides FOREM.
- QR codes GitHub et LinkedIn.

### Colonne droite

- À propos.
- Formation en cours.
- Formation antérieure.
- Projets personnels.
- Expérience.

## Informations identifiées

### Coordonnées

- Nom complet : Hassan Chajai.
- Email : chajai.hassan@gmail.com.
- Téléphone : +32 492 41 15 45.
- Adresse : Cité André Renard 107, 6180 Courcelles.
- GitHub : https://github.com/hassinho10.
- LinkedIn : https://linkedin.com/in/hassanchajai.

### Titre professionnel

- Développeur Web Fullstack - Stagiaire.

### Résumé / profil

Le profil indique :

- développeur web fullstack en reconversion ;
- formation intensive à Technofutur TIC à Gosselies ;
- parcours précédent en sciences biomédicales ;
- expérience en industrie pharmaceutique GMP ;
- objectif d'intégrer une équipe en stage ;
- volonté de contribuer à des projets, monter en compétences et valoriser un profil atypique.

### Compétences techniques

Front-end :

- HTML5.
- CSS3.
- JavaScript.
- Angular.
- React, niveau introduction.
- Ionic.
- Responsive Design.

Back-end :

- Node.js.
- NestJS.
- Express.js.
- APIs REST.
- PHP.

Base de données :

- SQL.
- MySQL.
- Modélisation relationnelle.

DevOps et outils :

- Git.
- Docker.
- Kubernetes.
- Cloud.
- SCRUM.
- UML.
- Figma.

Programme de formation complémentaire :

- Algorithmique.
- SQL déclaratif et procédural.
- Ajax.
- Cybersécurité.
- IA pour le développement.
- Projet individuel Web App.

### Soft skills

- Autodidacte.
- Rigueur.
- Esprit analytique.
- Esprit d'équipe.
- Adaptabilité.
- Gestion du stress.
- Relation client.
- Travail en équipe.
- Traçabilité.
- Sens des normes qualité.

### Langues

- Français : maternel.
- Anglais : professionnel technique.
- Italien : maternel.

### Formations

- Développeur Web Apps Full Stack - Technologies JavaScript Modernes, Technofutur TIC, Gosselies, 2026, 6 mois, en cours.
- Sciences Biomédicales, HELHa, Montignies-sur-Sambre, 09-2020 à 06-2025.
- CESS, Athénée Royal Les Marlaires, Gosselies, 06-2020.

### Projets personnels

- BarberConnect : application de gestion de rendez-vous avec calendrier dynamique, créneaux, logique métier et interface client.
- RestoOrder : application de commande en ligne avec menu dynamique, panier, suivi temps réel et base SQL structurée.
- Msemmen Pro : site e-commerce avec catalogue produits, filtrage dynamique, UX soignée et responsive.
- Life Manager : dashboard de productivité avec statistiques, suivi d'habitudes et indicateurs visuels.

### Expériences

- Opérateur / Technicien Pharma, Catalent / Novo Nordisk, Bruxelles, 2025.
  Contexte : pharma GMP, rigueur, traçabilité, normes qualité, travail en équipe critique.
- Étudiant Horeca, secteur restauration, 2020 à 2024.
  Contexte : gestion du stress, relation client, adaptabilité, travail en équipe.

### Aides et contexte FOREM

- Aides FOREM affichées : APE, PFI, SESAM.

## Parties qui pourront devenir dynamiques plus tard

- Titre professionnel.
- Accroche sous le titre.
- Texte de profil.
- Ordre des catégories de compétences.
- Ordre des compétences dans chaque catégorie.
- Mise en avant de certains projets selon l'offre.
- Mise en avant de certaines expériences selon l'offre.
- Résumé des projets.
- Mots-clés techniques liés à une offre.
- QR codes ou liens, si une version spécifique est nécessaire.
- Informations de stage, si reprises depuis la lettre ou les paramètres.

## Parties à ne pas toucher pour préserver le design

- Structure générale `.cv-container`.
- Format A4 en `210mm x 297mm`.
- Layout en deux colonnes `.main-grid`.
- Largeur des colonnes `.left-column` et `.right-column`.
- Classes de style existantes.
- Fond quadrillé `.grid-background`.
- Couleurs principales noir, cyan et bleu.
- Typographies importées.
- Paramètres d'impression `@page` et `@media print`.
- QR codes, sauf si les liens changent volontairement.

## Risques techniques éventuels

- Le CSS est intégré directement dans le HTML : toute génération automatique devra éviter de casser les classes existantes.
- Le CV est dimensionné précisément pour une page A4 : ajouter trop de contenu peut provoquer un débordement non visible ou un mauvais export PDF.
- Les caractères accentués apparaissent dégradés dans le fichier actuel, par exemple `DÃ©veloppeur` au lieu de `Développeur`. Il faudra traiter l'encodage plus tard avec prudence, sans modifier le contenu de fond.
- Les QR codes dépendent d'un service externe `api.qrserver.com`. Pour un export offline ou une preuve stable, il faudra envisager des QR codes locaux.
- Les polices Google Fonts nécessitent un accès réseau. Pour une génération PDF locale fiable, il faudra peut-être intégrer ou remplacer les polices.
- Les données sont directement dans le HTML, pas encore séparées en variables.

## Améliorations possibles plus tard

- Séparer le contenu structuré dans `profile-data.json`.
- Créer un moteur de génération HTML à partir du profil et d'une offre.
- Ajouter des zones dynamiques balisées avec des attributs `data-field`.
- Prévoir une version PDF stable.
- Corriger l'encodage des caractères accentués après validation.
- Ajouter un contrôle automatique de débordement visuel avant export PDF.
- Préparer une version plus ATS-friendly si une plateforme de candidature lit mal les CV très graphiques.
