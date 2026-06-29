const { normalizeAdzunaJob } = require("./normalize-job");

async function searchAdzunaJobs(params = {}, credentials = {}) {
  const appId = credentials.appId || process.env.ADZUNA_APP_ID;
  const appKey = credentials.appKey || process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) {
    return { source: "Adzuna API", jobs: [], skipped: "Clés ADZUNA_APP_ID / ADZUNA_APP_KEY absentes." };
  }

  const limit = Math.max(1, Math.min(Number(params.limite_resultats || 20), 50));
  const jobs = [];
  const errors = [];
  const keywords = Array.isArray(params.mots_cles) ? params.mots_cles : [params.mots_cles || ""];
  const locations = Array.isArray(params.lieux) && params.lieux.length ? params.lieux : ["Belgique"];

  for (const keyword of keywords.filter(Boolean).slice(0, 5)) {
    const url = new URL("https://api.adzuna.com/v1/api/jobs/be/search/1");
    url.searchParams.set("app_id", appId);
    url.searchParams.set("app_key", appKey);
    url.searchParams.set("results_per_page", String(limit));
    url.searchParams.set("what", keyword);
    url.searchParams.set("where", locations[0]);
    url.searchParams.set("content-type", "application/json");
    try {
      const response = await fetch(url, { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`Adzuna API ${response.status}`);
      const payload = await response.json();
      jobs.push(...(payload.results || []).map(normalizeAdzunaJob));
    } catch (error) {
      errors.push(`${keyword}: ${error.message}`);
    }
  }

  return { source: "Adzuna API", jobs, errors };
}

module.exports = { searchAdzunaJobs };
