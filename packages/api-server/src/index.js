const http = require("http");
const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");

let DatabaseSync;
try {
  ({ DatabaseSync } = require("node:sqlite"));
} catch {
  DatabaseSync = null;
}

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
const DATA_DIR = process.env.DATA_DIR || path.resolve(__dirname, "../../../data");
const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, "mining.sqlite");
const ADMIN_TOKEN = "token-admin-1";

const defaultHome = {
  hero_title: {
    "ko-KR": "운정에서 가장 편하게, 가장 오래 남는 스타일",
    "en-US": "Comfort-first, long-lasting style in Unjeong",
  },
  hero_subtitle: {
    "ko-KR": "미닝 운정점에서 당신의 무드를 더 선명하게 완성해보세요.",
    "en-US": "Complete your mood with a sharper finish at Mining Unjeong.",
  },
  hero_cta_label: {
    "ko-KR": "예약하기",
    "en-US": "Book now",
  },
  highlights: [],
};

function normalizeLocalizedText(input, fallback) {
  if (!input || typeof input !== "object") {
    return fallback;
  }
  const ko = typeof input["ko-KR"] === "string" ? input["ko-KR"] : fallback["ko-KR"];
  const en = typeof input["en-US"] === "string" ? input["en-US"] : fallback["en-US"];
  return {
    "ko-KR": ko,
    "en-US": en,
  };
}

function sendJson(res, status, body, headers = {}) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    ...headers,
  });
  res.end(payload);
}

function sendText(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1024 * 1024) {
        reject(new Error("PAYLOAD_TOO_LARGE"));
      }
    });
    req.on("end", () => {
      if (data.length === 0) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error("INVALID_JSON"));
      }
    });
    req.on("error", reject);
  });
}

function getBearerToken(req) {
  const header = req.headers.authorization;
  if (typeof header !== "string") {
    return "";
  }
  return header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
}

function isAdmin(req) {
  return getBearerToken(req) === ADMIN_TOKEN;
}

