const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const CV_TEMPLATE_PATH = path.join(ROOT, "cv-template", "index.html");
const CSS_TEMPLATE_PATH = path.join(ROOT, "cv-template", "style.css");
const PROFILE_PATH = path.join(ROOT, "cv-template", "profile-data.json");
const PLAN_PATH = path.join(ROOT, "reports", "adaptation-plan-test-001.json");
const VALIDATION_PATH = path.join(ROOT, "validations", "validation-test-001.json");
const CLARIFICATIONS_PATH = path.join(ROOT, "validations", "clarifications-test-001.md");
const RULES_PATH = path.join(ROOT, "docs", "regles-adaptation-cv.md");
const OUTPUT_DIR = path.join(ROOT, "generated", "cv-html");
const OUTPUT_HTML = path.join(OUTPUT_DIR, "cv-test-001.html");
const OUTPUT_CSS = path.join(OUTPUT_DIR, "style-test-001.css");
const REPORT_PATH = path.join(ROOT, "reports", "cv-generation-test-001.md");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function requireHumanValidation(validation) {
  const ok =
    validation.decision_humaine === "OUI" &&
    validation.statut_validation === "valide_pour_generation" &&
    validation.prochaine_action === "generer_cv_et_message";

  if (!ok) {
    throw new Error(
      "Génération bloquée : validation humaine OUI requise avec statut valide_pour_generation et prochaine_action generer_cv_et_message."
    );
  }
}

function replaceOnce(html, pattern, replacement, applied, missing, label) {
  if (!pattern.test(html)) {
    missing.push(label);
    return html;
  }
  applied.push(label);
  return html.replace(pattern, replacement);
}

function insertBefore(html, marker, insertion, applied, missing, label) {
  if (!html.includes(marker)) {
    missing.push(label);
    return html;
  }
  applied.push(label);
  return html.replace(marker, `${insertion}\n                        ${marker}`);
}

function buildAdaptedHtml(sourceHtml, plan) {
  const applied = [];
  const missing = [];

  let html = sourceHtml;

  const adaptedProfile =
    "Développeur web fullstack en reconversion, actuellement en formation intensive à Technofutur TIC (Gosselies). Profil junior/stagiaire positionné assistant digital & automatisation junior, avec bases en HTML, CSS, JavaScript et SQL. Mon parcours en Sciences Biomédicales et mon expérience en environnement pharmaceutique GMP m'ont apporté rigueur, traçabilité et méthode de travail. Je m'intéresse aux outils numériques, à la structuration de données et à l'automatisation, avec n8n en cours d'apprentissage et un projet personnel JobHunter Belgium AI de suivi de candidatures. Objectif : contribuer à des outils utiles, apprendre rapidement et rester honnête sur mon niveau.";

  html = replaceOnce(
    html,
    /<h2 class="job-title">[\s\S]*?<\/h2>/,
    `<h2 class="job-title">${plan.titre_cv_recommande}</h2>`,
    applied,
    missing,
    "titre professionnel adapté"
  );

  html = replaceOnce(
    html,
    /<p class="tagline">[\s\S]*?<\/p>/,
    '<p class="tagline">Profil junior en reconversion × Rigueur GMP × Outils numériques × Automatisation en apprentissage.</p>',
    applied,
    missing,
    "accroche adaptée"
  );

  html = replaceOnce(
    html,
    /<p class="profile-text">[\s\S]*?<\/p>/,
    `<p class="profile-text">${adaptedProfile}</p>`,
    applied,
    missing,
    "résumé professionnel adapté"
  );

  html = insertBefore(
    html,
    '<div><div class="skill-category-title">SAVOIR-ÊTRE</div>',
    '<div><div class="skill-category-title">OUTILS NUMÉRIQUES</div><div class="skill-capsules"><div class="skill-capsule">Google Sheets (débutant)</div><div class="skill-capsule">Google Forms (débutant)</div><div class="skill-capsule">Notion (débutant)</div><div class="skill-capsule">n8n (apprentissage)</div></div></div>',
    applied,
    missing,
    "bloc outils numériques niveau junior"
  );

  html = insertBefore(
    html,
    '<div class="project-block"><h4 class="project-title">BarberConnect</h4>',
    '<div class="project-block"><h4 class="project-title">JobHunter Belgium AI</h4><p class="project-description">Projet personnel en cours : structuration d’un assistant local de suivi de candidatures, scoring d’offres, validation humaine et préparation contrôlée de messages. Mentionné comme apprentissage et projet personnel, pas comme expérience client.</p></div><div class="project-divider"></div>',
    applied,
    missing,
    "projet personnel JobHunter Belgium AI"
  );

  html = replaceOnce(
    html,
    /<div class="project-block"><h4 class="project-title">RestoOrder<\/h4><p class="project-description">[\s\S]*?<\/p><\/div>/,
    '<div class="project-block"><h4 class="project-title">RestoOrder</h4><p class="project-description">App de commande en ligne : menu dynamique, panier, suivi temps réel, base SQL structurée. Projet mis en avant pour la logique de données et l’organisation d’informations.</p></div>',
    applied,
    missing,
    "mise en avant RestoOrder SQL / données"
  );

  html = replaceOnce(
    html,
    /<div class="edu-exp-item"><h4 class="edu-exp-title">Opérateur \/ Technicien Pharma<\/h4><p class="edu-exp-subtitle">[\s\S]*?<\/p><p class="project-description">[\s\S]*?<\/p><\/div>/,
    '<div class="edu-exp-item"><h4 class="edu-exp-title">Opérateur / Technicien Pharma</h4><p class="edu-exp-subtitle">Catalent / Novo Nordisk — Bruxelles | 2025</p><p class="project-description">Pharma GMP : rigueur, traçabilité, normes qualité, méthode de travail et travail en équipe critique.</p></div>',
    applied,
    missing,
    "mise en avant rigueur / traçabilité GMP"
  );

  html = html.replace(
    "</body>",
    `<!-- TODO: vérifier manuellement que le contenu tient toujours sur une page A4 avant export PDF. -->\n<!-- TODO: confirmer que n8n reste formulé comme apprentissage et non comme compétence maîtrisée. -->\n</body>`
  );
  applied.push("commentaires HTML de vérification manuelle");

  return { html, applied, missing };
}

