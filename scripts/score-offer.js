const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PROFILE_PATH = path.join(ROOT, "cv-template", "profile-data.json");
const OFFER_PATH = path.join(ROOT, "test-data", "offre-test.json");
const REPORTS_DIR = path.join(ROOT, "reports");
const JSON_REPORT_PATH = path.join(REPORTS_DIR, "compatibility-test-001.json");
const MD_REPORT_PATH = path.join(REPORTS_DIR, "compatibility-test-001.md");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .toLowerCase();
}

function flatten(value) {
  if (Array.isArray(value)) return value.flatMap(flatten);
  if (value && typeof value === "object") return Object.values(value).flatMap(flatten);
  if (value === null || value === undefined) return [];
  return [String(value)];
}

function includesAny(haystack, needles) {
  const normalizedHaystack = normalize(haystack);
  return needles.some((needle) => normalizedHaystack.includes(normalize(needle)));
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function decisionForScore(score) {
  if (score >= 85) return "très bonne opportunité";
  if (score >= 70) return "opportunité intéressante";
  if (score >= 50) return "à examiner";
  return "peu prioritaire";
}

function scoreCompetences(profile, offer) {
  const profileText = flatten([
    profile.competences?.techniques,
    profile.competences?.soft_skills,
    profile.competences?.langues,
    profile.formations,
    profile.experiences,
    profile.projets
  ]).join(" ");

  const offerText = flatten([
    offer.description,
    offer.missions,
    offer.competences_requises,
    offer.competences_souhaitees,
    offer.langues
  ]).join(" ");

  const checks = [
    { label: "HTML", terms: ["html", "html5"], points: 4 },
    { label: "CSS", terms: ["css", "css3"], points: 4 },
    { label: "JavaScript", terms: ["javascript"], points: 4 },
    { label: "SQL / données", terms: ["sql", "base de données", "donnees", "données", "modélisation relationnelle"], points: 4 },
    { label: "rigueur", terms: ["rigueur", "rigoureux"], points: 3 },
    { label: "travail en équipe", terms: ["équipe", "equipe", "travail en équipe"], points: 3 },
    { label: "communication / relation client", terms: ["communication", "relation client"], points: 2 },
    { label: "français", terms: ["français", "francais"], points: 2 },
    { label: "support utilisateur", terms: ["support utilisateur", "support"], points: 3 }
  ];

  const matches = [];
  const manquants = [];
  let score = 0;

  for (const check of checks) {
    if (!includesAny(offerText, check.terms)) continue;
    if (includesAny(profileText, check.terms)) {
      matches.push(check.label);
      score += check.points;
    } else {
      manquants.push(check.label);
    }
  }

  return { score: Math.min(score, 30), max: 30, matches: unique(matches), manquants: unique(manquants) };
}

function scoreOutils(profile, offer) {
  const profileText = flatten([
    profile.competences?.techniques,
    profile.competences?.outils,
    profile.formations,
    profile.projets
  ]).join(" ");

  const offerTools = flatten(offer.outils_mentionnes).join(" ");
  const checks = [
    { label: "HTML", terms: ["html", "html5"], points: 3 },
    { label: "CSS", terms: ["css", "css3"], points: 3 },
    { label: "JavaScript", terms: ["javascript"], points: 3 },
    { label: "SQL", terms: ["sql"], points: 2 },
    { label: "Git", terms: ["git"], points: 2 },
    { label: "Google Sheets", terms: ["google sheets"], points: 2 },
    { label: "Google Forms", terms: ["google forms"], points: 1 },
    { label: "Notion", terms: ["notion"], points: 1 },
    { label: "Trello", terms: ["trello"], points: 1 },
    { label: "Make ou n8n", terms: ["make", "n8n"], points: 2 }
  ];

  const matches = [];
  const manquants = [];
  let score = 0;

  for (const check of checks) {
    if (!includesAny(offerTools, check.terms)) continue;
    if (includesAny(profileText, check.terms)) {
      matches.push(check.label);
      score += check.points;
    } else {
      manquants.push(check.label);
    }
  }

  return { score: Math.min(score, 20), max: 20, matches: unique(matches), manquants: unique(manquants) };
}

function scoreContratLocalisation(profile, offer) {
  const objectifs = profile.objectifs || {};
  const profileLocations = flatten(objectifs.localisations).join(" ");
  const profileContracts = flatten(objectifs.contrats).join(" ");
  const offerText = flatten([offer.lieu, offer.type_contrat, offer.modalites, offer.criteres_importants]).join(" ");
  const matches = [];
  const pointsAttention = [];
  let score = 0;

  if (includesAny(offerText, ["stage"]) && includesAny(profileContracts, ["stage"])) {
    matches.push("stage compatible");
    score += 7;
  }
  if (includesAny(offerText, ["conventionné", "conventionne", "convention"]) && includesAny(profileContracts, ["forem", "stage"])) {
    matches.push("stage conventionné compatible");
    score += 4;
  }
  if (includesAny(offerText, ["charleroi"]) && includesAny(profileLocations, ["charleroi"])) {
    matches.push("localisation Charleroi compatible");
    score += 5;
  }
  if (includesAny(offerText, ["courcelles", "gosselies", "alentours"]) && includesAny(profileLocations, ["courcelles", "gosselies", "alentours"])) {
    matches.push("zone proche du profil");
    score += 1;
  }
  if (includesAny(offerText, ["mai", "juillet", "dès que possible", "des que possible"])) {
    matches.push("date de début à vérifier mais plausible");
    pointsAttention.push("La date de début exacte doit être confirmée.");
  }
  if (includesAny(offerText, ["temps plein", "4/5"])) {
    matches.push("temps de travail potentiellement compatible");
  }
  if (!includesAny(offerText, ["5 semaines"])) {
    pointsAttention.push("La durée exacte du stage de Hassan doit être confirmée.");
  }

  return { score: Math.min(score, 20), max: 20, matches: unique(matches), points_attention: unique(pointsAttention) };
}

function scoreNiveau(offer) {
  const offerText = flatten([offer.niveau_experience, offer.description, offer.criteres_importants]).join(" ");
  const matches = [];
  const pointsAttention = [];
  let score = 0;

  if (includesAny(offerText, ["junior accepté", "junior accepte", "profil junior"])) {
    matches.push("profil junior accepté");
    score += 6;
  }
  if (includesAny(offerText, ["stage possible", "stage"])) {
    matches.push("stage possible");
    score += 5;
  }
  if (includesAny(offerText, ["première expérience non obligatoire", "premiere experience non obligatoire"])) {
    matches.push("première expérience non obligatoire");
    score += 4;
  }
  if (score < 15) {
    pointsAttention.push("Le niveau attendu doit être relu dans l'offre réelle.");
  }

  return { score: Math.min(score, 15), max: 15, matches: unique(matches), points_attention: unique(pointsAttention) };
}

function scoreObjectifs(profile, offer) {
  const objectifs = profile.objectifs || {};
  const profileText = flatten([
    objectifs.type_recherche,
    objectifs.domaines_recherches,
    profile.resume_base,
    profile.formations,
    profile.projets
  ]).join(" ");
  const offerText = flatten([offer.poste, offer.description, offer.missions, offer.competences_souhaitees, offer.criteres_importants]).join(" ");

  const checks = [
    { label: "stage", terms: ["stage"], points: 3 },
    { label: "outils numériques", terms: ["outils numériques", "outils numeriques", "digital"], points: 2 },
    { label: "développement web", terms: ["développement web", "developpement web", "web"], points: 3 },
    { label: "automatisation", terms: ["automatisation", "automatisations"], points: 2 },
    { label: "IA / productivité", terms: ["ia", "productivité", "productivite"], points: 1 },
    { label: "support administratif digital", terms: ["support administratif", "administratif"], points: 2 },
    { label: "projets concrets", terms: ["projets concrets", "projet web", "application"], points: 2 }
  ];

  const matches = [];
  const pointsAttention = [];
  let score = 0;

  for (const check of checks) {
    if (!includesAny(offerText, check.terms)) continue;
    if (includesAny(profileText, check.terms)) {
      matches.push(check.label);
      score += check.points;
    } else if (["automatisation", "support administratif digital"].includes(check.label)) {
      pointsAttention.push(`${check.label} présent dans l'offre mais pas fortement documenté dans le profil.`);
    } else {
      pointsAttention.push(`${check.label} à confirmer dans le profil.`);
    }
  }

  return { score: Math.min(score, 15), max: 15, matches: unique(matches), points_attention: unique(pointsAttention) };
}

function buildReport(profile, offer) {
  const competences = scoreCompetences(profile, offer);
  const outils = scoreOutils(profile, offer);
  const contratLocalisation = scoreContratLocalisation(profile, offer);
  const niveau = scoreNiveau(offer);
  const objectifs = scoreObjectifs(profile, offer);
  const scoreTotal = competences.score + outils.score + contratLocalisation.score + niveau.score + objectifs.score;

  const pointsForts = unique([
    "Stage et profil junior acceptés.",
    "Localisation Charleroi compatible avec la zone de recherche.",
    ...competences.matches.map((item) => `Compétence alignée : ${item}.`),
    ...outils.matches.map((item) => `Outil ou technologie aligné : ${item}.`),
    "Rigueur et travail en équipe cohérents avec le parcours pharma GMP et Horeca."
  ]);

  const pointsFaibles = unique([
    ...competences.manquants.map((item) => `Compétence non confirmée dans le profil : ${item}.`),
    ...outils.manquants.map((item) => `Outil non confirmé dans le profil : ${item}.`),
    ...contratLocalisation.points_attention,
    ...objectifs.points_attention,
    "Le poste est partiellement orienté support administratif, pas uniquement développement fullstack."
  ]);

  return {
    id_offre: offer.id_offre,
    poste: offer.poste,
    entreprise: offer.entreprise,
    score_total: scoreTotal,
    decision: decisionForScore(scoreTotal),
    details_score: {
      competences,
      outils,
      contrat_localisation: contratLocalisation,
      niveau,
      objectifs
    },
    points_forts: pointsForts,
    points_faibles: pointsFaibles,
    mots_cles_correspondants: unique([
      ...competences.matches,
      ...outils.matches,
      ...contratLocalisation.matches,
      ...niveau.matches,
      ...objectifs.matches
    ]),
    mots_cles_manquants: unique([...competences.manquants, ...outils.manquants]),
    recommandation:
      scoreTotal >= 70
        ? "Opportunité intéressante à valider humainement. Vérifier la part réelle d'automatisation, de développement web et la durée exacte du stage avant toute candidature."
        : "Offre à examiner avec prudence avant d'investir du temps dans une candidature.",
    prochaines_actions: [
      "Faire valider humainement le score et la décision.",
      "Vérifier la durée exacte du stage et la date de début.",
      "Clarifier la part entre support administratif, automatisation et développement web.",
      "Confirmer les outils réellement utilisés par l'équipe.",
      "Ne générer un CV ou une lettre adaptée qu'après validation humaine."
    ],
    validation_humaine_requise: true
  };
}

function renderMarkdown(report, offer) {
  const lines = [];
  lines.push(`# Rapport de compatibilité - ${report.id_offre}`);
  lines.push("");
  lines.push("## Résumé de l'offre");
  lines.push("");
  lines.push(`- Poste : ${report.poste}`);
  lines.push(`- Entreprise : ${report.entreprise}`);
  lines.push(`- Lieu : ${offer.lieu}`);
  lines.push(`- Type de contrat : ${offer.type_contrat}`);
  lines.push(`- Source : ${offer.source}`);
  lines.push("");
  lines.push(offer.description);
  lines.push("");
  lines.push("## Score global");
  lines.push("");
  lines.push(`Score : **${report.score_total} / 100**`);
  lines.push("");
  lines.push(`Décision : **${report.decision}**`);
  lines.push("");
  lines.push("## Détails du score");
  lines.push("");

  for (const [key, detail] of Object.entries(report.details_score)) {
    lines.push(`### ${key.replace("_", " ")}`);
    lines.push("");
    lines.push(`- Score : ${detail.score} / ${detail.max}`);
    if (detail.matches?.length) lines.push(`- Correspondances : ${detail.matches.join(", ")}`);
    if (detail.manquants?.length) lines.push(`- Manquants : ${detail.manquants.join(", ")}`);
    if (detail.points_attention?.length) lines.push(`- Points d'attention : ${detail.points_attention.join(" ; ")}`);
    lines.push("");
  }

  lines.push("## Points forts");
  lines.push("");
  report.points_forts.forEach((item) => lines.push(`- ${item}`));
  lines.push("");
  lines.push("## Points faibles");
  lines.push("");
  report.points_faibles.forEach((item) => lines.push(`- ${item}`));
  lines.push("");
  lines.push("## Recommandation");
  lines.push("");
  lines.push(report.recommandation);
  lines.push("");
  lines.push("## Prochaines actions");
  lines.push("");
  report.prochaines_actions.forEach((item) => lines.push(`- ${item}`));
  lines.push("");
  lines.push("## Rappel");
  lines.push("");
  lines.push("Aucune candidature ne doit être envoyée sans validation humaine explicite.");
  lines.push("");
  return lines.join("\n");
}

function main() {
  const profile = readJson(PROFILE_PATH);
  const offer = readJson(OFFER_PATH);
  const report = buildReport(profile, offer);

  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.writeFileSync(JSON_REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.writeFileSync(MD_REPORT_PATH, renderMarkdown(report, offer), "utf8");

  console.log(`Score ${report.id_offre}: ${report.score_total}/100`);
  console.log(`Décision: ${report.decision}`);
  console.log("Rapports générés:");
  console.log(`- ${path.relative(ROOT, JSON_REPORT_PATH)}`);
  console.log(`- ${path.relative(ROOT, MD_REPORT_PATH)}`);
}

main();
