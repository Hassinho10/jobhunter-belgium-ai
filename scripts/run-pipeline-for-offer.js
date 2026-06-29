const fs = require("fs");
const path = require("path");
const {
  ROOT,
  analyzeOffer,
  generateApplication,
} = require("./studio-pipeline");

function findOfferById(id) {
  const files = [
    path.join(ROOT, "data", "jobs-ranked.json"),
    path.join(ROOT, "data", "jobs-found.json"),
  ];
  for (const filePath of files) {
    if (!fs.existsSync(filePath)) continue;
    const payload = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const collections = [payload.all_scored, payload.jobs_ranked, payload.jobs];
    for (const collection of collections) {
      const offer = (collection || []).find((job) => String(job.id_offre) === String(id));
      if (offer) return offer;
    }
  }
  return null;
}

function resolveOffer(input) {
  const defaultPath = path.join(ROOT, "data", "current-offer.json");
  const candidate = input || defaultPath;
  const filePath = path.isAbsolute(candidate) ? candidate : path.join(ROOT, candidate);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  }
  const offer = findOfferById(candidate);
  if (!offer) throw new Error(`Offre ou fichier introuvable : ${candidate}`);
  return offer;
}

async function run() {
  const input = process.argv[2] || "";
  const confirmation = String(process.argv[3] || "").toUpperCase();
  const offer = resolveOffer(input);
  const report = analyzeOffer(offer);

  console.log(`Offre préparée : ${offer.id_offre}`);
  console.log(`Score : ${report.score_total}/100`);
  console.log(`Décision : ${report.decision}`);

  if (confirmation !== "OUI") {
    console.log("Génération bloquée : relancez avec OUI après validation humaine.");
    console.log("Exemple : npm.cmd run pipeline:current -- data/current-offer.json OUI");
    return;
  }

  const result = await generateApplication("OUI", offer.id_offre);
  console.log(`Statut : ${result.status}`);
  Object.entries(result.files).forEach(([label, filePath]) => {
    console.log(`- ${label}: ${filePath}`);
  });
  console.log("Aucune candidature n'a été envoyée.");
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
