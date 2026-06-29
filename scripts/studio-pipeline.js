const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawn } = require("child_process");
const { pathToFileURL } = require("url");

const ROOT = path.resolve(__dirname, "..");
const PROFILE_PATH = path.join(ROOT, "cv-template", "profile-data.json");
const ANSWERS_PATH = path.join(ROOT, "validations", "hassan-answers-test-001.json");
const CV_TEMPLATE_PATH = path.join(ROOT, "cv-template", "index.html");
const LETTER_TEMPLATE_PATH = path.join(ROOT, "lettre-template", "index.html");
const CURRENT_OFFER_PATH = path.join(ROOT, "test-data", "current-offer.json");
const DATA_CURRENT_OFFER_PATH = path.join(ROOT, "data", "current-offer.json");
const COMPATIBILITY_JSON = path.join(ROOT, "reports", "current-compatibility.json");
const COMPATIBILITY_MD = path.join(ROOT, "reports", "current-compatibility.md");
const PLAN_JSON = path.join(ROOT, "reports", "current-adaptation-plan.json");
const PLAN_MD = path.join(ROOT, "reports", "current-adaptation-plan.md");
const VALIDATION_JSON = path.join(ROOT, "validations", "current-validation.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function writeText(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

function rel(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, "/");
}

function cleanText(value) {
  return String(value || "")
    .replace(/Ã©/g, "é")
    .replace(/Ã¨/g, "è")
    .replace(/Ãª/g, "ê")
    .replace(/Ã /g, "à")
    .replace(/Ã§/g, "ç")
    .replace(/Ã´/g, "ô")
    .replace(/Ã¹/g, "ù")
    .replace(/Ã®/g, "î")
    .replace(/Ã¯/g, "ï")
    .replace(/Ã‰/g, "É")
    .replace(/â€™/g, "'")
    .replace(/â€œ|â€/g, '"')
    .replace(/â€”/g, "-");
}

