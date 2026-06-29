const { normalizeJoobleJob } = require("./normalize-job");

async function searchJoobleJobs(params = {}, credentials = {}) {
  const apiKey = credentials.apiKey || process.env.JOOBLE_API_KEY;
  if (!apiKey) {
    return { source: "Jooble API", jobs: [], skipped: "Clé JOOBLE_API_KEY absente." };
  }

  const keywords = Array.isArray(params.mots_cles) ? params.mots_cles : [params.mots_cles || ""];
  const locations = Array.isArray(params.lieux) && params.lieux.length ? params.lieux : ["Belgique"];
  const limit = Math.max(1, Math.min(Number(params.limite_resultats || 20), 50));
  const jobs = [];
  const errors = [];

  for (const keyword of keywords.filter(Boolean).slice(0, 5)) {
    try {
      const response = await fetch(`https://jooble.org/api/${encodeURIComponent(apiKey)}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keywords: keyword,
          location: locations[0],
          page: 1,
          ResultOnPage: limit,
        }),
      });
      if (!response.ok) throw new Error(`Jooble API ${response.status}`);
      const payload = await response.json();
      jobs.push(...(payload.jobs || []).map(normalizeJoobleJob));
    } catch (error) {
      errors.push(`${keyword}: ${error.message}`);
    }
  }

  return { source: "Jooble API", jobs, errors };
}

module.exports = { searchJoobleJobs };
