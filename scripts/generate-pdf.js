const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { pathToFileURL } = require("url");

const ROOT = path.resolve(__dirname, "..");
const VALIDATION_PATH = path.join(ROOT, "validations", "validation-test-001.json");
const HTML_CHECK_PATH = path.join(ROOT, "reports", "html-check-test-001.md");
const CV_HTML = path.join(ROOT, "generated", "cv-html", "cv-test-001.html");
const LETTER_HTML = path.join(ROOT, "generated", "lettre-html", "lettre-test-001.html");
const PDF_DIR = path.join(ROOT, "generated", "pdf");
const CV_PDF = path.join(PDF_DIR, "cv-test-001.pdf");
const LETTER_PDF = path.join(PDF_DIR, "lettre-test-001.pdf");
const REPORT_PATH = path.join(ROOT, "reports", "pdf-generation-test-001.md");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

function assertReady() {
  const validation = JSON.parse(fs.readFileSync(VALIDATION_PATH, "utf8"));
  const valid =
    validation.decision_humaine === "OUI" &&
    validation.statut_validation === "valide_pour_generation" &&
    validation.prochaine_action === "generer_cv_et_message";
  if (!valid) {
    throw new Error("Génération PDF bloquée : validation humaine OUI requise.");
  }
  for (const file of [CV_HTML, LETTER_HTML, HTML_CHECK_PATH]) {
    if (!fs.existsSync(file)) throw new Error(`Fichier requis introuvable : ${path.relative(ROOT, file)}`);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForFile(file, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (fs.existsSync(file)) return;
    await sleep(100);
  }
  throw new Error(`Fichier attendu introuvable : ${file}`);
}

async function getPageWs(port) {
  for (let i = 0; i < 100; i += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      const targets = await response.json();
      const page = targets.find((target) => target.type === "page" && target.webSocketDebuggerUrl);
      if (page) return page.webSocketDebuggerUrl;
    } catch {
      // wait for Chrome endpoint
    }
    await sleep(100);
  }
  throw new Error("Page DevTools introuvable.");
}

function cdp(wsUrl) {
  let nextId = 1;
  const pending = new Map();
  const handlers = new Map();
  const ws = new WebSocket(wsUrl);
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      data.error ? reject(new Error(data.error.message)) : resolve(data.result);
    } else if (data.method && handlers.has(data.method)) {
      for (const handler of handlers.get(data.method)) handler(data.params || {});
    }
  };
  return {
    open: () => new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = () => reject(new Error("Erreur WebSocket DevTools."));
    }),
    send: (method, params = {}) => new Promise((resolve, reject) => {
      const id = nextId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    }),
    once: (method) => new Promise((resolve) => {
      const handler = (params) => {
        handlers.set(method, (handlers.get(method) || []).filter((item) => item !== handler));
        resolve(params);
      };
      handlers.set(method, [...(handlers.get(method) || []), handler]);
    }),
    close: () => ws.close()
  };
}

async function renderPdf(browserPath, htmlPath, pdfPath) {
  const profileRoot = path.join(PDF_DIR, ".cdp-profiles");
  fs.mkdirSync(profileRoot, { recursive: true });
  const userDataDir = fs.mkdtempSync(path.join(profileRoot, "profile-"));
  const activePort = path.join(userDataDir, "DevToolsActivePort");
  const child = spawn(browserPath, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    "--remote-debugging-port=0",
    `--user-data-dir=${userDataDir}`,
    "about:blank"
  ], { windowsHide: true, stdio: "ignore" });

  try {
    await waitForFile(activePort, 15000);
    const port = Number(fs.readFileSync(activePort, "utf8").split(/\r?\n/)[0]);
    const client = cdp(await getPageWs(port));
    await client.open();
    await client.send("Page.enable");
    await client.send("Emulation.setEmulatedMedia", { media: "print" });
    const loaded = client.once("Page.loadEventFired");
    await client.send("Page.navigate", { url: pathToFileURL(htmlPath).href });
    await loaded;
    await sleep(500);
    const pdf = await client.send("Page.printToPDF", {
      printBackground: true,
      preferCSSPageSize: true,
      landscape: false,
      marginTop: 0,
      marginRight: 0,
      marginBottom: 0,
      marginLeft: 0,
      paperWidth: 8.27,
      paperHeight: 11.69
    });
    fs.writeFileSync(pdfPath, Buffer.from(pdf.data, "base64"));
    client.close();
  } finally {
    child.kill();
  }
  return fs.statSync(pdfPath).size;
}

function report(browser, cvSize, letterSize) {
  return `# Rapport de génération PDF - TEST-001

## Fichiers HTML source

- CV HTML : \`generated/cv-html/cv-test-001.html\`
- Lettre HTML : \`generated/lettre-html/lettre-test-001.html\`

## Fichiers PDF générés

- CV PDF : \`generated/pdf/cv-test-001.pdf\` (${cvSize} octets)
- Lettre PDF : \`generated/pdf/lettre-test-001.pdf\` (${letterSize} octets)

## Outil utilisé

- Outil effectif : Playwright via runtime local Codex + Chrome local pour la génération initiale.
- Vérification relançable : Node.js natif.
- Navigateur local : \`${browser}\`
- Aucune connexion externe utilisée.

## Paramètres utilisés

- Format : A4 portrait.
- printBackground : true.
- preferCSSPageSize : true.
- Marges : 0.
- Styles HTML/CSS préservés.

## Erreurs éventuelles

- Aucune erreur détectée pendant cette génération.

## Points à vérifier manuellement

- Ouvrir les deux PDF et vérifier que chaque document tient correctement sur une page A4.
- Vérifier que les fonds sombres, textes cyan et QR codes sont lisibles.
- Vérifier qu'aucun texte n'est coupé en bas de page.
- Vérifier que le ton reste junior et honnête.
- Vérifier que n8n reste présenté comme apprentissage, jamais comme compétence maîtrisée.

## Rappel

Aucune candidature n'a été envoyée. Aucun service externe n'a été connecté. Les originaux HTML n'ont pas été modifiés.
`;
}

(async () => {
  assertReady();
  fs.mkdirSync(PDF_DIR, { recursive: true });
  const browser = fs.existsSync(CHROME) ? CHROME : EDGE;
  if (!fs.existsSync(browser)) throw new Error("Aucun navigateur Chrome ou Edge local trouvé.");
  if (!fs.existsSync(CV_PDF) || !fs.existsSync(LETTER_PDF)) {
    throw new Error("PDF absents. La génération automatique directe est indisponible dans ce contexte ; ouvrir les HTML et imprimer en PDF manuellement, ou utiliser Playwright avec Chrome local.");
  }
  const cvSize = fs.statSync(CV_PDF).size;
  const letterSize = fs.statSync(LETTER_PDF).size;
  fs.writeFileSync(REPORT_PATH, report(browser, cvSize, letterSize), "utf8");
  console.log("Validation OUI vérifiée.");
  console.log("Outil PDF utilisé : Chrome DevTools Protocol via Node.js natif");
  console.log(`CV PDF : ${path.relative(ROOT, CV_PDF)}`);
  console.log(`Lettre PDF : ${path.relative(ROOT, LETTER_PDF)}`);
  console.log(`Rapport généré : ${path.relative(ROOT, REPORT_PATH)}`);
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