function normalize(value) {
  return cleanText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function flatten(value) {
  if (Array.isArray(value)) return value.flatMap(flatten);
  if (value && typeof value === "object") return Object.values(value).flatMap(flatten);
  if (value === null || value === undefined) return [];
  return [cleanText(value)];
}

function includesAny(text, terms) {
  const haystack = normalize(text);
  return terms.some((term) => {
    const needle = normalize(term);
    if (/^[a-z0-9]+$/.test(needle) && needle.length <= 3) {
      const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`).test(haystack);
    }
    return haystack.includes(needle);
  });
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function csvEscape(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function safeId(value) {
  const normalized = String(value || "CURRENT-OFFER")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
  return normalized || "CURRENT-OFFER";
}

function offerText(offer) {
  return flatten(offer).join(" ");
}

function decisionForScore(score) {
  if (score >= 85) return "très bonne opportunité";
  if (score >= 70) return "opportunité intéressante";
  if (score >= 50) return "à examiner";
  return "peu prioritaire";
}

function humanRecommendation(score) {
  if (score >= 85) return "OUI";
  if (score >= 50) return "MODIFIER";
  return "NON";
}

function scoreCategory(profileText, currentOfferText, checks, max) {
  const matches = [];
  const missing = [];
  let score = 0;

  for (const check of checks) {
    if (!includesAny(currentOfferText, check.offerTerms || check.terms)) continue;
    if (includesAny(profileText, check.profileTerms || check.terms)) {
      matches.push(check.label);
      score += check.points;
    } else {
      missing.push(check.label);
    }
  }

  return {
    score: Math.min(score, max),
    max,
    matches: unique(matches),
    manquants: unique(missing),
  };
}

function buildCompatibility(profile, offer) {
  const fullOfferText = offerText(offer);
  const skillsText = flatten([
    profile.competences,
    profile.experiences,
    profile.formations,
    profile.projets,
  ]).join(" ");
  const toolsText = flatten([
    profile.competences?.techniques,
    profile.competences?.outils,
    profile.formations,
    profile.projets,
  ]).join(" ");

  const competences = scoreCategory(
    skillsText,
    fullOfferText,
    [
      { label: "HTML", terms: ["html"], points: 4 },
      { label: "CSS", terms: ["css"], points: 4 },
      { label: "JavaScript", terms: ["javascript", "js"], points: 4 },
      { label: "SQL / données", terms: ["sql", "base de données", "données"], points: 4 },
      { label: "rigueur", terms: ["rigueur", "rigoureux"], points: 3 },
      { label: "traçabilité", terms: ["traçabilité", "tracabilite"], points: 3 },
      { label: "travail en équipe", terms: ["équipe", "collaboration"], points: 3 },
      { label: "communication", terms: ["communication", "rédaction", "français"], points: 2 },
      { label: "adaptabilité", terms: ["adaptabilité", "autonomie"], points: 3 },
    ],
    30,
  );

  const outils = scoreCategory(
    toolsText,
    fullOfferText,
    [
      { label: "HTML", terms: ["html"], points: 3 },
      { label: "CSS", terms: ["css"], points: 3 },
      { label: "JavaScript", terms: ["javascript"], points: 3 },
      { label: "SQL", terms: ["sql"], points: 3 },
      { label: "Git", terms: ["git"], points: 2 },
      { label: "Node.js", terms: ["node.js", "nodejs"], points: 2 },
      { label: "Express", terms: ["express"], points: 1 },
      { label: "Docker", terms: ["docker"], points: 1 },
      { label: "Google Sheets", terms: ["google sheets"], points: 1 },
      { label: "Google Forms", terms: ["google forms"], points: 1 },
    ],
    20,
  );

  const locationText = flatten(profile.objectifs?.localisations).join(" ");
  const contractText = flatten(profile.objectifs?.contrats).join(" ");
  const contractLocationMatches = [];
  const contractLocationAttention = [];
  let contractLocationScore = 0;

  if (includesAny(fullOfferText, ["stage"]) && includesAny(contractText, ["stage"])) {
    contractLocationMatches.push("stage compatible");
    contractLocationScore += 8;
  } else if (offer.type_contrat) {
    contractLocationAttention.push("Le type de contrat doit être vérifié.");
  }

  const offerLocation = normalize(offer.lieu);
  const knownLocations = flatten(profile.objectifs?.localisations);
  if (knownLocations.some((location) => offerLocation.includes(normalize(location)) || normalize(location).includes(offerLocation))) {
    contractLocationMatches.push("localisation compatible");
    contractLocationScore += 8;
  } else if (offer.lieu) {
    contractLocationAttention.push(`Localisation à confirmer : ${offer.lieu}.`);
  }

  if (includesAny(fullOfferText, ["télétravail", "teletravail", "hybride"])) {
    contractLocationMatches.push("modalité flexible mentionnée");
    contractLocationScore += 4;
  }

  const niveauMatches = [];
  const niveauAttention = [];
  let niveauScore = 0;
  if (includesAny(fullOfferText, ["junior", "débutant", "stage", "stagiaire"])) {
    niveauMatches.push("niveau junior ou stage accepté");
    niveauScore += 10;
  } else {
    niveauAttention.push("Le niveau junior n'est pas explicitement confirmé.");
  }
  if (includesAny(fullOfferText, ["expérience non obligatoire", "formation", "apprentissage"])) {
    niveauMatches.push("apprentissage ou formation valorisé");
    niveauScore += 5;
  }

  const objectivesText = flatten([
    profile.objectifs,
    profile.resume_base,
    profile.projets,
  ]).join(" ");
  const objectifs = scoreCategory(
    objectivesText,
    fullOfferText,
    [
      { label: "stage", terms: ["stage"], points: 3 },
      { label: "développement web", terms: ["développement web", "web"], points: 3 },
      { label: "outils numériques", terms: ["digital", "numérique", "outils"], points: 2 },
      { label: "automatisation", terms: ["automatisation", "no-code", "n8n"], points: 2 },
      { label: "données", terms: ["données", "sql", "tableaux"], points: 2 },
      { label: "projet concret", terms: ["projet", "application"], points: 3 },
    ],
    15,
  );

  const total =
    competences.score +
    outils.score +
    Math.min(contractLocationScore, 20) +
    Math.min(niveauScore, 15) +
    objectifs.score;

  const pointsForts = unique([
    ...competences.matches.map((item) => `Compétence confirmée : ${item}.`),
    ...outils.matches.map((item) => `Outil ou technologie confirmé : ${item}.`),
    ...contractLocationMatches.map((item) => `${item}.`),
    ...niveauMatches.map((item) => `${item}.`),
    ...objectifs.matches.map((item) => `Objectif aligné : ${item}.`),
  ]);

  const pointsFaibles = unique([
    ...competences.manquants.map((item) => `Compétence demandée mais non confirmée : ${item}.`),
    ...outils.manquants.map((item) => `Outil demandé mais non confirmé : ${item}.`),
    ...contractLocationAttention,
    ...niveauAttention,
    ...objectifs.manquants.map((item) => `Élément de l'offre à vérifier : ${item}.`),
  ]);

  return {
    id_offre: offer.id_offre,
    poste: offer.poste,
    entreprise: offer.entreprise,
    score_total: total,
    decision: decisionForScore(total),
    recommandation_humaine: humanRecommendation(total),
    details_score: {
      competences,
      outils,
      contrat_localisation: {
        score: Math.min(contractLocationScore, 20),
        max: 20,
        matches: contractLocationMatches,
        points_attention: contractLocationAttention,
      },
      niveau: {
        score: Math.min(niveauScore, 15),
        max: 15,
        matches: niveauMatches,
        points_attention: niveauAttention,
      },
      objectifs,
    },
    points_forts: pointsForts,
    points_faibles: pointsFaibles,
    mots_cles_correspondants: unique([...competences.matches, ...outils.matches, ...objectifs.matches]),
    mots_cles_manquants: unique([...competences.manquants, ...outils.manquants, ...objectifs.manquants]),
    statut: "analyse_locale_terminee",
    validation_humaine_requise: true,
  };
}

function renderCompatibilityMarkdown(report, offer) {
  return `# Compatibilité de l'offre courante

## Offre

- Entreprise : ${offer.entreprise || "non renseignée"}
- Poste : ${offer.poste || "non renseigné"}
- Lieu : ${offer.lieu || "non renseigné"}
- Contrat : ${offer.type_contrat || "non renseigné"}
- Source : ${offer.source || "non renseignée"}

## Résultat

- Score : **${report.score_total} / 100**
- Décision : **${report.decision}**
- Recommandation humaine proposée : **${report.recommandation_humaine}**

## Points forts

${report.points_forts.length ? report.points_forts.map((item) => `- ${item}`).join("\n") : "- Aucun point fort détecté automatiquement."}

## Points faibles

${report.points_faibles.length ? report.points_faibles.map((item) => `- ${item}`).join("\n") : "- Aucun point faible détecté automatiquement."}

## Rappel

Cette analyse utilise uniquement le profil local. Toute génération nécessite une confirmation humaine OUI. Aucune candidature n'est envoyée.
`;
}

function normalizeOffer(input, options = {}) {
  return {
    id_offre: String(options.forceCurrentId ? "CURRENT-OFFER" : input.id_offre || "CURRENT-OFFER"),
    date_detection: String(input.date_detection || new Date().toISOString().slice(0, 10)),
    source: String(input.source || "").trim(),
    entreprise: String(input.entreprise || "").trim(),
    poste: String(input.poste || "").trim(),
    lieu: String(input.lieu || "").trim(),
    type_contrat: String(input.type_contrat || "").trim(),
    lien_offre: String(input.lien_offre || "").trim(),
    description: String(input.description || "").trim(),
    missions: Array.isArray(input.missions) ? input.missions : [],
    competences_requises: Array.isArray(input.competences_requises) ? input.competences_requises : [],
    competences_souhaitees: Array.isArray(input.competences_souhaitees) ? input.competences_souhaitees : [],
    outils_mentionnes: Array.isArray(input.outils_mentionnes) ? input.outils_mentionnes : [],
    langues: Array.isArray(input.langues) ? input.langues : [],
    niveau_experience: String(input.niveau_experience || ""),
    formation_souhaitee: String(input.formation_souhaitee || ""),
    modalites: input.modalites && typeof input.modalites === "object" ? input.modalites : {},
    criteres_importants: Array.isArray(input.criteres_importants) ? input.criteres_importants : [],
    points_attention: Array.isArray(input.points_attention) ? input.points_attention : [],
  };
}

function analyzeOffer(input) {
  const offer = normalizeOffer(input);
  if (!offer.description) throw new Error("La description de l'offre est obligatoire.");
  if (!offer.poste) throw new Error("Le poste est obligatoire.");

  const profile = readJson(PROFILE_PATH);
  const report = buildCompatibility(profile, offer);
  writeJson(CURRENT_OFFER_PATH, offer);
  writeJson(DATA_CURRENT_OFFER_PATH, offer);
  writeJson(COMPATIBILITY_JSON, report);
  writeText(COMPATIBILITY_MD, renderCompatibilityMarkdown(report, offer));
  const answers = readJson(ANSWERS_PATH);
  const plan = buildPlan(profile, offer, report, answers);
  plan.validation_humaine = {
    requise: true,
    decision: "",
    statut: "en_attente",
    source: "JobHunter Studio local",
  };
  writeJson(PLAN_JSON, plan);
  writeText(PLAN_MD, renderPlanMarkdown(plan, offer));
  writeJson(VALIDATION_JSON, {
    id_offre: offer.id_offre,
    decision_humaine: "",
    statut_validation: "en_attente",
    prochaine_action: "attendre_validation_humaine",
    date_validation: "",
    source: "JobHunter Studio local",
  });
  return report;
}

function buildPlan(profile, offer, compatibility, answers) {
  const currentOfferText = offerText(offer);
  const confirmedSkills = ["HTML", "CSS", "JavaScript", "SQL"].filter((skill) =>
    includesAny(currentOfferText, [skill]),
  );
  const highlightedSkills = confirmedSkills.length ? confirmedSkills : ["HTML", "CSS", "JavaScript", "SQL"];
  if (includesAny(currentOfferText, ["rigueur", "qualité", "traçabilité", "méthode"])) {
    highlightedSkills.push("rigueur", "traçabilité", "méthode de travail GMP");
  }
  if (includesAny(currentOfferText, ["n8n", "automatisation", "no-code"]) && normalize(answers.n8n).includes("apprentissage")) {
    highlightedSkills.push("n8n - en cours d'apprentissage");
  }

  const projects = profile.projets
    .filter((project) => includesAny(currentOfferText, flatten(project).concat(project.nom)))
    .slice(0, 3)
    .map((project) => `${cleanText(project.nom)} : ${cleanText(project.description)}`);

  if (!projects.length) {
    projects.push(
      "RestoOrder : application avec base SQL structurée et organisation de données.",
      "JobHunter Belgium AI : projet personnel local de scoring, validation humaine et suivi de candidatures.",
    );
  }

  const title = offer.poste || "Profil junior digital et développement web";
  const summary =
    `Profil junior en reconversion vers le développement web, avec des bases confirmées en HTML, CSS, JavaScript et SQL. ` +
    `Le parcours en sciences biomédicales et en environnement pharmaceutique GMP apporte rigueur, traçabilité et méthode de travail. ` +
    `L'automatisation est un domaine d'apprentissage actuel, sans prétendre à une maîtrise non confirmée.`;

  const message =
    `Madame, Monsieur,\n\n` +
    `Votre offre de ${title}${offer.entreprise ? ` chez ${offer.entreprise}` : ""} a retenu mon attention.\n\n` +
    `Actuellement en formation Développeur Web Apps Full Stack à Technofutur TIC, je consolide mes compétences en HTML, CSS, JavaScript et SQL. ` +
    `Mon parcours en sciences biomédicales et mon expérience en environnement pharmaceutique GMP m'ont apporté rigueur, traçabilité et méthode de travail.\n\n` +
    (includesAny(currentOfferText, ["n8n", "automatisation", "no-code"])
      ? `Je développe également mes connaissances en automatisation, avec n8n en cours d'apprentissage, notamment à travers mon projet personnel JobHunter Belgium AI.\n\n`
      : "") +
    `Je souhaite contribuer avec un positionnement junior honnête, une forte motivation et une capacité d'apprentissage rapide.\n\n` +
    `Bien cordialement,\nHassan Chajai`;

  return {
    id_offre: offer.id_offre,
    score_compatibilite: compatibility.score_total,
    decision_preparation: compatibility.recommandation_humaine,
    titre_cv_recommande: title,
    resume_recommande: summary,
    competences_a_mettre_en_avant: unique(highlightedSkills),
    experiences_projets_a_mettre_en_avant: projects,
    elements_a_ne_pas_surexposer: [
      "Ne pas présenter n8n comme maîtrisé.",
      "Ne pas utiliser Make ou Trello comme compétences confirmées.",
      "Ne pas surévaluer Google Sheets, Google Forms ou Notion.",
      "Ne pas transformer un projet personnel en expérience client.",
    ],
    message_candidature_court: message,
    validation_humaine: {
      requise: true,
      decision: "OUI",
      source: "confirmation explicite dans JobHunter Studio",
    },
  };
}

function renderPlanMarkdown(plan, offer) {
  return `# Plan d'adaptation courant

## Offre

- ${offer.poste}
- ${offer.entreprise || "Entreprise non renseignée"}
- Score : ${plan.score_compatibilite}/100
- Décision proposée : ${plan.decision_preparation}

## Titre CV recommandé

${plan.titre_cv_recommande}

## Résumé recommandé

${plan.resume_recommande}

## Compétences à mettre en avant

${plan.competences_a_mettre_en_avant.map((item) => `- ${item}`).join("\n")}

## Expériences et projets

${plan.experiences_projets_a_mettre_en_avant.map((item) => `- ${item}`).join("\n")}

## Limites

${plan.elements_a_ne_pas_surexposer.map((item) => `- ${item}`).join("\n")}

Génération autorisée uniquement après confirmation humaine OUI. Aucun envoi automatique.
`;
}

function replaceFirst(source, pattern, replacement) {
  return pattern.test(source) ? source.replace(pattern, replacement) : source;
}

function generateCvHtml(template, plan) {
  let html = template;
  html = replaceFirst(
    html,
    /<h2 class="job-title">[\s\S]*?<\/h2>/,
    `<h2 class="job-title">${escapeHtml(plan.titre_cv_recommande)}</h2>`,
  );
  html = replaceFirst(
    html,
    /<p class="tagline">[\s\S]*?<\/p>/,
    `<p class="tagline">Profil junior • Développement web • Rigueur GMP • Automatisation en apprentissage</p>`,
  );
  html = replaceFirst(
    html,
    /<p class="profile-text">[\s\S]*?<\/p>/,
    `<p class="profile-text">${escapeHtml(plan.resume_recommande)}</p>`,
  );
  return html.replace(
    "</body>",
    `<!-- Généré localement par JobHunter Studio. Vérification humaine obligatoire. -->\n</body>`,
  );
}

function messageToLetterBody(message) {
  return message
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph, index) =>
      index === 0
        ? `<div class="letter-greeting">${escapeHtml(paragraph)}</div>`
        : `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`,
    )
    .join("\n");
}

