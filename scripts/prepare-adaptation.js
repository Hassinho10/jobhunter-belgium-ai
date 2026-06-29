const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PROFILE_PATH = path.join(ROOT, "cv-template", "profile-data.json");
const OFFER_PATH = path.join(ROOT, "test-data", "offre-test.json");
const COMPATIBILITY_PATH = path.join(ROOT, "reports", "compatibility-test-001.json");
const RULES_PATH = path.join(ROOT, "docs", "regles-adaptation-cv.md");
const REPORTS_DIR = path.join(ROOT, "reports");
const MESSAGES_DIR = path.join(ROOT, "generated", "messages");
const JSON_OUTPUT = path.join(REPORTS_DIR, "adaptation-plan-test-001.json");
const MD_OUTPUT = path.join(REPORTS_DIR, "adaptation-plan-test-001.md");
const MESSAGE_OUTPUT = path.join(MESSAGES_DIR, "message-test-001.txt");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function decisionFor(score) {
  if (score < 70) return "MODIFIER";
  return "MODIFIER";
}

function buildMessage(profile, offer) {
  const firstName = profile.identite?.prenom || "";
  const lastName = profile.identite?.nom || "";
  return [
    "Madame, Monsieur,",
    "",
    `Votre offre de ${offer.poste} a retenu mon attention, car elle combine outils numériques, structuration de données et amélioration de processus.`,
    "",
    "Actuellement en formation Développeur Web Apps Full Stack à Technofutur TIC, je travaille avec HTML, CSS, JavaScript et SQL. Mon parcours en sciences biomédicales et en environnement pharmaceutique GMP m'a aussi apporté rigueur, traçabilité et esprit d'équipe.",
    "",
    "Je développe actuellement un projet personnel d'automatisation et de suivi de candidatures, ce qui renforce mon intérêt pour les outils digitaux appliqués à des besoins concrets. Je reste toutefois dans une démarche junior/stage et souhaite apprendre au contact d'une équipe.",
    "",
    "Je serais ravi d'échanger avec vous afin de vérifier si mon profil peut répondre à vos besoins.",
    "",
    "Bien cordialement,",
    `${firstName} ${lastName}`.trim()
  ].join("\n");
}

function buildPlan(profile, offer, compatibility, rulesText) {
  if (!rulesText.includes("ne peut jamais inventer")) {
    throw new Error("Les règles d'adaptation ne semblent pas chargées correctement.");
  }

  const score = compatibility.score_total;
  const decisionPreparation = decisionFor(score);
  const message = buildMessage(profile, offer);

  const competencesMatches = compatibility.details_score?.competences?.matches || [];
  const outilsMatches = compatibility.details_score?.outils?.matches || [];

  return {
    id_offre: offer.id_offre,
    poste: offer.poste,
    entreprise: offer.entreprise,
    score_compatibilite: score,
    decision_preparation: decisionPreparation,
    titre_cv_recommande: "Stagiaire Assistant Digital & Automatisation",
    resume_recommande:
      "Développeur web fullstack en reconversion, actuellement en formation intensive à Technofutur TIC. Profil junior/stagiaire avec bases en HTML, CSS, JavaScript et SQL, rigueur issue d'un parcours en sciences biomédicales et expérience en environnement pharmaceutique GMP. Intérêt pour les outils numériques, la structuration de données et l'amélioration de processus, dans une démarche d'apprentissage encadrée.",
    competences_a_mettre_en_avant: unique([
      ...competencesMatches,
      ...outilsMatches,
      "bases web",
      "structuration de données",
      "rigueur",
      "travail en équipe",
      "communication en français"
    ]),
    experiences_projets_a_mettre_en_avant: [
      "RestoOrder : application de commande en ligne avec menu dynamique, panier, suivi temps réel et base SQL structurée.",
      "Life Manager : dashboard de productivité avec statistiques, suivi d'habitudes et indicateurs visuels.",
      "BarberConnect : application de gestion de rendez-vous avec calendrier dynamique, créneaux et interface client.",
      "Expérience pharma GMP : rigueur, traçabilité, normes qualité et travail en équipe critique.",
      "Expérience Horeca : relation client, adaptabilité, gestion du stress et travail en équipe."
    ],
    elements_a_ne_pas_surexposer: [
      "Ne pas présenter Hassan comme expert en automatisation.",
      "Ne pas prétendre maîtriser Make, n8n, Google Sheets, Google Forms, Notion ou Trello.",
      "Ne pas transformer le projet JobHunter Belgium AI en expérience professionnelle client.",
      "Ne pas présenter le poste comme un stage fullstack pur.",
      "Ne pas exagérer le support utilisateur, qui n'est pas explicitement documenté comme compétence principale."
    ],
    points_a_verifier_avec_hassan: [
      "Confirmer son niveau réel sur Google Sheets et Google Forms.",
      "Confirmer s'il a déjà testé Make, n8n, Notion ou Trello.",
      "Confirmer s'il accepte une mission hybride assistant digital / support administratif / automatisation.",
      "Confirmer la durée exacte du stage souhaitée et la compatibilité avec l'offre.",
      "Confirmer la disponibilité de début de stage.",
      "Confirmer s'il souhaite mentionner le projet personnel JobHunter Belgium AI dans le message."
    ],
    limites_adaptation: [
      "Le CV original ne doit pas être modifié à cette étape.",
      "La proposition ne génère pas de CV adapté ni de lettre adaptée.",
      "Les informations non présentes dans profile-data.json ne sont pas considérées comme acquises.",
      "Les outils no-code et bureautiques cités par l'offre restent à confirmer.",
      "Toute candidature reste bloquée tant qu'Hassan n'a pas validé explicitement."
    ],
    risques_survente: [
      "Survendre l'automatisation alors que le profil documente surtout le développement web et l'intérêt IA.",
      "Laisser croire à une maîtrise de n8n, Make ou Google Sheets non confirmée.",
      "Présenter un profil trop administratif alors que l'objectif principal reste le développement web fullstack.",
      "Utiliser des formulations trop affirmatives sur le support utilisateur."
    ],
    message_candidature_court: message,
    validation_humaine: {
      requise: true,
      choix_possibles: ["OUI", "NON", "MODIFIER"],
      statut: "en_attente"
    }
  };
}

