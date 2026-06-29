const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const ANSWERS_PATH = path.join(ROOT, "validations", "hassan-answers-test-001.json");
const REPORT_PATH = path.join(ROOT, "validations", "clarifications-test-001.md");

const REQUIRED_FIELDS = [
  "google_sheets",
  "google_forms",
  "n8n",
  "make",
  "notion",
  "trello",
  "positionnement_assistant_digital",
  "disponible_stage",
  "date_debut_possible",
  "duree_stage_recherchee",
  "mention_projet_jobhunter"
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function isMissing(value) {
  return value === undefined || value === null || String(value).trim() === "" || String(value).trim() === "a_confirmer";
}

function humanLabel(field) {
  const labels = {
    google_sheets: "niveau Google Sheets",
    google_forms: "niveau Google Forms",
    n8n: "niveau n8n",
    make: "niveau Make",
    notion: "niveau Notion",
    trello: "niveau Trello",
    positionnement_assistant_digital: "accord positionnement assistant digital / automatisation junior",
    disponible_stage: "disponibilité pour un stage",
    date_debut_possible: "date de début possible",
    duree_stage_recherchee: "durée de stage recherchée",
    mention_projet_jobhunter: "autorisation de mentionner JobHunter Belgium AI"
  };
  return labels[field] || field;
}

function classifyAnswer(field, value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (["aucun", "non"].includes(normalized)) {
    return "ne_pas_utiliser";
  }
  if (normalized.includes("en cours") || normalized.includes("débutant") || normalized.includes("debutant") || normalized === "à préciser" || normalized === "a preciser" || normalized === "à reformuler" || normalized === "a reformuler" || normalized === "seulement si pertinent") {
    return "prudence";
  }
  if (normalized) {
    return "utilisable";
  }
  return "a_confirmer";
}

function renderReport(answers) {
  const utilisables = [];
  const prudence = [];
  const nePasUtiliser = [];

  for (const field of REQUIRED_FIELDS) {
    const value = answers[field];
    const entry = `${humanLabel(field)} : ${value}`;
    const classification = classifyAnswer(field, value);
    if (classification === "utilisable") utilisables.push(entry);
    if (classification === "prudence") prudence.push(entry);
    if (classification === "ne_pas_utiliser") nePasUtiliser.push(entry);
  }

  return [
    "# Rapport de clarifications - TEST-001",
    "",
    "## Réponses confirmées",
    "",
    ...REQUIRED_FIELDS.map((field) => `- ${humanLabel(field)} : ${answers[field]}`),
    "",
    "## Points qui peuvent être utilisés dans le CV",
    "",
    ...(utilisables.length ? utilisables.map((item) => `- ${item}`) : ["- Aucun point utilisable sans prudence." ]),
    "",
    "## Points qui peuvent être utilisés seulement avec prudence",
    "",
    ...(prudence.length ? prudence.map((item) => `- ${item}`) : ["- Aucun point à utiliser avec prudence." ]),
    "",
    "## Points à ne pas utiliser",
    "",
    ...(nePasUtiliser.length ? nePasUtiliser.map((item) => `- ${item}`) : ["- Aucun point explicitement exclu." ]),
    "",
    "## Déblocage",
    "",
    "Toutes les informations obligatoires sont confirmées. La génération peut être débloquée uniquement si la validation humaine passe ensuite à OUI.",
    "",
    "Rappel : aucune candidature n'est envoyée automatiquement.",
    ""
  ].join("\n");
}

function main() {
  const answers = readJson(ANSWERS_PATH);
  const missingFields = REQUIRED_FIELDS.filter((field) => isMissing(answers[field]));

  if (missingFields.length > 0) {
    console.error("Clarifications incomplètes : la génération finale reste bloquée.");
    console.error("Champs encore à confirmer :");
    for (const field of missingFields) {
      console.error(`- ${field} (${humanLabel(field)})`);
    }
    process.exit(1);
  }

  const report = renderReport(answers);
  fs.writeFileSync(REPORT_PATH, report, "utf8");
  console.log("Clarifications complètes.");
  console.log("Rapport généré : validations/clarifications-test-001.md");
  console.log("La génération peut être débloquée uniquement après validation humaine OUI.");
}

main();
