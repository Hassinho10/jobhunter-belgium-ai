const { normalizeForemJob } = require("./normalize-job");

const FOREM_API =
  "https://www.odwb.be/api/explore/v2.1/catalog/datasets/offres-d-emploi-forem/records";

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function searchExpression(keyword) {
  const ignored = new Set(["stage", "stagiaire", "junior", "premier", "emploi"]);
  const tokens = String(keyword || "")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !ignored.has(normalizeText(token)))
    .slice(0, 5);

  const phrase = (tokens.length ? tokens : [keyword])
    .join(" ")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"');

  return `search(titreoffre, "${phrase}") OR search(metier, "${phrase}")`;
}

function matchesLocation(job, locations) {
  if (!locations?.length) return true;
  const place = normalizeText(job.lieu);
  return locations.some((location) => {
    const expected = normalizeText(location);
    if (expected === "belgique") return place.includes("belgique");
    if (expected === "wallonie") return place.includes("wallon") || place.includes("belgique");
    return place.includes(expected);
  });
}

async function fetchJson(url, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`FOREM API ${response.status}`);
    return response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function searchForemJobs(params = {}) {
  const keywords = Array.isArray(params.mots_cles)
    ? params.mots_cles
    : [params.mots_cles || params.mot_cle || ""];
  const limit = Math.max(1, Math.min(Number(params.limite_resultats || 20), 100));
  const perQuery = Math.max(8, Math.min(30, Math.ceil(limit * 1.5)));
  const jobs = [];
  const errors = [];

  for (const keyword of keywords.filter(Boolean)) {
    try {
      const where = searchExpression(keyword);
      const url = new URL(FOREM_API);
      url.searchParams.set("limit", String(perQuery));
      url.searchParams.set("order_by", "datedebutdiffusion DESC");
      if (where) url.searchParams.set("where", where);
      const payload = await fetchJson(url);
      for (const record of payload.results || []) {
        const job = normalizeForemJob(record);
        if (matchesLocation(job, params.lieux)) jobs.push(job);
      }
    } catch (error) {
      errors.push(`${keyword}: ${error.message}`);
    }
  }

  return {
    source: "FOREM Open Data",
    jobs: jobs.slice(0, limit * 4),
    errors,
    endpoint: FOREM_API,
  };
}

module.exports = { searchForemJobs, FOREM_API };
