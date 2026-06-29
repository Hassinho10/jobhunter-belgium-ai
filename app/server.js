const http = require("http");
const fs = require("fs");
const path = require("path");
const { analyzeOffer, generateApplication, ROOT } = require("../scripts/studio-pipeline");
const { searchAndScoreJobs } = require("../scripts/search-and-score-jobs");

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT || 4173);
const PUBLIC_DIR = path.join(__dirname, "public");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".pdf": "application/pdf",
};

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(data));
}

function sendFile(response, filePath) {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    sendJson(response, 404, { error: "Fichier introuvable." });
    return;
  }
  response.writeHead(200, {
    "Content-Type": MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream",
    "Cache-Control": "no-store",
  });
  fs.createReadStream(filePath).pipe(response);
}

function safePath(base, requestedPath) {
  const resolved = path.resolve(base, requestedPath);
  return resolved === base || resolved.startsWith(`${base}${path.sep}`) ? resolved : null;
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Requête trop volumineuse."));
        request.destroy();
      }
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Corps JSON invalide."));
      }
    });
    request.on("error", reject);
  });
}

function currentStatus() {
  const compatibilityPath = path.join(ROOT, "reports", "current-compatibility.json");
  const validationPath = path.join(ROOT, "validations", "current-validation.json");
  let generationAvailable = false;
  if (fs.existsSync(validationPath)) {
    const validation = JSON.parse(fs.readFileSync(validationPath, "utf8"));
    generationAvailable = validation.statut_validation === "valide_pour_generation";
  }
  return {
    analysis_available: fs.existsSync(compatibilityPath),
    generation_available: generationAvailable,
    candidature_sent: false,
    external_services_connected: false,
  };
}

function findStoredJob(id) {
  const candidates = [
    path.join(ROOT, "data", "jobs-ranked.json"),
    path.join(ROOT, "data", "jobs-found.json"),
  ];
  for (const filePath of candidates) {
    if (!fs.existsSync(filePath)) continue;
    const payload = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const collections = [
      payload.all_scored,
      payload.jobs_ranked,
      payload.jobs,
      Array.isArray(payload) ? payload : [],
    ];
    for (const collection of collections) {
      const offer = (collection || []).find((job) => String(job.id_offre) === String(id));
      if (offer) return offer;
    }
  }
  return null;
}

async function handleApi(request, response, pathname) {
  if (request.method === "GET" && pathname === "/api/status") {
    sendJson(response, 200, currentStatus());
    return;
  }

  if (request.method === "POST" && pathname === "/api/analyze") {
    const input = await readBody(request);
    const report = analyzeOffer(input);
    sendJson(response, 200, { ok: true, report });
    return;
  }

  if (request.method === "POST" && pathname === "/api/generate") {
    const input = await readBody(request);
    const result = await generateApplication(input.confirmation);
    sendJson(response, 200, { ok: true, result });
    return;
  }

  const prepareMatch = pathname.match(/^\/api\/jobs\/([^/]+)\/prepare$/);
  if (request.method === "POST" && prepareMatch) {
    const id = decodeURIComponent(prepareMatch[1]);
    const offer = findStoredJob(id);
    if (!offer) throw new Error(`Offre ${id} introuvable dans la dernière recherche.`);
    const report = analyzeOffer(offer);
    sendJson(response, 200, {
      ok: true,
      status: "offre_preparee_validation_requise",
      offer,
      report,
      validation_humaine_requise: true,
      next: `/api/jobs/${encodeURIComponent(id)}/generate`,
    });
    return;
  }

  const generateMatch = pathname.match(/^\/api\/jobs\/([^/]+)\/generate$/);
  if (request.method === "POST" && generateMatch) {
    const id = decodeURIComponent(generateMatch[1]);
    const input = await readBody(request);
    if (String(input.confirmation || "").toUpperCase() !== "OUI") {
      throw new Error("Validation humaine OUI requise. Aucun document généré.");
    }
    const result = await generateApplication("OUI", id);
    sendJson(response, 200, { ok: true, status: result.status, result });
    return;
  }

  if (request.method === "POST" && pathname === "/api/jobs/search") {
    const result = await searchAndScoreJobs();
    sendJson(response, 200, { ok: true, result });
    return;
  }

  if (request.method === "POST" && pathname === "/api/jobs/prepare") {
    const input = await readBody(request);
    const rankedPath = path.join(ROOT, "data", "jobs-ranked.json");
    if (!fs.existsSync(rankedPath)) {
      throw new Error("Lancez d'abord une recherche d'offres.");
    }
    const ranked = JSON.parse(fs.readFileSync(rankedPath, "utf8"));
    const offer = (ranked.all_scored || []).find((job) => job.id_offre === input.id_offre);
    if (!offer) throw new Error("Offre introuvable dans le dernier classement.");
    const report = analyzeOffer(offer);
    sendJson(response, 200, { ok: true, offer, report });
    return;
  }

  sendJson(response, 404, { error: "Route API introuvable." });
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host || `${HOST}:${PORT}`}`);
    const pathname = decodeURIComponent(url.pathname);

    if (pathname.startsWith("/api/")) {
      await handleApi(request, response, pathname);
      return;
    }

    if (pathname.startsWith("/files/")) {
      const relativePath = pathname.slice("/files/".length);
      const requested = safePath(ROOT, relativePath);
      if (!requested) {
        sendJson(response, 403, { error: "Chemin refusé." });
        return;
      }
      if (fs.existsSync(requested) && fs.statSync(requested).isDirectory()) {
        sendFile(response, path.join(requested, "README.md"));
        return;
      }
      sendFile(response, requested);
      return;
    }

    const publicPath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
    const requested = safePath(PUBLIC_DIR, publicPath);
    if (!requested) {
      sendJson(response, 403, { error: "Chemin refusé." });
      return;
    }
    sendFile(response, requested);
  } catch (error) {
    console.error(error);
    sendJson(response, 400, { error: error.message || "Erreur locale inattendue." });
  }
});

server.listen(PORT, HOST, () => {
  const displayedHost = HOST === "0.0.0.0" ? "adresse-IP-du-PC" : HOST;
  console.log(`JobHunter Studio disponible sur http://${displayedHost}:${PORT}`);
  console.log("Mode local uniquement. Aucun service externe connecté.");
});
