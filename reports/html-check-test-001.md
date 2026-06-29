# Vérification HTML généré - TEST-001

## Fichiers vérifiés

- CV : `generated\cv-html\cv-test-001.html`
- Lettre : `generated\lettre-html\lettre-test-001.html`

## Contrôles réussis

- CV : présence <!DOCTYPE html>
- CV : présence <html
- CV : présence <head>
- CV : présence <body>
- CV : charset UTF-8
- CV : titre attendu "Stagiaire Assistant Digital & Automatisation"
- CV : absence de "maîtrise n8n"
- CV : absence de "expert n8n"
- CV : absence de "maîtrise Make"
- CV : absence de "expert Make"
- CV : absence de "maîtrise Trello"
- CV : absence de "expert Trello"
- CV : n8n non présenté comme maîtrisé
- CV : Make non présenté comme compétence
- CV : Trello non présenté comme compétence
- Lettre : présence <!DOCTYPE html>
- Lettre : présence <html
- Lettre : présence <head>
- Lettre : présence <body>
- Lettre : charset UTF-8
- Lettre : titre attendu "Stagiaire Assistant Digital & Automatisation"
- Lettre : absence de "maîtrise n8n"
- Lettre : absence de "expert n8n"
- Lettre : absence de "maîtrise Make"
- Lettre : absence de "expert Make"
- Lettre : absence de "maîtrise Trello"
- Lettre : absence de "expert Trello"
- Lettre : n8n non présenté comme maîtrisé
- Lettre : Make non présenté comme compétence
- Lettre : Trello non présenté comme compétence

## Alertes éventuelles

- Aucune alerte détectée par le contrôle statique.

## Vérification manuelle à faire par Hassan

- ouvrir `generated/cv-html/cv-test-001.html` dans le navigateur ;
- vérifier que le CV tient sur une page A4 ou reste propre à l’impression ;
- vérifier que le titre est correct ;
- vérifier que le projet JobHunter Belgium AI n’est pas trop mis en avant ;
- vérifier que n8n est bien présenté comme apprentissage ;
- ouvrir `generated/lettre-html/lettre-test-001.html` ;
- vérifier que la lettre tient sur une page A4 ;
- vérifier que le ton reste professionnel et junior ;
- vérifier qu’aucune information fausse n’a été ajoutée.

## Recommandation avant PDF

Les contrôles statiques sont réussis. Faire la vérification visuelle manuelle dans le navigateur avant toute conversion PDF.

Rappel : cette étape ne corrige pas automatiquement le design, ne génère pas de PDF et n’envoie aucune candidature.
