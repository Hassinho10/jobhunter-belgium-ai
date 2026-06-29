const TOOL_TERMS = [
  "HTML",
  "CSS",
  "JavaScript",
  "TypeScript",
  "SQL",
  "Node.js",
  "React",
  "Angular",
  "Git",
  "Docker",
  "Google Sheets",
  "Google Forms",
  "Notion",
  "Trello",
  "Make",
  "n8n",
];

function arrayValue(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (value === null || value === undefined || value === "") return [];
  return String(value)
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

function stripHtml(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function detectedTools(text) {
  const normalized = String(text || "").toLowerCase();
  return TOOL_TERMS.filter((tool) => normalized.includes(tool.toLowerCase()));
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function baseJob(input = {}) {
  return {
    id_offre: String(input.id_offre || ""),
    source: String(input.source || ""),
    entreprise: String(input.entreprise || ""),
    poste: String(input.poste || ""),
    lieu: String(input.lieu || ""),
    type_contrat: String(input.type_contrat || ""),
    lien_offre: String(input.lien_offre || ""),
    description: String(input.description || ""),
    missions: Array.isArray(input.missions) ? input.missions : [],
    competences_requises: Array.isArray(input.competences_requises) ? input.competences_requises : [],
    competences_souhaitees: Array.isArray(input.competences_souhaitees) ? input.competences_souhaitees : [],
    outils_mentionnes: Array.isArray(input.outils_mentionnes) ? input.outils_mentionnes : [],
    langues: Array.isArray(input.langues) ? input.langues : [],
    niveau_experience: String(input.niveau_experience || ""),
    date_detection: String(input.date_detection || today()),
  };
}

function normalizeForemJob(record) {
  const localities = arrayValue(record.lieuxtravaillocalite);
  const regions = arrayValue(record.lieuxtravailregion);
  const studies = arrayValue(record.niveauxetudes);
  const languages = arrayValue(record.langues);
  const details = [
    record.metier ? `Métier : ${record.metier}.` : "",
    record.regimetravail ? `Régime de travail : ${record.regimetravail}.` : "",
    studies.length ? `Niveau d'études indiqué : ${studies.join(", ")}.` : "",
    languages.length ? `Langues indiquées : ${languages.join(", ")}.` : "",
    record.experiencerequise ? `Expérience requise : ${record.experiencerequise}.` : "Expérience requise : à vérifier.",
    "La description détaillée doit être consultée sur le lien officiel de l'offre.",
  ].filter(Boolean);

  const description = details.join(" ");
  return baseJob({
    id_offre: `FOREM-${record.numerooffreforem || record.referenceexterne || ""}`,
    source: "FOREM Open Data",
    entreprise: record.nomemployeur || "",
    poste: record.titreoffre || record.metier || "",
    lieu: [...localities, ...regions].filter(Boolean).join(", "),
    type_contrat: record.typecontrat || "",
    lien_offre: record.url || "",
    description,
    outils_mentionnes: detectedTools(`${record.titreoffre || ""} ${record.metier || ""}`),
    langues: languages,
    niveau_experience: record.experiencerequise || "à vérifier",
    date_detection: today(),
  });
}

function normalizeAdzunaJob(job) {
  const description = stripHtml(job.description);
  return baseJob({
    id_offre: `ADZUNA-${job.id || ""}`,
    source: "Adzuna API",
    entreprise: job.company?.display_name || "",
    poste: stripHtml(job.title),
    lieu: job.location?.display_name || "",
    type_contrat: [job.contract_type, job.contract_time].filter(Boolean).join(" - "),
    lien_offre: job.redirect_url || "",
    description,
    outils_mentionnes: detectedTools(`${job.title || ""} ${description}`),
    niveau_experience: "à vérifier",
    date_detection: today(),
  });
}

function normalizeJoobleJob(job) {
  const description = stripHtml(job.snippet || job.description);
  return baseJob({
    id_offre: `JOOBLE-${job.id || job.link || ""}`,
    source: "Jooble API",
    entreprise: job.company || "",
    poste: stripHtml(job.title),
    lieu: job.location || "",
    type_contrat: job.type || "",
    lien_offre: job.link || "",
    description,
    outils_mentionnes: detectedTools(`${job.title || ""} ${description}`),
    niveau_experience: "à vérifier",
    date_detection: today(),
  });
}

module.exports = {
  baseJob,
  normalizeForemJob,
  normalizeAdzunaJob,
  normalizeJoobleJob,
};
