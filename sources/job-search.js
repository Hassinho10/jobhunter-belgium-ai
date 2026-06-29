const fs = require("fs");
const path = require("path");
const { searchForemJobs } = require("./forem");
const { searchAdzunaJobs } = require("./adzuna");
const { searchJoobleJobs } = require("./jooble");

const ROOT = path.resolve(__dirname, "..");

function loadEnv(filePath = path.join(ROOT, ".env")) {
  if (!fs.existsSync(filePath)) return {};
  const values = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const separator = trimmed.indexOf("=");
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
    values[key] = value;
    if (!process.env[key]) process.env[key] = value;
  }
  return values;
}

function normalizedKey(job) {
  const clean = (value) =>
    String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\(h\/f\/x\)|\(h\/f\)|\/x\)/g, " ")
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  const signature = `${clean(job.poste)}|${clean(job.entreprise)}|${clean(job.lieu)}`;
  return signature.replace(/\|/g, "") ? `job:${signature}` : `url:${clean(job.lien_offre)}`;
}

function deduplicateJobs(jobs) {
  const unique = new Map();
  for (const job of jobs) {
    const key = normalizedKey(job);
    if (!unique.has(key)) unique.set(key, job);
  }
  return [...unique.values()];
}

function isRelevantDigitalJob(job) {
  const text = `${job.poste || ""} ${job.description || ""}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const digitalTerms = [
    "web",
    "informatique",
    "digital",
    "numerique",
    "logiciel",
    "developpeur",
    "developpement",
    "support it",
    "support technique",
    "data",
    "base de donnees",
    "html",
    "javascript",
    "frontend",
    "backend",
    "fullstack",
  ];
  if (digitalTerms.some((term) => text.includes(term))) return true;

  const automationTerms = ["automatisation", "automation", "no-code", "n8n", "make"];
  const industrialTerms = [
    "industriel",
    "maintenance",
    "mecanique",
    "electricite",
    "electrotechn",
    "production",
    "soudeur",
    "robotique",
    "chantier",
    "plc",
  ];
  return (
    automationTerms.some((term) => text.includes(term)) &&
    !industrialTerms.some((term) => text.includes(term))
  );
}

async function searchJobs(config) {
  const env = loadEnv();
  const sourceResults = [];

  const forem = await searchForemJobs(config);
  sourceResults.push(forem);

  const adzuna = await searchAdzunaJobs(config, {
    appId: env.ADZUNA_APP_ID,
    appKey: env.ADZUNA_APP_KEY,
  });
  sourceResults.push(adzuna);

  const jooble = await searchJoobleJobs(config, {
    apiKey: env.JOOBLE_API_KEY,
  });
  sourceResults.push(jooble);

  const jobs = deduplicateJobs(sourceResults.flatMap((result) => result.jobs || []))
    .filter(isRelevantDigitalJob)
    .slice(0, Number(config.limite_resultats || 20));

  return {
    searched_at: new Date().toISOString(),
    jobs,
    sources: sourceResults.map((result) => ({
      source: result.source,
      count: result.jobs?.length || 0,
      skipped: result.skipped || "",
      errors: result.errors || [],
    })),
  };
}

module.exports = {
  ROOT,
  loadEnv,
  deduplicateJobs,
  isRelevantDigitalJob,
  searchJobs,
};