function renderMarkdown(plan, offer) {
  return [
    `# Plan d'adaptation contrôlé - ${plan.id_offre}`,
    "",
    "## Résumé de l'offre",
    "",
    `- Poste : ${plan.poste}`,
    `- Entreprise : ${plan.entreprise}`,
    `- Lieu : ${offer.lieu}`,
    `- Type de contrat : ${offer.type_contrat}`,
    "",
    offer.description,
    "",
    "## Score de compatibilité",
    "",
    `Score : **${plan.score_compatibilite} / 100**`,
    "",
    `Décision proposée : **${plan.decision_preparation}**`,
    "",
    "## Titre CV recommandé",
    "",
    plan.titre_cv_recommande,
    "",
    "## Résumé recommandé",
    "",
    plan.resume_recommande,
    "",
    "## Compétences à mettre en avant",
    "",
    ...plan.competences_a_mettre_en_avant.map((item) => `- ${item}`),
    "",
    "## Projets et expériences à valoriser",
    "",
    ...plan.experiences_projets_a_mettre_en_avant.map((item) => `- ${item}`),
    "",
    "## Points à vérifier avec Hassan",
    "",
    ...plan.points_a_verifier_avec_hassan.map((item) => `- ${item}`),
    "",
    "## Limites de l'adaptation",
    "",
    ...plan.limites_adaptation.map((item) => `- ${item}`),
    "",
    "## Risques de survente",
    "",
    ...plan.risques_survente.map((item) => `- ${item}`),
    "",
    "## Message de candidature proposé",
    "",
    "```text",
    plan.message_candidature_court,
    "```",
    "",
    "## Question finale",
    "",
    "Souhaites-tu préparer une candidature pour cette offre ? Répondre : OUI / NON / MODIFIER.",
    "",
    "Rappel : aucune candidature ne doit être envoyée sans validation humaine explicite.",
    ""
  ].join("\n");
}

function main() {
  const profile = readJson(PROFILE_PATH);
  const offer = readJson(OFFER_PATH);
  const compatibility = readJson(COMPATIBILITY_PATH);
  const rulesText = fs.readFileSync(RULES_PATH, "utf8");
  const plan = buildPlan(profile, offer, compatibility, rulesText);

  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.mkdirSync(MESSAGES_DIR, { recursive: true });
  fs.writeFileSync(JSON_OUTPUT, `${JSON.stringify(plan, null, 2)}\n`, "utf8");
  fs.writeFileSync(MD_OUTPUT, renderMarkdown(plan, offer), "utf8");
  fs.writeFileSync(MESSAGE_OUTPUT, `${plan.message_candidature_court}\n`, "utf8");

  console.log(`Plan ${plan.id_offre}: ${plan.decision_preparation}`);
  console.log(`Score de compatibilité: ${plan.score_compatibilite}/100`);
  console.log("Fichiers générés:");
  console.log(`- ${path.relative(ROOT, JSON_OUTPUT)}`);
  console.log(`- ${path.relative(ROOT, MD_OUTPUT)}`);
  console.log(`- ${path.relative(ROOT, MESSAGE_OUTPUT)}`);
}

main();
