const fs = require("fs");
const path = require("path");
const { runSearch } = require("./search-jobs");
const { ROOT, buildCompatibility } = require("./studio-pipeline");

const PROFILE_PATH = path.join(ROOT, "cv-template", "profile-data.json");
const CONFIG_PATH = path.join(ROOT, "config", "search-profile.json");
const DATA_DIR = path.join(ROOT, "data");
const REPORTS_DIR = path.join(ROOT, "reports");
const JSON_PATH = path.join(DATA_DIR, "jobs-ranked.json");
const CSV_PATH = path.join(DATA_DIR, "jobs-ranked.csv");
const REPORT_PATH = path.join(REPORTS_DIR, "job-ranking-report.md");

const COLUMNS = [
  "rang",
  "id_offre",
  "score_total",
  "decision",
  "recommandation_humaine",
  "source",
  "entreprise",
  "poste",
  "lieu",
  "type_contrat",
  "lien_offre",
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

function renderReport(result) {
  const top = result.all_scored.slice(0, 10);
  return `# Classement automatique des offres

- Recherche exécutée : ${result.searched_at}
- Offres trouvées : ${result.total_found}
- Offres scorées : ${result.total_scored}
- Seuil conservé : ${result.score_minimum}/100
- Offres intéressantes : ${result.jobs_ranked.length}

## Meilleures offres

${top.length
    ? top.map((job, index) => `${index + 1}. **${job.score_total}/100** - ${job.poste} - ${job.entreprise || "Entreprise à vérifier"} - ${job.lieu || "Lieu à vérifier"} (${job.source})`).join("\n")
    : "Aucune offre trouvée."}

${result.jobs_ranked.length
    ? `${result.jobs_ranked.length} offre(s) peuvent être préparée(s) après validation humaine.`
    : "Aucune offre n'atteint actuellement le seuil configuré : aucun bouton de préparation n'est activé."}

## Rappel

Le score est une aide locale fondée uniquement sur les données disponibles. Une validation humaine reste obligatoire. Aucune candidature n'est envoyée.
`;
}

async function searchAndScoreJobs() {
  const searchResult = await runSearch();
  const profile = JSON.parse(fs.readFileSync(PROFILE_PATH, "utf8"));
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));

  const allRanked = searchResult.jobs
    .map((offer) => {
      const compatibility = buildCompatibility(profile, offer);
      return {
        ...offer,
        score_total: compatibility.score_total,
        decision: compatibility.decision,
        recommandation_humaine: compatibility.recommandation_humaine,
        points_forts: compatibility.points_forts,
        points_faibles: compatibility.points_faibles,
      };
    })
    .sort((a, b) => b.score_total - a.score_total)
    .map((job, index) => ({ rang_global: index + 1, ...job }));

  const interesting = allRanked
    .filter((job) => job.score_total >= Number(config.score_minimum || 75))
    .map((job, index) => ({ rang: index + 1, ...job }));

  const result = {
    searched_at: searchResult.searched_at,
    score_minimum: Number(config.score_minimum || 75),
    total_found: searchResult.jobs.length,
    total_scored: allRanked.length,
    jobs_ranked: interesting,
    all_scored: allRanked,
    sources: searchResult.sources,
  };

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.writeFileSync(JSON_PATH, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  fs.writeFileSync(CSV_PATH, renderCsv(interesting), "utf8");
  fs.writeFileSync(REPORT_PATH, renderReport(result), "utf8");
  return result;
}

if (require.main === module) {
  searchAndScoreJobs()
    .then((result) => {
      console.log(`Offres trouvées : ${result.total_found}`);
      console.log(`Offres scorées : ${result.total_scored}`);
      console.log(`Offres >= ${result.score_minimum} : ${result.jobs_ranked.length}`);
      result.jobs_ranked.slice(0, 5).forEach((job) => {
        console.log(`- ${job.score_total}/100 | ${job.poste} | ${job.entreprise || "à vérifier"}`);
      });
    })
    .catch((error) => {
      console.error(`Classement impossible : ${error.message}`);
      process.exit(1);
    });
}

module.exports = { searchAndScoreJobs };
