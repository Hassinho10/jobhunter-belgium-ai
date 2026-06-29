const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PLAN_PATH = path.join(ROOT, "reports", "adaptation-plan-test-001.json");
const VALIDATIONS_DIR = path.join(ROOT, "validations");
const JSON_OUTPUT = path.join(VALIDATIONS_DIR, "validation-test-001.json");
const MD_OUTPUT = path.join(VALIDATIONS_DIR, "validation-test-001.md");

const VALID_DECISIONS = new Set(["OUI", "NON", "MODIFIER"]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function normalizeDecision(value) {
  return String(value || "").trim().toUpperCase();
}

function validationStateFor(decision) {
  if (decision === "OUI") {
    return {
      statut_validation: "valide_pour_generation",
      prochaine_action: "generer_cv_et_message"
    };
  }
  if (decision === "NON") {
    return {
      statut_validation: "refuse",
      prochaine_action: "archiver_offre"
    };
  }
  return {
    statut_validation: "modification_demandee",
    prochaine_action: "corriger_plan_adaptation_avant_generation"
  };
}

function todayIso() {
  return new Date().toISOString();
}

function buildValidation(plan, decision) {
  const state = validationStateFor(decision);
  return {
    id_offre: plan.id_offre,
    poste: plan.poste,
    entreprise: plan.entreprise,
    score_compatibilite: plan.score_compatibilite,
    decision_preparation: plan.decision_preparation,
    decision_humaine: decision,
    statut_validation: state.statut_validation,
    prochaine_action: state.prochaine_action,
    date_validation: todayIso(),
    validation_humaine_requise: true,
    commentaire_hassan: ""
  };
}

function renderMarkdown(validation, plan) {
  return [
    `# Validation humaine - ${validation.id_offre}`,
    "",
    "## Résumé de l'offre",
    "",
    `- Poste : ${validation.poste}`,
    `- Entreprise : ${validation.entreprise}`,
    `- Score de compatibilité : ${validation.score_compatibilite} / 100`,
    `- Décision proposée par le plan : ${validation.decision_preparation}`,
    "",
    "## Points à vérifier",
    "",
    ...(plan.points_a_verifier_avec_hassan || []).map((item) => `- ${item}`),
    "",
    "## Décision humaine choisie",
    "",
    `Décision : **${validation.decision_humaine}**`,
    "",
    "## Statut de validation",
    "",
    `Statut : **${validation.statut_validation}**`,
    "",
    "## Prochaine action",
    "",
    `Prochaine action : **${validation.prochaine_action}**`,
    "",
    "## Rappel",
    "",
    "Aucune candidature n'est envoyée automatiquement.",
    "",
    "Un choix OUI autorise seulement l'étape suivante de génération locale. Il ne déclenche aucun envoi.",
    "",
    "Un choix MODIFIER bloque la génération finale tant que le plan d'adaptation n'est pas corrigé.",
    ""
  ].join("\n");
}

function printSummary(plan) {
  console.log(`Offre: ${plan.poste} - ${plan.entreprise}`);
  console.log(`Score: ${plan.score_compatibilite}/100`);
  console.log(`Décision proposée: ${plan.decision_preparation}`);
  console.log(`Titre CV recommandé: ${plan.titre_cv_recommande}`);
  console.log("Points à vérifier:");
  for (const item of plan.points_a_verifier_avec_hassan || []) {
    console.log(`- ${item}`);
  }
}

function main() {
  const decision = normalizeDecision(process.argv[2]);
  if (!decision) {
    console.error("Validation humaine requise : utilisez OUI, NON ou MODIFIER.");
    process.exit(1);
  }
  if (!VALID_DECISIONS.has(decision)) {
    console.error("Validation refusée : utilisez uniquement OUI, NON ou MODIFIER.");
    process.exit(1);
  }

  const plan = readJson(PLAN_PATH);
  printSummary(plan);

  const validation = buildValidation(plan, decision);
  fs.mkdirSync(VALIDATIONS_DIR, { recursive: true });
  fs.writeFileSync(JSON_OUTPUT, `${JSON.stringify(validation, null, 2)}\n`, "utf8");
  fs.writeFileSync(MD_OUTPUT, renderMarkdown(validation, plan), "utf8");

  console.log("");
  console.log(`Décision humaine enregistrée: ${validation.decision_humaine}`);
  console.log(`Statut: ${validation.statut_validation}`);
  console.log(`Prochaine action: ${validation.prochaine_action}`);
  console.log("Fichiers générés:");
  console.log(`- ${path.relative(ROOT, JSON_OUTPUT)}`);
  console.log(`- ${path.relative(ROOT, MD_OUTPUT)}`);
}

main();
