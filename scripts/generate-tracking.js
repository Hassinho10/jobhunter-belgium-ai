const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OFFER_PATH = path.join(ROOT, "test-data", "offre-test.json");
const COMPATIBILITY_PATH = path.join(ROOT, "reports", "compatibility-test-001.json");
const PLAN_PATH = path.join(ROOT, "reports", "adaptation-plan-test-001.json");
const VALIDATION_PATH = path.join(ROOT, "validations", "validation-test-001.json");
const CV_PDF = path.join(ROOT, "generated", "pdf", "cv-test-001.pdf");
const LETTER_PDF = path.join(ROOT, "generated", "pdf", "lettre-test-001.pdf");
const MESSAGE_PATH = path.join(ROOT, "generated", "messages", "message-test-001.txt");
const TRACKING_DIR = path.join(ROOT, "tracking");
const JSON_OUTPUT = path.join(TRACKING_DIR, "forem-suivi-test-001.json");
const CSV_OUTPUT = path.join(TRACKING_DIR, "forem-suivi-test-001.csv");
const MD_OUTPUT = path.join(TRACKING_DIR, "forem-suivi-test-001.md");
const REPORT_OUTPUT = path.join(ROOT, "reports", "tracking-generation-test-001.md");

const CSV_COLUMNS = [
  "id_offre",
  "date_detection",
  "source",
  "entreprise",
  "poste",
  "lieu",
  "type_contrat",
  "lien_offre",
  "score_ia",
  "decision_ia",
  "decision_humaine",
  "statut",
  "cv_pdf_path",
  "lettre_pdf_path",
  "message_path",
  "preuve_disponible",
  "preuve_type",
  "date_relance_prevue",
  "commentaire"
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function rel(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, "/");
}