function renderReport({ outputHtml, outputCss, applied, missing, validation, plan }) {
  const cssLine = outputCss
    ? `CSS copié : \`${path.relative(ROOT, outputCss)}\``
    : "CSS utilisé : styles intégrés dans le HTML original, aucun fichier CSS séparé nécessaire.";

  return [
    "# Rapport de génération CV HTML - TEST-001",
    "",
    "## Validation",
    "",
    `- decision_humaine : ${validation.decision_humaine}`,
    `- statut_validation : ${validation.statut_validation}`,
    `- prochaine_action : ${validation.prochaine_action}`,
    "",
    "## Fichier généré",
    "",
    `- CV HTML : \`${path.relative(ROOT, outputHtml)}\``,
    `- ${cssLine}`,
    "",
    "## Adaptations appliquées",
    "",
    ...applied.map((item) => `- ${item}`),
    "",
    "## Adaptations non appliquées automatiquement",
    "",
    ...(missing.length ? missing.map((item) => `- ${item}`) : ["- Aucune adaptation ciblée n'a échoué."]),
    "",
    "## Informations interdites évitées",
    "",
    "- Make n'est pas présenté comme compétence.",
    "- Trello n'est pas présenté comme compétence.",
    "- n8n est mentionné uniquement comme apprentissage.",
    "- Google Sheets, Google Forms et Notion restent au niveau débutant.",
    "- JobHunter Belgium AI est présenté comme projet personnel en cours, pas comme expérience professionnelle client.",
    "- Aucune expérience, diplôme, certification ou compétence non confirmée n'a été ajouté.",
    "",
    "## Points à vérifier manuellement",
    "",
    "- Vérifier que le CV tient toujours visuellement sur une page A4.",
    "- Vérifier que le positionnement assistant digital junior reste cohérent avec l'offre.",
    "- Vérifier que la mention JobHunter Belgium AI est pertinente pour cette offre.",
    "- Vérifier que la formulation ne survalorise pas l'automatisation.",
    "",
    "## Rappel",
    "",
    "Aucun PDF n'a été généré. Aucune candidature n'a été envoyée. Aucun service externe n'a été connecté.",
    "",
    `Titre recommandé utilisé : ${plan.titre_cv_recommande}`,
    ""
  ].join("\n");
}

function main() {
  const validation = readJson(VALIDATION_PATH);
  requireHumanValidation(validation);

  const plan = readJson(PLAN_PATH);
  readJson(PROFILE_PATH);
  fs.readFileSync(CLARIFICATIONS_PATH, "utf8");
  fs.readFileSync(RULES_PATH, "utf8");

  const sourceHtml = fs.readFileSync(CV_TEMPLATE_PATH, "utf8");
  const { html, applied, missing } = buildAdaptedHtml(sourceHtml, plan);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_HTML, html, "utf8");

  let copiedCssPath = null;
  if (sourceHtml.includes('href="style.css"') && fs.existsSync(CSS_TEMPLATE_PATH)) {
    fs.copyFileSync(CSS_TEMPLATE_PATH, OUTPUT_CSS);
    const adjusted = fs.readFileSync(OUTPUT_HTML, "utf8").replace('href="style.css"', 'href="style-test-001.css"');
    fs.writeFileSync(OUTPUT_HTML, adjusted, "utf8");
    copiedCssPath = OUTPUT_CSS;
    applied.push("copie du CSS séparé et ajustement du lien CSS");
  }

  fs.writeFileSync(
    REPORT_PATH,
    renderReport({ outputHtml: OUTPUT_HTML, outputCss: copiedCssPath, applied, missing, validation, plan }),
    "utf8"
  );

  console.log("Validation OUI vérifiée.");
  console.log(`CV HTML généré : ${path.relative(ROOT, OUTPUT_HTML)}`);
  console.log(`Rapport généré : ${path.relative(ROOT, REPORT_PATH)}`);
  if (copiedCssPath) console.log(`CSS copié : ${path.relative(ROOT, copiedCssPath)}`);
}

main();
