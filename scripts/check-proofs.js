const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PROOF_DIR = path.join(ROOT, "proofs", "TEST-001");
const INDEX_PATH = path.join(PROOF_DIR, "proof-index.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function main() {
  if (!fs.existsSync(PROOF_DIR)) {
    throw new Error("Dossier de preuves introuvable : proofs/TEST-001");
  }
  if (!fs.existsSync(INDEX_PATH)) {
    throw new Error("Index de preuves introuvable : proofs/TEST-001/proof-index.json");
  }

  const index = readJson(INDEX_PATH);
  const proofs = Array.isArray(index.preuves) ? index.preuves : [];

  console.log(`Offre : ${index.id_offre}`);
  console.log(`Entreprise : ${index.entreprise}`);
  console.log(`Poste : ${index.poste}`);
  console.log(`Statut candidature : ${index.statut_candidature}`);
  console.log(`Nombre de preuves listées : ${proofs.length}`);

  if (proofs.length === 0) {
    console.log("Aucune preuve réelle d’envoi disponible pour TEST-001.");
    return;
  }

  console.log("Preuves listées :");
  for (const proof of proofs) {
    console.log(`- ${proof.type || "type inconnu"} : ${proof.fichier || "fichier non renseigné"}`);
  }
}

main();
