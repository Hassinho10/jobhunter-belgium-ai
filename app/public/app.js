const form = document.querySelector("#offer-form");
const analyzeButton = document.querySelector("#analyze-button");
const generateButton = document.querySelector("#generate-button");
const fillExampleButton = document.querySelector("#fill-example");
const activity = document.querySelector("#activity");
const scoreValue = document.querySelector("#score-value");
const decisionValue = document.querySelector("#decision-value");
const recommendationValue = document.querySelector("#recommendation-value");
const statusValue = document.querySelector("#current-status");
const strengthsList = document.querySelector("#strengths-list");
const weaknessesList = document.querySelector("#weaknesses-list");
const fileLinks = document.querySelector("#file-links");
const confirmDialog = document.querySelector("#confirm-dialog");
const confirmYes = document.querySelector("#confirm-yes");
const confirmNo = document.querySelector("#confirm-no");
const searchJobsButton = document.querySelector("#search-jobs-button");
const searchSummary = document.querySelector("#search-summary");
const jobsResults = document.querySelector("#jobs-results");
const jobsList = document.querySelector("#jobs-list");

let analysisReady = false;
let selectedOfferId = "";

const example = {
  entreprise: "DigitAdmin Wallonie ASBL",
  poste: "Stagiaire Assistant Digital & Automatisation",
  lieu: "Charleroi, Belgique",
  source: "Offre test fictive",
  type_contrat: "Stage conventionné",
  lien_offre: "",
  description:
    "Nous recherchons un profil junior ou stagiaire pour aider à structurer des tableaux de suivi, documenter des procédures et tester de petites automatisations. Des bases en HTML, CSS, JavaScript et SQL sont appréciées. Le poste demande rigueur, traçabilité, communication en français et travail en équipe. Google Sheets, Google Forms, Notion et n8n peuvent être utilisés. Une expérience préalable n'est pas obligatoire et l'apprentissage est accompagné.",
};

function setActivity(message, isError = false) {
  activity.textContent = message;
  activity.style.color = isError ? "#a83c35" : "";
}

function setBusy(isBusy, message) {
  analyzeButton.disabled = isBusy;
  generateButton.disabled = isBusy || !analysisReady;
  fillExampleButton.disabled = isBusy;
  searchJobsButton.disabled = isBusy;
  if (message) setActivity(message);
}

function listInto(element, items, fallback) {
  element.replaceChildren();
  const values = items?.length ? items : [fallback];
  values.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    element.appendChild(li);
  });
}

function renderAnalysis(report) {
  scoreValue.textContent = report.score_total;
  decisionValue.textContent = report.decision;
  recommendationValue.textContent = `Recommandation : ${report.recommandation_humaine}`;
  statusValue.textContent = "Analyse terminée";
  listInto(strengthsList, report.points_forts, "Aucun point fort détecté automatiquement.");
  listInto(weaknessesList, report.points_faibles, "Aucun point faible détecté automatiquement.");
  fileLinks.innerHTML = `
    <a href="/files/reports/current-compatibility.json" target="_blank" rel="noreferrer">Rapport JSON</a>
    <a href="/files/reports/current-compatibility.md" target="_blank" rel="noreferrer">Rapport Markdown</a>
  `;
}

function renderFiles(files) {
  const labels = {
    cv_html: "CV HTML",
    cv_pdf: "CV PDF",
    lettre_html: "Lettre HTML",
    lettre_pdf: "Lettre PDF",
    message: "Message",
    tracking: "Suivi FOREM",
    tracking_csv: "Suivi CSV",
    package: "Package d’examen",
  };
  fileLinks.replaceChildren();
  Object.entries(files).forEach(([key, filePath]) => {
    if (!filePath) return;
    const link = document.createElement("a");
    link.href = `/files/${filePath}`;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = labels[key] || key;
    fileLinks.appendChild(link);
  });
  if (!files.cv_pdf || !files.lettre_pdf) {
    const note = document.createElement("span");
    note.textContent = "PDF non disponible sur cet environnement : ouvrir les HTML ou régénérer localement avec Chrome/Edge.";
    fileLinks.appendChild(note);
  }
}

async function api(url, options) {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erreur locale.");
  return data;
}

function fillOfferForm(offer) {
  const fields = ["entreprise", "poste", "lieu", "source", "type_contrat", "lien_offre", "description"];
  fields.forEach((key) => {
    const field = form.elements.namedItem(key);
    if (field) field.value = offer[key] || "";
  });
}

