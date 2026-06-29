const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OFFER_PATH = path.join(ROOT, "test-data", "offre-test.json");
const TRACKING_PATH = path.join(ROOT, "tracking", "forem-suivi-test-001.json");
const PACKAGE_DIR = path.join(ROOT, "review-packages", "TEST-001");
const REPORT_PATH = path.join(ROOT, "reports", "review-package-test-001.md");

const FILES_TO_COPY = [
  "generated/pdf/cv-test-001.pdf",
  "generated/pdf/lettre-test-001.pdf",
  "generated/messages/message-test-001.txt",
  "tracking/forem-suivi-test-001.csv",
  "tracking/forem-suivi-test-001.md",
  "proofs/TEST-001/proof-index.json",
  "reports/compatibility-test-001.md",
  "reports/adaptation-plan-test-001.md",
  "validations/validation-test-001.md",
  "validations/clarifications-test-001.md"
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function rel(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, "/");
}

function copyFile(relativePath) {
  const source = path.join(ROOT, relativePath);
  const destination = path.join(PACKAGE_DIR, path.basename(relativePath));
  if (!fs.existsSync(source)) return { relativePath, copied: false };
  fs.copyFileSync(source, destination);
  return { relativePath, copied: true, destination: rel(destination) };
}

function renderReadme({ offer, tracking, copied, missing }) {
  return `# Package d'examen - TEST-001

## Résumé de l'offre

- Entreprise : ${offer.entreprise}
- Poste : ${offer.poste}
- Lieu : ${offer.lieu}
- Type de contrat : ${offer.type_contrat}
- Source : ${offer.source}

## Statut actuel

${tracking.statut}

La candidature est prête localement mais non envoyée.

## Fichiers inclus

${copied.length ? copied.map((item) => `- ${path.basename(item.destination)}`).join("\n") : "- Aucun fichier copié."}

## Fichiers manquants éventuels

${missing.length ? missing.map((item) => `- ${item.relativePath}`).join("\n") : "- Aucun fichier manquant."}

## Preuve d'envoi

Aucune preuve d'envoi disponible.

Le fichier proof-index.json est inclus uniquement pour montrer l'état actuel du suivi des preuves.

## Checklist avant candidature réelle

- vérifier CV PDF ;
- vérifier lettre PDF ;
- vérifier message ;
- vérifier lien de l'offre réelle ;
- vérifier email ou méthode de candidature ;
- confirmer OUI avant envoi réel ;
- sauvegarder une preuve après envoi.

## Rappel

Ce package sert uniquement à examiner la candidature prête. Il ne marque rien comme envoyé et ne contient aucune preuve fictive.
`;
}

function renderReport({ copied, missing, status }) {
  return `# Rapport package d'examen - TEST-001

## Fichiers copiés

${copied.length ? copied.map((item) => `- ${item.relativePath} -> ${item.destination}`).join("\n") : "- Aucun fichier copié."}

## Fichiers manquants

${missing.length ? missing.map((item) => `- ${item.relativePath}`).join("\n") : "- Aucun fichier manquant."}

## Statut du package

${status}

## Prochaine étape recommandée

Ouvrir le dossier review-packages/TEST-001/, relire les PDF et le message, puis décider manuellement si une candidature réelle doit être envoyée.

Rappel : aucune candidature n'a été envoyée par ce script.
`;
}

function main() {
  const offer = readJson(OFFER_PATH);
  const tracking = readJson(TRACKING_PATH);

  if (tracking.statut !== "candidature_prete_non_envoyee") {
    throw new Error(`Statut inattendu : ${tracking.statut}. Le package d'examen attend une candidature prête non envoyée.`);
  }

  fs.mkdirSync(PACKAGE_DIR, { recursive: true });

  const results = FILES_TO_COPY.map(copyFile);
  const copied = results.filter((item) => item.copied);
  const missing = results.filter((item) => !item.copied);
  const status = missing.length ? "package_cree_avec_fichiers_manquants" : "package_complet_pret_pour_examen";

  fs.writeFileSync(path.join(PACKAGE_DIR, "README.md"), renderReadme({ offer, tracking, copied, missing }), "utf8");
  copied.push({ relativePath: "review-packages/TEST-001/README.md", destination: "review-packages/TEST-001/README.md" });
  fs.writeFileSync(REPORT_PATH, renderReport({ copied, missing, status }), "utf8");

  console.log(`Statut du package : ${status}`);
  console.log(`Fichiers copiés : ${copied.length}`);
  console.log(`Fichiers manquants : ${missing.length}`);
  console.log(`Dossier : ${rel(PACKAGE_DIR)}`);
}

main();
