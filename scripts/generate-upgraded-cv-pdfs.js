const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");
const { pathToFileURL } = require("url");

const ROOT = path.resolve(__dirname, "..");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const JOBS = [
  {
    name: "CV visuel",
    html: path.join(ROOT, "cv-upgrade", "visual", "cv-hassan-visual-upgraded.html"),
    pdf: path.join(ROOT, "cv-upgrade", "visual", "cv-hassan-visual-upgraded.pdf")
  },
  {
    name: "CV ATS",
    html: path.join(ROOT, "cv-upgrade", "ats", "cv-hassan-ats.html"),
    pdf: path.join(ROOT, "cv-upgrade", "ats", "cv-hassan-ats.pdf")
  }
];

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
      // Wait for DevTools.
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
      const id = nextId;
      nextId += 1;
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
  const profileRoot = path.join(os.tmpdir(), "jobhunter-cv-upgrade-pdf-profiles");
  fs.mkdirSync(profileRoot, { recursive: true });
  const userDataDir = fs.mkdtempSync(path.join(profileRoot, "profile-"));
  const targetUrl = pathToFileURL(htmlPath).href;

  await new Promise((resolve, reject) => {
    const child = spawn(browserPath, [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-extensions",
      "--allow-file-access-from-files",
      `--user-data-dir=${userDataDir}`,
      `--print-to-pdf=${pdfPath}`,
      "--print-to-pdf-no-header",
      targetUrl
    ], { windowsHide: true, stdio: "ignore" });

    child.on("error", reject);
    child.on("exit", (code) => {
      code === 0 ? resolve() : reject(new Error(`Chrome/Edge a quitté avec le code ${code}.`));
    });
  });

  await waitForFile(pdfPath, 15000);
  return fs.statSync(pdfPath).size;
}

function writeManualReport(errorMessage) {
  const reportPath = path.join(ROOT, "cv-upgrade", "pdf-generation-manual.md");
  const content = `# Génération PDF manuelle requise

La génération PDF automatique n'a pas pu être terminée.

Erreur :

\`\`\`text
${errorMessage}
\`\`\`

Méthode manuelle :

1. Ouvrir \`cv-upgrade/visual/cv-hassan-visual-upgraded.html\` dans le navigateur.
2. Utiliser Imprimer > Enregistrer au format PDF.
3. Choisir format A4, portrait, arrière-plans activés.
4. Enregistrer sous \`cv-upgrade/visual/cv-hassan-visual-upgraded.pdf\`.
5. Répéter avec \`cv-upgrade/ats/cv-hassan-ats.html\`.

Aucun service externe n'est nécessaire.
`;
  fs.writeFileSync(reportPath, content, "utf8");
  return reportPath;
}

(async () => {
  for (const job of JOBS) {
    if (!fs.existsSync(job.html)) {
      throw new Error(`HTML introuvable : ${path.relative(ROOT, job.html)}`);
    }
  }

  const browser = fs.existsSync(CHROME) ? CHROME : (fs.existsSync(EDGE) ? EDGE : "");
  if (!browser) {
    const report = writeManualReport("Chrome ou Edge local introuvable.");
    console.log(`PDF non générés automatiquement. Rapport : ${path.relative(ROOT, report)}`);
    return;
  }

  const results = [];
  for (const job of JOBS) {
    const size = await renderPdf(browser, job.html, job.pdf);
    results.push(`${job.name} : ${path.relative(ROOT, job.pdf)} (${size} octets)`);
  }

  const reportPath = path.join(ROOT, "cv-upgrade", "pdf-generation-report.md");
  fs.writeFileSync(reportPath, `# Rapport génération PDF CV Pro Upgrade

## Outil utilisé

- Navigateur local : \`${browser}\`
- Méthode : option native \`--print-to-pdf\` de Chrome/Edge via Node.js
- Format : A4 portrait
- Arrière-plans imprimés : oui
- Services externes : aucun

## PDF générés

${results.map((line) => `- ${line}`).join("\n")}

## Vérification manuelle recommandée

- Ouvrir les deux PDF.
- Vérifier que le texte n'est pas coupé.
- Vérifier que la version visuelle reste lisible.
- Vérifier que la version ATS reste sobre en noir et blanc.
- Compléter les liens, stacks et dates avant usage réel.
`, "utf8");

  console.log("PDF CV Pro Upgrade générés.");
  for (const line of results) console.log(line);
  console.log(`Rapport : ${path.relative(ROOT, reportPath)}`);
})().catch((error) => {
  const report = writeManualReport(error.message);
  console.error(error.message);
  console.error(`Rapport manuel : ${path.relative(ROOT, report)}`);
  process.exit(1);
});
