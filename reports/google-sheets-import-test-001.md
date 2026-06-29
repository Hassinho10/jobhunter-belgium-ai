# Rapport import Google Sheets - TEST-001

## Sources vérifiées

- test-data/offre-test.json
- reports/compatibility-test-001.json
- validations/validation-test-001.json
- tracking/forem-suivi-test-001.csv
- proofs/TEST-001/proof-index.json
- validations/hassan-answers-test-001.json

## Fichiers créés

- google-sheets-import/01_dashboard.csv
- google-sheets-import/02_offres_detectees.csv
- google-sheets-import/03_candidatures.csv
- google-sheets-import/04_preuves_forem.csv
- google-sheets-import/05_relances.csv
- google-sheets-import/06_historique_ia.csv
- google-sheets-import/07_parametres.csv
- google-sheets-import/README.md

## Statuts importants

- Statut candidature : candidature_prete_non_envoyee
- Décision humaine : OUI
- Score IA local : 78
- Preuve d'envoi disponible : non
- Relance prévue : non

## Limites

Ces CSV sont préparés pour un import manuel. Aucun compte Google Sheets, Gmail, Drive, n8n ou OpenAI n'a été connecté.

Aucune candidature n'a été envoyée et aucune preuve fictive n'a été créée.