function generateLetterHtml(template, offer, plan) {
  let html = template;
  html = replaceFirst(
    html,
    /<div class="contact-label">OBJET<\/div><div class="contact-value">[\s\S]*?<\/div>/,
    `<div class="contact-label">OBJET</div><div class="contact-value">Candidature<br>${escapeHtml(offer.poste)}</div>`,
  );
  html = replaceFirst(
    html,
    /<div class="letter-object">[\s\S]*?<\/div>/,
    `<div class="letter-object">OBJET : CANDIDATURE - ${escapeHtml(offer.poste.toUpperCase())}</div>`,
  );
  html = replaceFirst(
    html,
    /<div class="letter-body">[\s\S]*?<\/div>\s*<div class="letter-signature-container">/,
    `<div class="letter-body">\n${messageToLetterBody(plan.message_candidature_court)}\n</div>\n<div class="letter-signature-container">`,
  );
  return html.replace(
    "</body>",
    `<!-- Généré localement par JobHunter Studio. Vérification humaine obligatoire. -->\n</body>`,
  );
}

function findBrowser() {
  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

async function renderPdfWithPlaywright(htmlPath, pdfPath) {
  const nodeModulesPath = path.join(
    os.homedir(),
    ".cache",
    "codex-runtimes",
    "codex-primary-runtime",
    "dependencies",
    "node",
    "node_modules",
  );
  const pnpmPath = path.join(nodeModulesPath, ".pnpm");
  if (!fs.existsSync(pnpmPath)) return null;
  const playwrightPackage = fs
    .readdirSync(pnpmPath)
    .find((name) => /^playwright@\d/.test(name));
  const playwrightPath = playwrightPackage
    ? path.join(pnpmPath, playwrightPackage, "node_modules", "playwright")
    : path.join(nodeModulesPath, "playwright");
  if (!fs.existsSync(playwrightPath)) return null;

  const { chromium } = require(playwrightPath);
  const executablePath = findBrowser();
  if (!executablePath) return null;

  const browser = await chromium.launch({ headless: true, executablePath });
  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "load" });
    await page.emulateMedia({ media: "print" });
    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
    });
  } finally {
    await browser.close();
  }

  return {
    browser: `Playwright + ${path.basename(executablePath)}`,
    size: fs.statSync(pdfPath).size,
  };
}

