# Rapport de correction d'encodage

Date : 2026-06-07

## Objectif

Vérifier et corriger les éventuels problèmes d'encodage dans les fichiers HTML du CV et de la lettre de motivation, sans modifier le design, la structure visuelle ni le fond du contenu.

## Fichiers vérifiés

- `cv-template/index.html`
- `cv-template/CV_Hassan_Chajai_BASE.html`
- `lettre-template/index.html`
- `lettre-template/Lettre_Motivation_Hassan_Chajai_BASE.html`

## Fichiers sauvegardés

- `cv-template/index.before-encoding-fix.html`
- `cv-template/CV_Hassan_Chajai_BASE.before-encoding-fix.html`
- `lettre-template/index.before-encoding-fix.html`
- `lettre-template/Lettre_Motivation_Hassan_Chajai_BASE.before-encoding-fix.html`

## Vérification UTF-8

Les quatre fichiers contiennent bien une balise :

```html
<meta charset="UTF-8" />
```

La lecture réelle des fichiers en UTF-8 confirme que les caractères accentués sont présents correctement dans les fichiers.

Exemple vérifié au niveau Unicode :

- `Développeur` contient bien `é` (`U+00E9`).
- Le séparateur entre le titre et `Stagiaire` est bien un tiret cadratin (`U+2014`).

## Types de caractères vérifiés

Les motifs de mojibake évidents suivants ont été recherchés :

- `Ã`
- `â€`
- `Â`
- caractère de remplacement `�`

Résultat : aucun de ces motifs n'est présent dans les quatre fichiers HTML après restauration et vérification.

## Corrections appliquées

Aucune correction de contenu n'a été conservée dans les fichiers HTML, car le diagnostic final montre que les fichiers étaient déjà correctement encodés en UTF-8.

Le problème observé précédemment venait de l'affichage console PowerShell, qui affichait certains caractères UTF-8 comme s'ils étaient décodés avec un mauvais encodage.

Une tentative de correction mécanique a été interrompue puis annulée par restauration immédiate depuis les sauvegardes. Les fichiers HTML actuels correspondent exactement aux sauvegardes créées avant intervention.

## Fichiers modifiés

Les fichiers HTML suivants ont été vérifiés, restaurés depuis leurs sauvegardes et comparés avec celles-ci :

- `cv-template/index.html`
- `cv-template/CV_Hassan_Chajai_BASE.html`
- `lettre-template/index.html`
- `lettre-template/Lettre_Motivation_Hassan_Chajai_BASE.html`

Le contenu final de ces fichiers est identique aux sauvegardes `.before-encoding-fix.html`.

Le fichier suivant a été créé :

- `docs/rapport-correction-encodage.md`

## Endroits où il y a eu hésitation

L'affichage PowerShell montrait des chaînes comme `DÃ©veloppeur`, ce qui ressemblait à un vrai problème de contenu.

Après inspection des caractères réels en lecture UTF-8, le texte contient bien `Développeur`. Il ne fallait donc pas appliquer une correction globale, car elle aurait dégradé des caractères déjà valides.

## Validation HTML minimale

Les quatre fichiers contiennent toujours :

- `<!DOCTYPE html>`
- `<html lang="fr">`
- `<head>`
- `<body>`
- `</html>`
- `<meta charset="UTF-8" />`

La structure HTML minimale reste donc présente.

## Recommandations

- Ouvrir et modifier ces fichiers avec un éditeur configuré en UTF-8.
- Eviter les conversions automatiques ANSI / Windows-1252.
- Ne pas se fier uniquement au rendu de `Get-Content` dans PowerShell pour diagnostiquer l'encodage.
- Pour les futures vérifications, lire les fichiers explicitement en UTF-8.
- Pour une future génération automatique, écrire les fichiers HTML avec un encodage UTF-8 sans BOM ou UTF-8 standard cohérent.
- Conserver les fichiers `.before-encoding-fix.html` comme sauvegardes de sécurité tant que le projet n'est pas stabilisé.
