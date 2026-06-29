const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const LETTER_TEMPLATE_PATH = path.join(ROOT, "lettre-template", "index.html");
const LETTER_REFERENCE_PATH = path.join(ROOT, "lettre-template", "Lettre_Motivation_Hassan_Chajai_BASE.html");
const PROFILE_PATH = path.join(ROOT, "cv-template", "profile-data.json");
const OFFER_PATH = path.join(ROOT, "test-data", "offre-test.json");
const PLAN_PATH = path.join(ROOT, "reports", "adaptation-plan-test-001.json");
const MESSAGE_PATH = path.join(ROOT, "generated", "messages", "message-test-001.txt");
const VALIDATION_PATH = path.join(ROOT, "validations", "validation-test-001.json");
const CLARIFICATIONS_PATH = path.join(ROOT, "validations", "clarifications-test-001.md");
const RULES_PATH = path.join(ROOT, "docs", "regles-adaptation-cv.md");
const OUTPUT_DIR = path.join(ROOT, "generated", "lettre-html");
const OUTPUT_HTML = path.join(OUTPUT_DIR, "lettre-test-001.html");
const REPORT_PATH = path.join(ROOT, "reports", "lettre-generation-test-001.md");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function requireHumanValidation(validation) {
  const ok =
    validation.decision_humaine === "OUI" &&
    validation.statut_validation === "valide_pour_generation" &&
    validation.prochaine_action === "generer_cv_et_message";

  if (!ok) {
    throw new Error(
      "Génération bloquée : validation humaine OUI requise avec statut valide_pour_generation et prochaine_action generer_cv_et_message."
    );
  }
}

function replaceOnce(html, pattern, replacement, applied, missing, label) {
  if (!pattern.test(html)) {
    missing.push(label);
    return html;
  }
  applied.push(label);
  return html.replace(pattern, replacement);
}

function paragraphsToHtml(message) {
  const paragraphs = message
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  const greeting = paragraphs.shift() || "Madame, Monsieur,";
  const signature = paragraphs.pop() || "Hassan Chajai";
  const body = paragraphs.map((part) => `          <p>${part.replace(/\n/g, "<br>")}</p>`).join("\n\n");

  return [
    `          <div class="letter-greeting">${greeting}</div>`,
    "",
    body,
    "",
    `          <p>Dans l’attente de votre retour, je vous prie d’agréer, Madame, Monsieur, mes salutations respectueuses.</p>`
  ].join("\n");
}

function buildAdaptedLetterHtml(sourceHtml, offer, plan, message) {
  const applied = [];
  const missing = [];
  let html = sourceHtml;

  const objectText = `OBJET : CANDIDATURE — ${offer.poste.toUpperCase()}`;
  const sidebarObject = `Candidature<br>${offer.poste}`;

  html = replaceOnce(
    html,
    /<div class="contact-label">OBJET<\/div><div class="contact-value">[\s\S]*?<\/div>/,
    `<div class="contact-label">OBJET</div><div class="contact-value">${sidebarObject}</div>`,
    applied,
    missing,
    "objet sidebar adapté"
  );

  html = replaceOnce(
    html,
    /<div class="letter-object">[\s\S]*?<\/div>/,
    `<div class="letter-object">${objectText}</div>`,
    applied,
    missing,
    "objet principal adapté"
  );

  html = replaceOnce(
    html,
    /<div class="letter-body">[\s\S]*?<\/div>\s*<div class="letter-signature-container">/,
    `<div class="letter-body">\n${paragraphsToHtml(message)}\n        </div>\n        <!-- TODO: vérifier cette section manuellement : ton junior, absence de survente et pertinence de JobHunter Belgium AI. -->\n        <div class="letter-signature-container">`,
    applied,
    missing,
    "corps de lettre adapté depuis le message validé"
  );

  html = html.replace(
    "</body>",
    `<!-- TODO: vérifier que la lettre tient sur une page A4 avant tout export PDF. -->\n<!-- TODO: confirmer que n8n reste formulé comme apprentissage et non comme compétence maîtrisée. -->\n</body>`
  );
  applied.push("commentaires HTML de vérification manuelle");

  return { html, applied, missing };
}

function renderReport({ outputHtml, applied, missing, validation, offer, plan }) {
  return [
    "# Rapport de génération lettre HTML - TEST-001",
    "",
    "## Validation",
    "",
    `- decision_humaine : ${validation.decision_humaine}`,
    `- statut_validation : ${validation.statut_validation}`,
    `- prochaine_action : ${validation.prochaine_action}`,
    "",
    "## Fichier lettre généré",
    "",
    `- Lettre HTML : \`${path.relative(ROOT, outputHtml)}\``,
    "",
    "## Offre ciblée",
    "",
    `- Poste : ${offer.poste}`,
    `- Entreprise : ${offer.entreprise}`,
    "",
    "## Adaptations appliquées",
    "",
    ...applied.map((item) => `- ${item}`),
    "",
    "## Adaptations non appliquées automatiquement",
    "",
    ...(missing.length ? missing.map((item) => `- ${item}`) : ["- Aucune adaptation ciblée n'a échoué."]),
    "",
    "## Informations interdites évitées",
    "",
    "- Make n'est pas présenté comme compétence.",
    "- Trello n'est pas présenté comme compétence.",
    "- n8n est mentionné uniquement comme apprentissage.",
    "- Google Sheets, Google Forms et Notion ne sont pas surévalués.",
    "- JobHunter Belgium AI est présenté comme projet personnel en cours, pas comme expérience professionnelle client.",
    "- Aucune expérience, diplôme, certification ou compétence non confirmée n'a été ajouté.",
    "",
    "## Points à vérifier manuellement",
    "",
    "- Vérifier que la lettre tient toujours visuellement sur une page A4.",
    "- Vérifier que le ton reste junior/stage.",
    "- Vérifier que la mention JobHunter Belgium AI renforce réellement cette candidature.",
    "- Vérifier que n8n n'est jamais présenté comme compétence maîtrisée.",
    "",
    "## Rappel",
    "",
    "Aucun PDF n'a été généré. Aucune candidature n'a été envoyée. Aucun service externe n'a été connecté.",
    "",
    `Titre / poste utilisé : ${plan.titre_cv_recommande}`,
    ""
  ].join("\n");
}

function main() {
  const validation = readJson(VALIDATION_PATH);
  requireHumanValidation(validation);

  readJson(PROFILE_PATH);
  const offer = readJson(OFFER_PATH);
  const plan = readJson(PLAN_PATH);
  fs.readFileSync(LETTER_REFERENCE_PATH, "utf8");
  fs.readFileSync(CLARIFICATIONS_PATH, "utf8");
  fs.readFileSync(RULES_PATH, "utf8");
  const message = fs.readFileSync(MESSAGE_PATH, "utf8").trim();
  const sourceHtml = fs.readFileSync(LETTER_TEMPLATE_PATH, "utf8");

  const { html, applied, missing } = buildAdaptedLetterHtml(sourceHtml, offer, plan, message);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_HTML, html, "utf8");
  fs.writeFileSync(
    REPORT_PATH,
    renderReport({ outputHtml: OUTPUT_HTML, applied, missing, validation, offer, plan }),
    "utf8"
  );

  console.log("Validation OUI vérifiée.");
  console.log(`Lettre HTML générée : ${path.relative(ROOT, OUTPUT_HTML)}`);
  console.log(`Rapport généré : ${path.relative(ROOT, REPORT_PATH)}`);
}

main();