function renderJobs(result) {
  jobsList.replaceChildren();
  const jobs = result.all_scored || [];
  jobsResults.hidden = false;
  searchSummary.textContent =
    `${result.total_found} trouvée(s), ${result.total_scored} scorée(s), ` +
    `${result.jobs_ranked.length} au-dessus de ${result.score_minimum}/100`;

  if (!jobs.length) {
    const empty = document.createElement("p");
    empty.textContent = "Aucune offre trouvée avec les critères actuels.";
    jobsList.appendChild(empty);
    return;
  }

  jobs.forEach((job) => {
    const card = document.createElement("article");
    card.className = "job-card";

    const top = document.createElement("div");
    top.className = "job-card-top";
    const score = document.createElement("span");
    score.className = "job-score";
    score.textContent = `${job.score_total}/100`;
    const source = document.createElement("span");
    source.className = "job-source";
    source.textContent = `${job.source} • ${job.id_offre}`;
    top.append(score, source);

    const title = document.createElement("h3");
    title.textContent = job.poste || "Poste à vérifier";
    const meta = document.createElement("p");
    meta.className = "job-meta";
    meta.textContent = `${job.entreprise || "Entreprise à vérifier"} • ${job.lieu || "Lieu à vérifier"}`;
    const summary = document.createElement("p");
    summary.className = "job-summary";
    summary.textContent = job.description || "Description détaillée à vérifier sur l’offre officielle.";

    const actions = document.createElement("div");
    actions.className = "job-card-actions";
    const prepare = document.createElement("button");
    prepare.type = "button";
    prepare.className = "button button-secondary";
    prepare.textContent = "Préparer candidature";
    prepare.addEventListener("click", () => prepareJob(job.id_offre));
    actions.appendChild(prepare);
    if (job.score_total < result.score_minimum) {
      const low = document.createElement("span");
      low.className = "below-threshold";
      low.textContent = "Sous le seuil : prudence";
      actions.appendChild(low);
    }

    if (job.lien_offre) {
      const link = document.createElement("a");
      link.href = job.lien_offre;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.textContent = "Voir l’offre";
      actions.appendChild(link);
    }

    card.append(top, title, meta, summary, actions);
    jobsList.appendChild(card);
  });
}

async function prepareJob(idOffre) {
  setBusy(true, "Préparation de l’offre sélectionnée...");
  try {
    const data = await api(`/api/jobs/${encodeURIComponent(idOffre)}/prepare`, {
      method: "POST",
      body: "{}",
    });
    fillOfferForm(data.offer);
    selectedOfferId = idOffre;
    analysisReady = true;
    renderAnalysis(data.report);
    setActivity("Plan préparé, validation humaine requise");
    confirmDialog.showModal();
  } catch (error) {
    setActivity(error.message, true);
  } finally {
    setBusy(false);
  }
}

searchJobsButton.addEventListener("click", async () => {
  setBusy(true, "Recherche FOREM en cours...");
  searchSummary.textContent = "Recherche et scoring en cours...";
  try {
    const data = await api("/api/jobs/search", {
      method: "POST",
      body: "{}",
    });
    renderJobs(data.result);
    setActivity("Recherche automatique terminée");
  } catch (error) {
    searchSummary.textContent = error.message;
    setActivity(error.message, true);
  } finally {
    setBusy(false);
  }
});

fillExampleButton.addEventListener("click", () => {
  selectedOfferId = "";
  Object.entries(example).forEach(([key, value]) => {
    const field = form.elements.namedItem(key);
    if (field) field.value = value;
  });
  setActivity("Exemple chargé");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setBusy(true, "Analyse en cours...");
  try {
    const payload = Object.fromEntries(new FormData(form).entries());
    const data = await api("/api/analyze", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    analysisReady = true;
    selectedOfferId = "";
    renderAnalysis(data.report);
    setActivity("Analyse locale terminée");
  } catch (error) {
    analysisReady = false;
    statusValue.textContent = "Erreur";
    setActivity(error.message, true);
  } finally {
    setBusy(false);
  }
});

generateButton.addEventListener("click", () => {
  if (!analysisReady) return;
  confirmDialog.showModal();
});

confirmNo.addEventListener("click", () => {
  setActivity("Génération annulée : décision NON");
});

confirmYes.addEventListener("click", async () => {
  setBusy(true, "Génération des documents...");
  statusValue.textContent = "Génération en cours";
  try {
    const endpoint = selectedOfferId
      ? `/api/jobs/${encodeURIComponent(selectedOfferId)}/generate`
      : "/api/generate";
    const data = await api(endpoint, {
      method: "POST",
      body: JSON.stringify({ confirmation: "OUI" }),
    });
    renderFiles(data.result.files);
    statusValue.textContent = "Candidature prête non envoyée";
    setActivity("Package local généré");
  } catch (error) {
    statusValue.textContent = "Génération bloquée";
    setActivity(error.message, true);
  } finally {
    setBusy(false);
  }
});
