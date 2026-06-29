const fs = require("fs");
const path = require("path");
const { searchJobs, ROOT } = require("../sources/job-search");

const CONFIG_PATH = path.join(ROOT, "config", "search-profile.json");
const DATA_DIR = path.join(ROOT, "data");
const REPORTS_DIR = path.join(ROOT, "reports");
const JSON_PATH = path.join(DATA_DIR, "jobs-found.json");
const CSV_PATH = path.join(DATA_DIR, "jobs-found.csv");
const REPORT_PATH = path.join(REPORTS_DIR, "job-search-report.md");

const COLUMNS = [
  "id_offre",
  "source",
  "entreprise",
  "poste",
  "lieu",
  "type_contrat",
  "lien_offre",
  "description",
  "niveau_experience",
  "date_detection",
];

function csvEscape(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function renderCsv(jobs) {
  return [
    COLUMNS.join(","),
    ...jobs.map((job) => COLUMNS.map((column) => csvEscape(job[column])).join(",")),
  ].join("\n") + "\n";
}

function renderReport(result, config) {
  const sourceLines = result.sources.map((source) => {
    const state = source.skipped ? `ignorée (${source.skipped})` : `${source.count} résultat(s) brut(s)`;
    const errors = source.errors?.length ? `; erreurs : ${source.errors.join(" | ")}` : "";
    return `- ${source.source} : ${state}${errors}`;
  });

  return `# Rapport de recherche d'offres

- Date : ${result.searched_at}
- Offres normalisées et dédupliquées : ${result.jobs.length}
- Limite demandée : ${config.limite_resultats}
- Mots-clés : ${config.mots_cles.join(", ")}
- Lieux : ${config.lieux.join(", ")}

## Sources

${sourceLines.join("\n")}

## Fichiers

- \`data/jobs-found.json\`
- \`data/jobs-found.csv\`

## Limites

- Le FOREM Open Data ne fournit pas toujours la description détaillée de l'offre.
- Les champs absents restent vides ou sont marqués à vérifier.
- Adzuna et Jooble ne sont interrogés que si leurs clés existent dans \`.env\`.
- Aucun site protégé n'est scrappé.
- Aucune candidature n'est envoyée.
`;
}

async function runSearch() {
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  const result = await searchJobs(config);
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.writeFileSync(JSON_PATH, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  fs.writeFileSync(CSV_PATH, renderCsv(result.jobs), "utf8");
  fs.writeFileSync(REPORT_PATH, renderReport(result, config), "utf8");
  return result;
}

if (require.main === module) {
  runSearch()
    .then((result) => {
      console.log(`Offres trouvées : ${result.jobs.length}`);
      for (const source of result.sources) {
        console.log(`- ${source.source}: ${source.skipped || `${source.count} résultat(s) brut(s)`}`);
      }
    })
    .catch((error) => {
      console.error(`Recherche impossible : ${error.message}`);
      process.exit(1);
    });
}

module.exports = { runSearch };
