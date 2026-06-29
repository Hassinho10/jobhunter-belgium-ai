# Analyse de la lettre de motivation

Analyse réalisée à partir de `lettre-template/index.html` et de la copie de référence `lettre-template/Lettre_Motivation_Hassan_Chajai_BASE.html`.

## Structure HTML actuelle

La lettre est un document HTML autonome :

- `<!DOCTYPE html>` avec langue `fr`.
- Métadonnées classiques : `charset`, `viewport`, titre.
- Import Google Fonts : Space Grotesk, Inter, JetBrains Mono.
- Styles CSS intégrés dans une balise `<style>`.
- Corps principal dans `.cv-container`, réutilisant le même esprit visuel que le CV.
- Fond visuel `.grid-background`.
- En-tête `.header`.
- Grille en deux colonnes `.main-grid`.
- Colonne gauche `.left-column` pour les coordonnées et informations de stage.
- Colonne droite `.right-column` pour le corps de la lettre.

## Sections présentes

### En-tête

- Nom : Hassan Chajai.
- Titre : Développeur Web Fullstack - Stagiaire.
- Accroche : profil atypique en reconversion, rigueur scientifique, passion pour le code, prêt à s'investir.

### Colonne gauche

- Mes coordonnées.
- Candidature.
- Infos stage.
- QR codes GitHub et LinkedIn.

### Colonne droite

- Objet de la lettre.
- Formule d'appel.
- Paragraphes de motivation.
- Signature.

## Parties fixes

Ces éléments peuvent rester stables dans la majorité des candidatures :

- Identité : Hassan Chajai.
- Coordonnées personnelles.
- Liens GitHub et LinkedIn.
- Signature.
- Style visuel global.
- Structure A4.
- Mention du parcours en reconversion, si elle reste pertinente.
- Mention des projets personnels, si elle reste fidèle au profil réel.
- Règle de non-invention.

## Parties dynamiques futures

Ces éléments pourront être personnalisés selon chaque offre :

- Objet de la lettre.
- Type de candidature : spontanée, réponse à une offre, stage, emploi.
- Nom de l'entreprise.
- Nom du poste.
- Formule d'introduction.
- Premier paragraphe, pour expliquer pourquoi l'entreprise ou l'offre est ciblée.
- Sélection des compétences mises en avant.
- Sélection des projets cités.
- Mise en avant de l'expérience pharma, Horeca ou formation selon le contexte.
- Phrase sur l'adaptation au stack technique de l'entreprise.
- Disponibilité et modalités de stage, si elles restent valables.
- Conclusion et appel à l'entretien.

## Informations identifiées dans la lettre

- Recherche : stage développeur web fullstack.
- Durée : 5 semaines.
- Début : 18 mai 2026.
- Stage : conventionné par le FOREM.
- Type : non rémunéré.
- Formation : Développeur Web Apps Full Stack à Technofutur TIC, Gosselies.
- Zone : Charleroi et alentours.
- Localisation personnelle : Courcelles.
- Aides affichées : APE, PFI, SESAM.
- Stack cité : Angular, Node.js, NestJS, Express, SQL, modélisation relationnelle, Git, Docker, Kubernetes, SCRUM, cybersécurité.
- Parcours antérieur : 5 ans en Sciences Biomédicales à la HELHa.
- Expérience : opérateur / technicien en industrie pharmaceutique chez Catalent et Novo Nordisk, environnement GMP.
- Projets cités : BarberConnect, RestoOrder, Msemmen Pro, Life Manager.

## Paragraphes personnalisables

- Paragraphe 1 : type de candidature, entreprise ciblée, poste ciblé, dates.
- Paragraphe 2 : compétences techniques à mettre en avant.
- Paragraphe 3 : lien entre parcours scientifique/pharma et besoins de l'entreprise.
- Paragraphe 4 : projets personnels à citer selon l'offre.
- Paragraphe 5 : motivation spécifique pour l'équipe ou le domaine.
- Paragraphe 6 : informations pratiques et aides, à garder seulement si pertinentes.
- Paragraphe final : disponibilité pour entretien.

## Eléments à personnaliser selon chaque offre

- Nom de l'entreprise.
- Poste exact.
- Source de l'offre.
- Technologies demandées.
- Projets les plus proches de l'offre.
- Compétences les plus pertinentes.
- Ton : candidature spontanée, réponse formelle, stage, emploi, job étudiant.
- Formulation du bénéfice pour l'employeur.

## Risques techniques éventuels

- La lettre contient son CSS directement dans le HTML : une génération automatique devra préserver la structure et les classes.
- Le format A4 est fixe : ajouter trop de texte peut provoquer un débordement.
- Les caractères accentués apparaissent dégradés dans le fichier actuel, par exemple `DÃ©veloppeur` au lieu de `Développeur`. Cette correction devra être traitée séparément.
- Les QR codes utilisent un service externe.
- Les polices Google Fonts nécessitent un accès réseau.
- La lettre est actuellement une candidature spontanée : elle ne doit pas être utilisée telle quelle pour répondre à une offre sans adaptation future.

## Règle de prudence

La lettre peut être reformulée ou personnalisée, mais elle ne doit jamais inventer d'expérience, de diplôme, de compétence, d'entreprise, de disponibilité ou de certification.