function renderPdfWithBrowserCli(htmlPath, pdfPath) {
  return new Promise((resolve, reject) => {
    const browser = findBrowser();
    if (!browser) {
      reject(new Error("Chrome ou Edge local introuvable pour la génération PDF."));
      return;
    }

    fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
    const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), "jobhunter-studio-"));
    const args = [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-extensions",
      "--no-pdf-header-footer",
      `--user-data-dir=${profileDir}`,
      `--print-to-pdf=${pdfPath}`,
      pathToFileURL(htmlPath).href,
    ];
    const child = spawn(browser, args, { windowsHide: true, stdio: "ignore" });
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error("Délai dépassé pendant la génération PDF."));
    }, 30000);

    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on("exit", () => {
      clearTimeout(timer);
      if (fs.existsSync(pdfPath) && fs.statSync(pdfPath).size > 0) {
        resolve({ browser, size: fs.statSync(pdfPath).size });
      } else {
        reject(new Error(`PDF non généré : ${rel(pdfPath)}`));
      }
    });
  });
}

async function renderPdf(htmlPath, pdfPath) {
  const playwrightResult = await renderPdfWithPlaywright(htmlPath, pdfPath);
  if (playwrightResult) return playwrightResult;
  return renderPdfWithBrowserCli(htmlPath, pdfPath);
}

