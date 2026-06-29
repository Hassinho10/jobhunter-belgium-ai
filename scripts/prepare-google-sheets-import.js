const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

const paths = {
  offer: path.join(root, "test-data", "offre-test.json"),
  compatibility: path.join(root, "reports", "compatibility-test-001.json"),
  validation: path.join(root, "validations", "validation-test-001.json"),
  trackingCsv: path.join(root, "tracking", "forem-suivi-test-001.csv"),
  proofIndex: path.join(root, "proofs", "TEST-001", "proof-index.json"),
  answers: path.join(root, "validations", "hassan-answers-test-001.json"),
  outputDir: path.join(root, "google-sheets-import"),
  reportsDir: path.join(root, "reports"),
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function ensureFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Fichier introuvable : ${path.relative(root, filePath)}`);
  }
}

function csvEscape(value) {
  const text = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function toCsv(headers, rows) {
  const lines = [headers.map(csvEscape).join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => csvEscape(row[header])).join(","));
  }
  return `${lines.join("\n")}\n`;
}

function writeCsv(fileName, headers, rows) {
  const filePath = path.join(paths.outputDir, fileName);
  fs.writeFileSync(filePath, toCsv(headers, rows), "utf8");
  return filePath;
}

function writeText(filePath, content) {
  fs.writeFileSync(filePath, content, "utf8");
  return filePath;
}

function relative(filePath) {
  return path.relative(root, filePath).replace(/\\/g, "/");
}

function main() {
  [
    paths.offer,
    paths.compatibility,
    paths.validation,
    paths.trackingCsv,
    paths.proofIndex,
    paths.answers,
  ].forEach(ensureFile);

  fs.mkdirSync(paths.outputDir, { recursive: true });
  fs.mkdirSync(paths.reportsDir, { recursive: true });

  const offer = readJson(paths.offer);
  const compatibility = readJson(paths.compatibility);
  const validation = readJson(paths.validation);
  const proofIndex = readJson(paths.proofIndex);
  const answers = readJson(paths.answers);

  const status =
    validation.decision_humaine === "OUI" &&
    validation.statut_validation === "valide_pour_generation"
      ? "candidature_prete_non_envoyee"
      : validation.decision_humaine === "NON"
        ? "offre_refusee"
        : "modification_requise";

  const hasSendingProof =
    proofIndex.preuve_envoi_disponible === true ||
    (Array.isArray(proofIndex.preuves) && proofIndex.preuves.length > 0);

  const generatedFiles = [];

  generatedFiles.push(
    writeCsv(
      "01_dashboard.csv",
      ["indicateur", "valeur"],
      [
        { indicateur: "offres_detectees", valeur: 1 },
        { indicateur: "offres_interessantes", valeur: 1 },
        { indicateur: "candidatures_preparees", valeur: 1 },
        { indicateur: "candidatures_envoyees", valeur: 0 },
        { indicateur: "preuves_envoi_disponibles", valeur: hasSendingProof ? 1 : 0 },
        { indicateur: "relances_prevues", valeur: 0 },
        { indicateur: "entretiens", valeur: 0 },
        { indicateur: "statut_global", valeur: "prototype local prêt" },
      ],
    ),
  );

  generatedFiles.push(
    writeCsv(
      "02_offres_detectees.csv",
      [
        "id_offre",
        "date_detection",
        "source",
        "entreprise",
        "poste",
        "lieu",
        "type_contrat",
        "lien_offre",
        "score_ia",
        "decision_ia",
        "decision_humaine",
        "statut",
        "commentaire",
      ],
      [
        {
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
          decision_humaine: validation.decision_humaine,
          statut: status,
          commentaire: "Offre test fictive, candidature préparée localement mais non envoyée.",
        },
      ],
    ),
  );

  generatedFiles.push(
    writeCsv(
      "03_candidatures.csv",
      [
        "id_candidature",
        "date_candidature",
        "entreprise",
        "poste",
        "source",
        "lien_offre",
        "mode_candidature",
        "email_contact",
        "cv_utilise",
        "lettre_utilisee",
        "message_utilise",
        "statut",
        "preuve_disponible",
        "preuve_url",
        "date_relance",
        "reponse_recue",
        "commentaire",
      ],
      [
        {
          id_candidature: "CAND-TEST-001",
          date_candidature: "",
          entreprise: offer.entreprise,
          poste: offer.poste,
          source: offer.source,
          lien_offre: offer.lien_offre,
          mode_candidature: "",
          email_contact: "",
          cv_utilise: "generated/pdf/cv-test-001.pdf",
          lettre_utilisee: "generated/pdf/lettre-test-001.pdf",
          message_utilise: "generated/messages/message-test-001.txt",
          statut: "candidature_prete_non_envoyee",
          preuve_disponible: "non",
          preuve_url: "",
          date_relance: "",
          reponse_recue: "",
          commentaire: "Candidature préparée localement. Aucun envoi réel effectué.",
        },
      ],
    ),
  );

  generatedFiles.push(
    writeCsv(
      "04_preuves_forem.csv",
      [
        "id_preuve",
        "date",
        "action_realisee",
        "entreprise",
        "poste",
        "type_preuve",
        "fichier_preuve_url",
        "verifie",
        "commentaire",
      ],
      [
        {
          id_preuve: "PREUVE-TEST-001",
          date: "",
          action_realisee: "candidature préparée localement",
          entreprise: offer.entreprise,
          poste: offer.poste,
          type_preuve: "aucune preuve d’envoi",
          fichier_preuve_url: "",
          verifie: "non applicable",
          commentaire: "candidature non envoyée, aucune preuve inventée",
        },
      ],
    ),
  );

  generatedFiles.push(
    writeCsv(
      "05_relances.csv",
      [
        "id_relance",
        "entreprise",
        "poste",
        "date_candidature",
        "date_relance_prevue",
        "relance_envoyee",
        "message_relance_url",
        "reponse_recue",
        "statut",
        "commentaire",
      ],
      [],
    ),
  );

  generatedFiles.push(
    writeCsv(
      "06_historique_ia.csv",
      [
        "date_action",
        "id_offre",
        "action_ia",
        "modele_utilise",
        "score_ia",
        "resume_ia",
        "decision_ia",
        "validation_humaine",
        "commentaire",
      ],
      [
        {
          date_action: offer.date_detection,
          id_offre: offer.id_offre,
          action_ia: "scoring_offre_et_preparation_locale",
          modele_utilise: "moteur local sans IA externe",
          score_ia: compatibility.score_total,
          resume_ia: `Score local ${compatibility.score_total}/100 pour ${offer.poste}.`,
          decision_ia: compatibility.decision,
          validation_humaine: validation.decision_humaine,
          commentaire: "Analyse locale transparente, sans connexion externe.",
        },
      ],
    ),
  );

  generatedFiles.push(
    writeCsv(
      "07_parametres.csv",
      ["champ", "valeur"],
      [
        { champ: "nom", valeur: "Hassan" },
        { champ: "prenom", valeur: "Chajai" },
        { champ: "pays", valeur: "Belgique" },
        { champ: "type_recherche", valeur: "stage" },
        { champ: "sources_prioritaires", valeur: "FOREM; Actiris; VDAB; Jooble; Adzuna; Gmail" },
        { champ: "score_minimum", valeur: 75 },
        { champ: "validation_obligatoire", valeur: "oui" },
        { champ: "niveau_google_sheets", valeur: answers.google_sheets },
        { champ: "niveau_google_forms", valeur: answers.google_forms },
        { champ: "niveau_n8n", valeur: answers.n8n },
        { champ: "niveau_make", valeur: answers.make },
        { champ: "niveau_notion", valeur: answers.notion },
        { champ: "niveau_trello", valeur: answers.trello },
      ],
    ),
  );

  generatedFiles.push(
    writeText(
      path.join(paths.outputDir, "README.md"),
      `# Import Google Sheets FOREM\n\n` +
        `Ce dossier contient des CSV prêts à importer manuellement dans Google Sheets.\n\n` +
        `Nom recommandé du fichier Google Sheets : **Suivi JobHunter Belgium AI - FOREM**.\n\n` +
        `## Méthode d'import\n\n` +
        `1. Créer un nouveau fichier Google Sheets.\n` +
        `2. Importer chaque CSV de ce dossier.\n` +
        `3. Créer un onglet par CSV, en conservant l'ordre et les noms proposés.\n` +
        `4. Vérifier les accents et les séparateurs après import.\n\n` +
        `## Onglets proposés\n\n` +
        `- 01_dashboard\n` +
        `- 02_offres_detectees\n` +
        `- 03_candidatures\n` +
        `- 04_preuves_forem\n` +
        `- 05_relances\n` +
        `- 06_historique_ia\n` +
        `- 07_parametres\n\n` +
        `## Statut important\n\n` +
        `Aucune candidature n'a été envoyée. Aucune preuve d'envoi n'est disponible ou inventée. Le statut TEST-001 reste : candidature_prete_non_envoyee.\n`,
    ),
  );

  const reportPath = path.join(paths.reportsDir, "google-sheets-import-test-001.md");
  generatedFiles.push(
    writeText(
      reportPath,
      `# Rapport import Google Sheets - TEST-001\n\n` +
        `## Sources vérifiées\n\n` +
        `- test-data/offre-test.json\n` +
        `- reports/compatibility-test-001.json\n` +
        `- validations/validation-test-001.json\n` +
        `- tracking/forem-suivi-test-001.csv\n` +
        `- proofs/TEST-001/proof-index.json\n` +
        `- validations/hassan-answers-test-001.json\n\n` +
        `## Fichiers créés\n\n` +
        generatedFiles.map((filePath) => `- ${relative(filePath)}`).join("\n") +
        `\n\n## Statuts importants\n\n` +
        `- Statut candidature : ${status}\n` +
        `- Décision humaine : ${validation.decision_humaine}\n` +
        `- Score IA local : ${compatibility.score_total}\n` +
        `- Preuve d'envoi disponible : ${hasSendingProof ? "oui" : "non"}\n` +
        `- Relance prévue : non\n\n` +
        `## Limites\n\n` +
        `Ces CSV sont préparés pour un import manuel. Aucun compte Google Sheets, Gmail, Drive, n8n ou OpenAI n'a été connecté.\n\n` +
        `Aucune candidature n'a été envoyée et aucune preuve fictive n'a été créée.\n`,
    ),
  );

  console.log("CSV Google Sheets prêts pour import manuel.");
  console.log(`Dossier : ${relative(paths.outputDir)}`);
  console.log(`Statut : ${status}`);
  console.log(`Preuve d'envoi disponible : ${hasSendingProof ? "oui" : "non"}`);
}

main();
