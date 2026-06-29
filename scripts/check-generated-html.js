const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const CV_PATH = path.join(ROOT, "generated", "cv-html", "cv-test-001.html");
const LETTER_PATH = path.join(ROOT, "generated", "lettre-html", "lettre-test-001.html");
const REPORT_PATH = path.join(ROOT, "reports", "html-check-test-001.md");

const EXPECTED_TITLE = "Stagiaire Assistant Digital & Automatisation";
const FORBIDDEN_PATTERNS = [
  "maîtrise n8n",
  "expert n8n",
  "maîtrise Make",
  "expert Make",
  "maîtrise Trello",
  "expert Trello"
];

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function checkFile(label, filePath) {
  const checks = [];
  const alerts = [];

  if (!fs.existsSync(filePath)) {
    return {
      label,
      filePath,
      checks,
      alerts: [`Fichier introuvable : ${path.relative(ROOT, filePath)}`],
      text: ""
    };
  }

  const text = fs.readFileSync(filePath, "utf8");
  const normalizedText = normalize(text);

  const requiredChecks = [
    { name: "présence <!DOCTYPE html>", ok: text.includes("<!DOCTYPE html>") },
    { name: "présence <html", ok: /<html\b/i.test(text) },
    { name: "présence <head>", ok: /<head>/i.test(text) },
    { name: "présence <body>", ok: /<body>/i.test(text) },
    { name: "charset UTF-8", ok: /<meta\s+charset=["']UTF-8["']\s*\/?>/i.test(text) },
    { name: `titre attendu "${EXPECTED_TITLE}"`, ok: text.includes(EXPECTED_TITLE) }
  ];

  for (const check of requiredChecks) {
    if (check.ok) checks.push(`${label} : ${check.name}`);
    else alerts.push(`${label} : contrôle échoué - ${check.name}`);
  }

  for (const pattern of FORBIDDEN_PATTERNS) {
    if (normalizedText.includes(normalize(pattern))) {
      alerts.push(`${label} : formulation interdite détectée - "${pattern}"`);
    } else {
      checks.push(`${label} : absence de "${pattern}"`);
    }
  }

  const n8nMasteryPatterns = ["maîtrise n8n", "maitrise n8n", "expert n8n", "n8n maîtrisé", "n8n maitrise"];
  if (n8nMasteryPatterns.some((pattern) => normalizedText.includes(normalize(pattern)))) {
    alerts.push(`${label} : n8n semble présenté comme maîtrisé.`);
  } else {
    checks.push(`${label} : n8n non présenté comme maîtrisé`);
  }

  const makeCompetencePattern = /class="skill-capsule">[^<]*make[^<]*<\/div>/i;
  const trelloCompetencePattern = /class="skill-capsule">[^<]*trello[^<]*<\/div>/i;
  if (makeCompetencePattern.test(text)) alerts.push(`${label} : Make apparaît comme compétence.`);
  else checks.push(`${label} : Make non présenté comme compétence`);
  if (trelloCompetencePattern.test(text)) alerts.push(`${label} : Trello apparaît comme compétence.`);
  else checks.push(`${label} : Trello non présenté comme compétence`);

  return { label, filePath, checks, alerts, text };
}

function renderReport(results) {
  const allChecks = results.flatMap((result) => result.checks);
  const allAlerts = results.flatMap((result) => result.alerts);

  return [
    "# Vérification HTML généré - TEST-001",
    "",
    "## Fichiers vérifiés",
    "",
    ...results.map((result) => `- ${result.label} : \`${path.relative(ROOT, result.filePath)}\``),
    "",
    "## Contrôles réussis",
    "",
    ...(allChecks.length ? allChecks.map((item) => `- ${item}`) : ["- Aucun contrôle réussi."]),
    "",
    "## Alertes éventuelles",
    "",
    ...(allAlerts.length ? allAlerts.map((item) => `- ${item}`) : ["- Aucune alerte détectée par le contrôle statique."]),
    "",
    "## Vérification manuelle à faire par Hassan",
    "",
    "- ouvrir `generated/cv-html/cv-test-001.html` dans le navigateur ;",
    "- vérifier que le CV tient sur une page A4 ou reste propre à l’impression ;",
    "- vérifier que le titre est correct ;",
    "- vérifier que le projet JobHunter Belgium AI n’est pas trop mis en avant ;",
    "- vérifier que n8n est bien présenté comme apprentissage ;",
    "- ouvrir `generated/lettre-html/lettre-test-001.html` ;",
    "- vérifier que la lettre tient sur une page A4 ;",
    "- vérifier que le ton reste professionnel et junior ;",
    "- vérifier qu’aucune information fausse n’a été ajoutée.",
    "",
    "## Recommandation avant PDF",
    "",
    allAlerts.length
      ? "Corriger les alertes dans une étape séparée avant toute conversion PDF."
      : "Les contrôles statiques sont réussis. Faire la vérification visuelle manuelle dans le navigateur avant toute conversion PDF.",
    "",
    "Rappel : cette étape ne corrige pas automatiquement le design, ne génère pas de PDF et n’envoie aucune candidature.",
    ""
  ].join("\n");
}

function main() {
  const results = [checkFile("CV", CV_PATH), checkFile("Lettre", LETTER_PATH)];
  fs.writeFileSync(REPORT_PATH, renderReport(results), "utf8");

  const alertCount = results.reduce((sum, result) => sum + result.alerts.length, 0);
  console.log(`Rapport généré : ${path.relative(ROOT, REPORT_PATH)}`);
  console.log(`Contrôles réussis : ${results.reduce((sum, result) => sum + result.checks.length, 0)}`);
  console.log(`Alertes : ${alertCount}`);

  if (alertCount > 0) {
    process.exitCode = 1;
  }
}

main();