function buildTracking(offer, compatibility, files, pdfStatus = { ok: true }) {
  const pdfReady = Boolean(pdfStatus.ok && fs.existsSync(files.cvPdf) && fs.existsSync(files.letterPdf));
  return {
    id_offre: offer.id_offre,
    date_detection: offer.date_detection,
    source: offer.source,
    entreprise: offer.entreprise,
    poste: offer.poste,
    lieu: offer.lieu,
    type_contrat: offer.type_contrat,
    lien_offre: offer.lien_offre,
    score_ia: compatibility.score_total,
    decision_ia: compatibility.decision,
    decision_humaine: "OUI",
    statut: pdfReady ? "candidature_prete_non_envoyee" : "documents_html_prets_pdf_a_generer",
    cv_pdf_path: pdfReady ? rel(files.cvPdf) : "",
    lettre_pdf_path: pdfReady ? rel(files.letterPdf) : "",
    message_path: rel(files.message),
    preuve_disponible: "non",
    preuve_type: "aucune preuve d'envoi",
    date_relance_prevue: "",
    commentaire: "Candidature préparée localement, non envoyée. Aucune preuve ni relance inventée.",
  };
}

function trackingCsv(row) {
  const columns = Object.keys(row);
  return `${columns.join(",")}\n${columns.map((column) => csvEscape(row[column])).join(",")}\n`;
}