function ensureDb() {
  if (!DatabaseSync) {
    return { ok: false, reason: "node:sqlite not available" };
  }

  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS _meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS home_page (
      id TEXT PRIMARY KEY,
      json TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS revisions (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      snapshot_json TEXT NOT NULL,
      summary_json TEXT,
      actor_admin_user_id TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  const now = new Date().toISOString();
  db.prepare("INSERT OR IGNORE INTO _meta(key, value) VALUES (?, ?)").run("schema_version", "1");
  db.prepare("INSERT OR IGNORE INTO home_page(id, json, version, updated_at) VALUES (?, ?, ?, ?)").run(
    "home",
    JSON.stringify(defaultHome),
    1,
    now,
  );
  db.close();
  return { ok: true };
}

const dbStatus = ensureDb();

function openDb() {
  if (!DatabaseSync) {
    throw new Error("DB_UNAVAILABLE");
  }
  return new DatabaseSync(DB_PATH);
}

function fetchHome(db) {
  const row = db.prepare("SELECT id, json, version, updated_at FROM home_page WHERE id = ?").get("home");
  if (!row) {
    throw new Error("HOME_NOT_FOUND");
  }
  const data = JSON.parse(row.json);
  return {
    id: row.id,
    hero_title: normalizeLocalizedText(data.hero_title, defaultHome.hero_title),
    hero_subtitle: normalizeLocalizedText(data.hero_subtitle, defaultHome.hero_subtitle),
    hero_cta_label: normalizeLocalizedText(data.hero_cta_label, defaultHome.hero_cta_label),
    highlights: Array.isArray(data.highlights) ? data.highlights : [],
    version: row.version,
    updated_at: row.updated_at,
  };
}

function listRevisions(db) {
  const rows = db
    .prepare(
      "SELECT id, entity_type, entity_id, summary_json, created_at FROM revisions ORDER BY datetime(created_at) DESC, id DESC",
    )
    .all();
  return rows.map((row) => ({
    id: row.id,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    summary: row.summary_json ? JSON.parse(row.summary_json) : [],
    created_at: row.created_at,
  }));
}

async function handleRequest(req, res) {
  const method = req.method || "GET";
  const url = new URL(req.url || "/", `http://${req.headers.host}`);

  if (url.pathname === "/api/health" && method === "GET") {
    sendJson(res, 200, { ok: true, ts: new Date().toISOString(), db: dbStatus });
    return;
  }

  if (url.pathname === "/api/i18n/ko-KR" && method === "GET") {
    const filePath = path.resolve(__dirname, "../../../locales/ko-KR.json");
    sendJson(res, 200, readJson(filePath));
    return;
  }

  if (url.pathname === "/api/i18n/en-US" && method === "GET") {
    const filePath = path.resolve(__dirname, "../../../locales/en-US.json");
    sendJson(res, 200, readJson(filePath));
    return;
  }

  if (url.pathname === "/api/auth/login" && method === "POST") {
    const body = await readBody(req);
    if (body.username === "admin" && body.password === "admin1234!") {
      sendJson(res, 200, {
        access_token: ADMIN_TOKEN,
        token_type: "Bearer",
        user: { id: "admin-1", username: "admin", role: "ADMIN" },
      });
      return;
    }

    sendJson(res, 401, {
      code: "AUTH_INVALID_CREDENTIALS",
      message: "Invalid credentials",
    });
    return;
  }

  if (url.pathname === "/api/auth/logout" && method === "POST") {
    if (!isAdmin(req)) {
      sendJson(res, 401, { code: "AUTH_REQUIRED", message: "Not authenticated" });
      return;
    }

    sendText(res, 204, "");
    return;
  }

  if (url.pathname === "/api/admin/me" && method === "GET") {
    if (!isAdmin(req)) {
      sendJson(res, 401, { code: "AUTH_REQUIRED", message: "Not authenticated" });
      return;
    }

    sendJson(res, 200, { id: "admin-1", username: "admin", role: "ADMIN" });
    return;
  }

  if (url.pathname === "/api/public/home" && method === "GET") {
    const db = openDb();
    try {
      const home = fetchHome(db);
      sendJson(res, 200, home, { ETag: `W/"${home.version}"` });
    } finally {
      db.close();
    }
    return;
  }

  if (url.pathname === "/api/admin/home" && method === "PATCH") {
    if (!isAdmin(req)) {
      sendJson(res, 401, { code: "AUTH_REQUIRED", message: "Not authenticated" });
      return;
    }

    const body = await readBody(req);
    const db = openDb();
    try {
      const current = fetchHome(db);
      const next = {
        hero_title: body.hero_title
          ? normalizeLocalizedText(body.hero_title, current.hero_title)
          : current.hero_title,
        hero_subtitle: body.hero_subtitle
          ? normalizeLocalizedText(body.hero_subtitle, current.hero_subtitle)
          : current.hero_subtitle,
        hero_cta_label: body.hero_cta_label
          ? normalizeLocalizedText(body.hero_cta_label, current.hero_cta_label)
          : current.hero_cta_label,
        highlights: Array.isArray(body.highlights) ? body.highlights : current.highlights,
      };

      const changedFields = [];
      if (JSON.stringify(next.hero_title) !== JSON.stringify(current.hero_title)) {
        changedFields.push("hero_title");
      }
      if (JSON.stringify(next.hero_subtitle) !== JSON.stringify(current.hero_subtitle)) {
        changedFields.push("hero_subtitle");
      }

      if (changedFields.length === 0) {
        sendJson(res, 200, current, { ETag: `W/"${current.version}"` });
        return;
      }

      const now = new Date().toISOString();
      db.exec("BEGIN IMMEDIATE");
      try {
        db.prepare("UPDATE home_page SET json = ?, version = version + 1, updated_at = ? WHERE id = ?").run(
          JSON.stringify(next),
          now,
          "home",
        );

        const updated = fetchHome(db);
        db.prepare(
          "INSERT INTO revisions(id, entity_type, entity_id, snapshot_json, summary_json, actor_admin_user_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        ).run(
          randomUUID(),
          "home",
          "home",
          JSON.stringify(updated),
          JSON.stringify(changedFields),
          "admin-1",
          now,
        );

        db.exec("COMMIT");
        sendJson(res, 200, updated, { ETag: `W/"${updated.version}"` });
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    } finally {
      db.close();
    }
    return;
  }

  if (url.pathname === "/api/admin/revisions" && method === "GET") {
    if (!isAdmin(req)) {
      sendJson(res, 401, { code: "AUTH_REQUIRED", message: "Not authenticated" });
      return;
    }

    const db = openDb();
    try {
      sendJson(res, 200, { items: listRevisions(db) });
    } finally {
      db.close();
    }
    return;
  }

  if (url.pathname === "/" || url.pathname === "/index.html") {
    const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>mining_website</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto;background:#0b0b0f;color:#eaeaf0;padding:24px}
    .badge{display:inline-block;padding:6px 10px;border-radius:999px;background:#1f2937;color:#e5e7eb;font-size:12px}
  </style>
</head>
<body>
  <h1 id="brand"></h1>
  <div class="badge" id="health">...</div>
  <script>
    async function main() {
      const dict = await fetch('/api/i18n/ko-KR').then((r) => r.json());
      document.querySelector('#brand').textContent = dict['app.brandName'];
      const health = await fetch('/api/health').then((r) => r.json());
      document.querySelector('#health').textContent = health.ok ? 'ok' : 'fail';
    }
    main();
  </script>
</body>
</html>`;
    sendText(res, 200, html, { "Content-Type": "text/html; charset=utf-8" });
    return;
  }

  sendJson(res, 404, { code: "NOT_FOUND", message: "Not found" });
}

const server = http.createServer((req, res) => {
  handleRequest(req, res).catch((error) => {
    if (error.message === "INVALID_JSON") {
      sendJson(res, 400, { code: "VALIDATION_ERROR", message: "Invalid JSON body" });
      return;
    }

    if (error.message === "PAYLOAD_TOO_LARGE") {
      sendJson(res, 413, { code: "MEDIA_TOO_LARGE", message: "Payload too large" });
      return;
    }

    sendJson(res, 500, {
      code: "INTERNAL_ERROR",
      message: "Unexpected server error",
      detail: String(error && error.message ? error.message : error),
    });
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[api-server] listening on :${PORT}`);
});
