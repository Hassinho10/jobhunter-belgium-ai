const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

const required = [
  "app/server.js",
  "app/public/index.html",
  "app/public/app.js",
  "app/public/style.css",
  "scripts/studio-pipeline.js",
  "sources/forem.js",
  "sources/job-search.js",
  "sources/normalize-job.js",
  "config/search-profile.json",
  "cv-template/profile-data.json",
  "test-data/offre-test.json",
  "README.md",
  "README_RECRUITER.md",
  ".env.example",
  ".gitignore",
];

const shouldNotExist = [
  ".env",
  "node_modules",
];

const localArtifactDirs = [
  "generated",
  "review-packages",
  "proofs",
  "tracking",
  "tmp",
];

function exists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

const missing = required.filter((file) => !exists(file));
const forbidden = shouldNotExist.filter((file) => exists(file));
const artifactWarnings = localArtifactDirs.filter((dir) => exists(dir));
const envFiles = walk(ROOT).filter((file) => /(^|[\\/])\.env($|\.)/.test(file) && !file.endsWith(".env.example"));

console.log("JobHunter Belgium AI - contrôle avant publication\n");

if (missing.length) {
  console.log("Fichiers requis manquants :");
  for (const file of missing) console.log(`- ${file}`);
}

if (forbidden.length || envFiles.length) {
  console.log("Éléments sensibles à ne pas publier :");
  for (const file of forbidden) console.log(`- ${file}`);
  for (const file of envFiles) console.log(`- ${path.relative(ROOT, file)}`);
}

if (artifactWarnings.length) {
  console.log("Dossiers locaux présents, normalement ignorés par Git :");
  for (const dir of artifactWarnings) console.log(`- ${dir}/`);
}

console.log("\nRappels :");
console.log("- Ne pas publier de preuve réelle sans accord.");
console.log("- Ne pas publier de fichier .env.");
console.log("- Ne pas marquer une candidature comme envoyée.");
console.log("- Vérifier README_RECRUITER.md avant partage.");

if (missing.length || forbidden.length || envFiles.length) {
  process.exitCode = 1;
  console.log("\nStatut : à corriger avant publication.");
} else {
  console.log("\nStatut : prêt pour publication GitHub côté code source.");
}