function trackingMarkdown(row) {
  return `# Suivi FOREM - offre courante

- Offre : ${row.poste}
- Entreprise : ${row.entreprise || "non renseignée"}
- Score : ${row.score_ia}/100
- Décision IA : ${row.decision_ia}
- Décision humaine : ${row.decision_humaine}
- Statut : ${row.statut}
- Preuve d'envoi : non
- Relance : non planifiée

Documents :

- CV : \`${row.cv_pdf_path}\`
- Lettre : \`${row.lettre_pdf_path}\`
- Message : \`${row.message_path}\`

Aucune candidature n'a été envoyée.
`;
}

function createPackage(files, offer, tracking, packageDir) {
  fs.mkdirSync(packageDir, { recursive: true });
  const sources = [
    files.cvHtml,
    files.cvPdf,
    files.letterHtml,
    files.letterPdf,
    files.message,
    COMPATIBILITY_JSON,
    COMPATIBILITY_MD,
    PLAN_JSON,
    PLAN_MD,
    VALIDATION_JSON,
    files.trackingJson,
    files.trackingCsv,
    files.trackingMd,
    files.proofIndex,
  ];
  const included = [];
  for (const source of sources) {
    if (!fs.existsSync(source)) continue;
    const destination = path.join(packageDir, path.basename(source));
    fs.copyFileSync(source, destination);
    included.push(path.basename(destination));
  }

  writeText(
    path.join(packageDir, "README.md"),
    `# Package d'examen - offre courante

- Entreprise : ${offer.entreprise || "non renseignée"}
- Poste : ${offer.poste}
- Statut : ${tracking.statut}

## Fichiers inclus

${included.map((item) => `- ${item}`).join("\n")}

## Checklist

- Vérifier le CV PDF.
- Vérifier la lettre PDF.
- Vérifier le message.
- Vérifier le lien et la méthode de candidature.
- Confirmer séparément tout envoi réel.
- Ajouter une preuve réelle uniquement après un envoi réel.

Aucune candidature n'a été envoyée et aucune preuve d'envoi n'est disponible.
`,
  );
  return included;
}

