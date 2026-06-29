const { spawnSync } = require("child_process");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const steps = [
  ["score-offer.js"],
  ["prepare-adaptation.js"],
  ["apply-clarifications.js"],
  ["validate-application.js", "OUI"],
  ["generate-cv-html.js"],
  ["generate-lettre-html.js"],
  ["check-generated-html.js"],
  ["generate-pdf.js"],
  ["generate-tracking.js"],
  ["check-proofs.js"],
  ["create-review-package.js"],
  ["prepare-google-sheets-import.js"],
];

for (const [script, ...args] of steps) {
  console.log(`\n--- ${script} ---`);
  const result = spawnSync(process.execPath, [path.join(__dirname, script), ...args], {
    cwd: ROOT,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    console.error(`Pipeline interrompu à l'étape ${script}.`);
    process.exit(result.status || 1);
  }
}

console.log("\nPipeline TEST-001 terminé.");
console.log("Statut attendu : candidature_prete_non_envoyee.");
console.log("Aucune candidature n'a été envoyée.");