function csvEscape(value) {
  const text = value === null || value === undefined ? "" : String(value);
  if (/[",\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function statusFor(validation, pdfsPresent) {
  if (validation.decision_humaine === "OUI" && pdfsPresent) return "candidature_prete_non_envoyee";
  if (validation.decision_humaine === "NON") return "offre_refusee";
  if (validation.decision_humaine === "MODIFIER") return "modification_requise";
  return "validation_incomplete";
}

function renderCsv(row) {
  return [
    CSV_COLUMNS.join(","),
    CSV_COLUMNS.map((column) => csvEscape(row[column])).join(",")
  ].join("\n") + "\n";
}

function renderMarkdown(row, offer, compatibility, plan) {
  return `# Suivi FOREM local - ${row.id_offre}

## Résumé de l'offre

- Entreprise : ${row.entreprise}
- Poste : ${row.poste}
- Lieu : ${row.lieu}
- Type de contrat : ${row.type_contrat}
- Source : ${row.source}
- Lien : ${row.lien_offre || "non renseigné"}

## Score et décision

- Score IA : ${row.score_ia} / 100
- Décision IA : ${row.decision_ia}
- Décision humaine : ${row.decision_humaine}
- Statut actuel : ${row.statut}

## Documents générés

- CV PDF : \`${row.cv_pdf_path}\`
- Lettre PDF : \`${row.lettre_pdf_path}\`
- Message : \`${row.message_path}\`

## Preuve disponible

- Preuve disponible : ${row.preuve_disponible}
- Type de preuve : ${row.preuve_type}

## Prochaine action

La candidature est prête localement mais n'a pas été envoyée.

Avant tout envoi réel, il faudra :

- relire le CV PDF ;
- relire la lettre PDF ;
- relire le message ;
- valider manuellement l'envoi ;
- enregistrer ensuite une preuve réelle d'envoi si une candidature est effectivement envoyée.

## Rappel

Aucune candidature n'est envoyée à cette étape. Aucune preuve d'envoi n'est inventée. Aucune relance n'est planifiée.

## Notes techniques

- Compatibilité : ${compatibility.decision}
- Plan d'adaptation : ${plan.decision_preparation}
`;
}

function renderReport({ verified, created, row, pdfsPresent }) {
  return `# Rapport technique - génération suivi FOREM TEST-001

## Fichiers vérifiés

${verified.map((item) => `- ${item}`).join("\n")}

## Fichiers créés

${created.map((item) => `- ${item}`).join("\n")}

## Statut calculé

- ${row.statut}

## Preuve disponible

- PDF présents : ${pdfsPresent ? "oui" : "non"}
- Preuve d'envoi : non
- Type de preuve : ${row.preuve_type}

## Limites

- La candidature n'est pas marquée comme envoyée.
- Aucune preuve d'envoi n'a été inventée.
- Aucune date de relance n'a été inventée.
- Google Sheets, Gmail, Google Drive, n8n et OpenAI ne sont pas connectés.

## Prochaine étape

Relire les PDF et le message. Si une candidature réelle est envoyée plus tard, créer une preuve réelle et mettre à jour le suivi.
`;
}

function main() {
  const offer = readJson(OFFER_PATH);
  const compatibility = readJson(COMPATIBILITY_PATH);
  const plan = readJson(PLAN_PATH);
  const validation = readJson(VALIDATION_PATH);

  const cvExists = fs.existsSync(CV_PDF);
  const letterExists = fs.existsSync(LETTER_PDF);
  const messageExists = fs.existsSync(MESSAGE_PATH);
  const pdfsPresent = cvExists && letterExists;

  const row = {
    id_offre: offer.id_offre,
    date_detection: offer.date_detection,
    source: offer.source,
    entreprise: offer.entreprise,
    poste: offer.poste,
    lieu: offer.lieu,
    type_contrat: offer.type_contrat,
    lien_offre: offer.lien_offre || "",
    score_ia: compatibility.score_total,
    decision_ia: compatibility.decision,
    decision_humaine: validation.decision_humaine,
    statut: statusFor(validation, pdfsPresent),
    cv_pdf_path: cvExists ? rel(CV_PDF) : "",
    lettre_pdf_path: letterExists ? rel(LETTER_PDF) : "",
    message_path: messageExists ? rel(MESSAGE_PATH) : "",
    preuve_disponible: pdfsPresent ? "oui" : "non",
    preuve_type: pdfsPresent ? "documents_prepares_non_envoyes" : "aucune",
    date_relance_prevue: "",
    commentaire: "Candidature prête localement, non envoyée. Aucune preuve d'envoi ni relance créée."
  };

  fs.mkdirSync(TRACKING_DIR, { recursive: true });
  fs.writeFileSync(JSON_OUTPUT, JSON.stringify(row, null, 2) + "\n", "utf8");
  fs.writeFileSync(CSV_OUTPUT, renderCsv(row), "utf8");
  fs.writeFileSync(MD_OUTPUT, renderMarkdown(row, offer, compatibility, plan), "utf8");

  const verified = [
    rel(OFFER_PATH),
    rel(COMPATIBILITY_PATH),
    rel(PLAN_PATH),
    rel(VALIDATION_PATH),
    `${rel(CV_PDF)} : ${cvExists ? "présent" : "absent"}`,
    `${rel(LETTER_PDF)} : ${letterExists ? "présent" : "absent"}`,
    `${rel(MESSAGE_PATH)} : ${messageExists ? "présent" : "absent"}`
  ];
  const created = [rel(JSON_OUTPUT), rel(CSV_OUTPUT), rel(MD_OUTPUT), rel(REPORT_OUTPUT)];
  fs.writeFileSync(REPORT_OUTPUT, renderReport({ verified, created, row, pdfsPresent }), "utf8");

  console.log(`Statut généré : ${row.statut}`);
  console.log(`PDF trouvés : ${pdfsPresent ? "oui" : "non"}`);
  console.log(`CSV : ${rel(CSV_OUTPUT)}`);
}

main();