async function generateApplication(confirmation, expectedOfferId = "") {
  if (String(confirmation || "").toUpperCase() !== "OUI") {
    throw new Error("Génération annulée : confirmation humaine OUI requise.");
  }
  if (!fs.existsSync(CURRENT_OFFER_PATH) || !fs.existsSync(COMPATIBILITY_JSON)) {
    throw new Error("Analyse requise avant la génération.");
  }

  const profile = readJson(PROFILE_PATH);
  const answers = readJson(ANSWERS_PATH);
  const offer = readJson(CURRENT_OFFER_PATH);
  if (expectedOfferId && safeId(offer.id_offre) !== safeId(expectedOfferId)) {
    throw new Error("L'offre préparée ne correspond pas à l'identifiant demandé.");
  }
  const compatibility = readJson(COMPATIBILITY_JSON);
  const id = safeId(offer.id_offre);
  const cvHtmlDir = path.join(ROOT, "generated", "cv-html");
  const letterHtmlDir = path.join(ROOT, "generated", "lettre-html");
  const pdfDir = path.join(ROOT, "generated", "pdf");
  const messagesDir = path.join(ROOT, "generated", "messages");
  const trackingDir = path.join(ROOT, "tracking");
  const proofDir = path.join(ROOT, "proofs", id);
  const packageDir = path.join(ROOT, "review-packages", id);
  const plan = buildPlan(profile, offer, compatibility, answers);
  const validation = {
    id_offre: offer.id_offre,
    decision_humaine: "OUI",
    statut_validation: "valide_pour_generation",
    prochaine_action: "generer_cv_et_message",
    date_validation: new Date().toISOString(),
    source: "JobHunter Studio local",
  };

  writeJson(PLAN_JSON, plan);
  writeText(PLAN_MD, renderPlanMarkdown(plan, offer));
  writeJson(VALIDATION_JSON, validation);

  const files = {
    cvHtml: path.join(cvHtmlDir, `cv-${id}.html`),
    cvPdf: path.join(pdfDir, `cv-${id}.pdf`),
    letterHtml: path.join(letterHtmlDir, `lettre-${id}.html`),
    letterPdf: path.join(pdfDir, `lettre-${id}.pdf`),
    message: path.join(messagesDir, `message-${id}.txt`),
    trackingJson: path.join(trackingDir, `forem-suivi-${id}.json`),
    trackingCsv: path.join(trackingDir, `forem-suivi-${id}.csv`),
    trackingMd: path.join(trackingDir, `forem-suivi-${id}.md`),
    proofIndex: path.join(proofDir, "proof-index.json"),
  };

  const cvTemplate = fs.readFileSync(CV_TEMPLATE_PATH, "utf8");
  const letterTemplate = fs.readFileSync(LETTER_TEMPLATE_PATH, "utf8");
  writeText(files.cvHtml, generateCvHtml(cvTemplate, plan));
  writeText(files.letterHtml, generateLetterHtml(letterTemplate, offer, plan));
  writeText(files.message, `${plan.message_candidature_court}\n`);

  const pdfResults = [];
  const pdfErrors = [];
  try {
    pdfResults.push(await renderPdf(files.cvHtml, files.cvPdf));
  } catch (error) {
    pdfErrors.push(`CV PDF: ${error.message}`);
  }
  try {
    pdfResults.push(await renderPdf(files.letterHtml, files.letterPdf));
  } catch (error) {
    pdfErrors.push(`Lettre PDF: ${error.message}`);
  }
  const pdfStatus = {
    ok: pdfErrors.length === 0,
    errors: pdfErrors,
  };

  writeJson(files.proofIndex, {
    id_offre: offer.id_offre,
    entreprise: offer.entreprise,
    poste: offer.poste,
    statut_candidature: "candidature_prete_non_envoyee",
    preuves: [],
    preuve_envoi_disponible: false,
    commentaire: "Aucune preuve d'envoi disponible tant que la candidature n'a pas été réellement envoyée.",
  });

  const tracking = buildTracking(offer, compatibility, files, pdfStatus);
  writeJson(files.trackingJson, tracking);
  writeText(files.trackingCsv, trackingCsv(tracking));
  writeText(files.trackingMd, trackingMarkdown(tracking));
  const included = createPackage(files, offer, tracking, packageDir);

  return {
    status: tracking.statut,
    validation,
    pdf_tool: pdfResults[0] ? path.basename(pdfResults[0].browser || "navigateur local") : "PDF non genere sur cet environnement",
    pdf_status: pdfStatus,
    files: {
      cv_html: rel(files.cvHtml),
      cv_pdf: fs.existsSync(files.cvPdf) ? rel(files.cvPdf) : "",
      lettre_html: rel(files.letterHtml),
      lettre_pdf: fs.existsSync(files.letterPdf) ? rel(files.letterPdf) : "",
      message: rel(files.message),
      tracking: rel(files.trackingMd),
      tracking_csv: rel(files.trackingCsv),
      package: rel(packageDir),
    },
    package_files: included,
  };
}

module.exports = {
  ROOT,
  analyzeOffer,
  buildCompatibility,
  normalizeOffer,
  renderCompatibilityMarkdown,
  safeId,
  generateApplication,
};
