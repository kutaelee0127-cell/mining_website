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

const defaultAbout = {
  brand_story: {
    "ko-KR": "미닝 운정점은 얼굴형과 라이프스타일에 맞춘 디자인 컷을 지향합니다.",
    "en-US": "Mining Unjeong focuses on design cuts tailored to face shape and lifestyle.",
  },
  designer_intro: {
    "ko-KR": "경력 디자이너가 1:1로 상담하고 시술합니다.",
    "en-US": "Experienced designers provide one-on-one consultation and service.",
  },
  designer_profile_ids: [],
  location_block: {
    address: {
      "ko-KR": "경기 파주시 운정로 00",
      "en-US": "00 Unjeong-ro, Paju-si, Gyeonggi",
    },
    naver_map_url: "https://map.naver.com",
    transport_hint: {
      "ko-KR": "운정역에서 도보 10분",
      "en-US": "10 minutes on foot from Unjeong Station",
    },
    parking_hint: {
      "ko-KR": "건물 지하 주차 가능",
      "en-US": "Underground parking available",
    },
    phone: "010-0000-0000",
  },
};

const defaultSite = {
  brand_name: {
    "ko-KR": "미닝 운정점",
    "en-US": "Mining Unjeong",
  },
  brand_tagline: {
    "ko-KR": "당신의 분위기를 더 선명하게.",
    "en-US": "Make your vibe sharper.",
  },
  default_theme: "dark",
  supported_locales: ["ko-KR", "en-US"],
  links: {
    booking: {
      label: {
        "ko-KR": "네이버에서 예약하기",
        "en-US": "Book on Naver",
      },
      url: "https://smartstore.naver.com",
      open_in_new_tab: true,
    },
    instagram: {
      label: {
        "ko-KR": "인스타그램",
        "en-US": "Instagram",
      },
      url: "https://instagram.com",
      open_in_new_tab: true,
    },
    naver_map: {
      label: {
        "ko-KR": "네이버 지도",
        "en-US": "Naver Map",
      },
      url: "https://map.naver.com",
      open_in_new_tab: true,
    },
  },
  business_hours: {
    "ko-KR": "매일 10:00 - 20:00",
    "en-US": "Daily 10:00 - 20:00",
  },
  contact_phone: "010-0000-0000",
  address: {
    "ko-KR": "경기 파주시 운정로 00",
    "en-US": "00 Unjeong-ro, Paju-si, Gyeonggi",
  },
};

const defaultBooking = {
  booking_url: defaultSite.links.booking.url,
  open_in_new_tab: true,
  note: {
    "ko-KR": "예약은 네이버 스토어에서 진행됩니다.",
    "en-US": "Booking continues on Naver Store.",
  },
};

function toLocalizedText(input, fallbackText = "") {
  const fallback = {
    "ko-KR": fallbackText,
    "en-US": fallbackText,
  };
  if (!input || typeof input !== "object") {
    return fallback;
  }
  return normalizeLocalizedText(input, fallback);
}

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

    CREATE TABLE IF NOT EXISTS about_page (
      id TEXT PRIMARY KEY,
      json TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      id TEXT PRIMARY KEY,
      json TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS booking_config (
      id TEXT PRIMARY KEY,
      json TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS gallery_items (
      id TEXT PRIMARY KEY,
      json TEXT NOT NULL,
      published INTEGER NOT NULL DEFAULT 1,
      featured INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER,
      version INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
    );

    CREATE TABLE IF NOT EXISTS style_items (
      id TEXT PRIMARY KEY,
      json TEXT NOT NULL,
      published INTEGER NOT NULL DEFAULT 1,
      version INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
    );

    CREATE TABLE IF NOT EXISTS review_items (
      id TEXT PRIMARY KEY,
      json TEXT NOT NULL,
      published INTEGER NOT NULL DEFAULT 1,
      version INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
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
  db.prepare("INSERT OR IGNORE INTO about_page(id, json, version, updated_at) VALUES (?, ?, ?, ?)").run(
    "about",
    JSON.stringify(defaultAbout),
    1,
    now,
  );
  db.prepare("INSERT OR IGNORE INTO site_settings(id, json, version, updated_at) VALUES (?, ?, ?, ?)").run(
    "site",
    JSON.stringify(defaultSite),
    1,
    now,
  );
  db.prepare("INSERT OR IGNORE INTO booking_config(id, json, version, updated_at) VALUES (?, ?, ?, ?)").run(
    "booking",
    JSON.stringify(defaultBooking),
    1,
    now,
  );

  db.prepare(
    "INSERT OR IGNORE INTO gallery_items(id, json, published, featured, sort_order, version, created_at, updated_at, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)",
  ).run(
    "gallery-seed-1",
    JSON.stringify({
      media_id: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=900&q=80",
      caption: {
        "ko-KR": "레이어드 컷",
        "en-US": "Layered cut",
      },
      tags: ["cut"],
    }),
    1,
    1,
    0,
    1,
    now,
    now,
  );

  db.prepare(
    "INSERT OR IGNORE INTO style_items(id, json, published, version, created_at, updated_at, deleted_at) VALUES (?, ?, ?, ?, ?, ?, NULL)",
  ).run(
    "style-seed-1",
    JSON.stringify({
      name: {
        "ko-KR": "여성 컷",
        "en-US": "Women's cut",
      },
      description: {
        "ko-KR": "상담 포함 기본 컷",
        "en-US": "Standard cut with consultation",
      },
      price: { amount: 35000, currency: "KRW" },
      duration_minutes: 60,
      media_id: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80",
      category: "CUT",
    }),
    1,
    1,
    now,
    now,
  );

  db.prepare(
    "INSERT OR IGNORE INTO review_items(id, json, published, version, created_at, updated_at, deleted_at) VALUES (?, ?, ?, ?, ?, ?, NULL)",
  ).run(
    "review-seed-1",
    JSON.stringify({
      author_name: "고객A",
      rating: 5,
      content: {
        "ko-KR": "상담이 꼼꼼하고 결과가 만족스러워요.",
        "en-US": "Great consultation and very satisfying result.",
      },
      source: "NAVER",
      source_url: "https://map.naver.com",
    }),
    1,
    1,
    now,
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

function fetchAbout(db) {
  const row = db.prepare("SELECT id, json, version, updated_at FROM about_page WHERE id = ?").get("about");
  if (!row) {
    throw new Error("ABOUT_NOT_FOUND");
  }
  const data = JSON.parse(row.json);
  return {
    id: row.id,
    brand_story: toLocalizedText(data.brand_story),
    designer_intro: toLocalizedText(data.designer_intro),
    designer_profile_ids: Array.isArray(data.designer_profile_ids) ? data.designer_profile_ids : [],
    location_block: {
      address: toLocalizedText(data.location_block?.address),
      naver_map_url: typeof data.location_block?.naver_map_url === "string" ? data.location_block.naver_map_url : "https://map.naver.com",
      transport_hint: toLocalizedText(data.location_block?.transport_hint),
      parking_hint: toLocalizedText(data.location_block?.parking_hint),
      phone: typeof data.location_block?.phone === "string" ? data.location_block.phone : "",
    },
    version: row.version,
    updated_at: row.updated_at,
  };
}

function fetchSite(db) {
  const row = db.prepare("SELECT id, json, version, updated_at FROM site_settings WHERE id = ?").get("site");
  if (!row) {
    throw new Error("SITE_NOT_FOUND");
  }
  const data = JSON.parse(row.json);
  return {
    id: row.id,
    brand_name: toLocalizedText(data.brand_name, "미닝 운정점"),
    brand_tagline: toLocalizedText(data.brand_tagline, ""),
    default_theme: data.default_theme === "light" ? "light" : "dark",
    supported_locales: Array.isArray(data.supported_locales) ? data.supported_locales : ["ko-KR", "en-US"],
    links: {
      booking: {
        label: toLocalizedText(data.links?.booking?.label, "예약"),
        url: typeof data.links?.booking?.url === "string" ? data.links.booking.url : defaultSite.links.booking.url,
        open_in_new_tab: data.links?.booking?.open_in_new_tab !== false,
      },
      instagram: {
        label: toLocalizedText(data.links?.instagram?.label, "인스타"),
        url: typeof data.links?.instagram?.url === "string" ? data.links.instagram.url : defaultSite.links.instagram.url,
        open_in_new_tab: data.links?.instagram?.open_in_new_tab !== false,
      },
      naver_map: {
        label: toLocalizedText(data.links?.naver_map?.label, "지도"),
        url: typeof data.links?.naver_map?.url === "string" ? data.links.naver_map.url : defaultSite.links.naver_map.url,
        open_in_new_tab: data.links?.naver_map?.open_in_new_tab !== false,
      },
    },
    business_hours: toLocalizedText(data.business_hours),
    contact_phone: typeof data.contact_phone === "string" ? data.contact_phone : "",
    address: toLocalizedText(data.address),
    version: row.version,
    updated_at: row.updated_at,
  };
}

function fetchBooking(db) {
  const row = db.prepare("SELECT id, json, version, updated_at FROM booking_config WHERE id = ?").get("booking");
  if (!row) {
    throw new Error("BOOKING_NOT_FOUND");
  }
  const data = JSON.parse(row.json);
  return {
    booking_url: typeof data.booking_url === "string" ? data.booking_url : defaultBooking.booking_url,
    open_in_new_tab: data.open_in_new_tab !== false,
    note: toLocalizedText(data.note, defaultBooking.note["ko-KR"]),
    version: row.version,
    updated_at: row.updated_at,
  };
}

function withRevision(db, input) {
  const revisionId = input.id ?? randomUUID();
  db.prepare(
    "INSERT INTO revisions(id, entity_type, entity_id, snapshot_json, summary_json, actor_admin_user_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
  ).run(
    revisionId,
    input.entity_type,
    input.entity_id,
    JSON.stringify(input.snapshot),
    JSON.stringify(input.summary),
    input.actor_admin_user_id ?? "admin-1",
    input.created_at,
  );
  return revisionId;
}

function mapGalleryRow(row) {
  const data = JSON.parse(row.json);
  return {
    id: row.id,
    media_id: typeof data.media_id === "string" ? data.media_id : "",
    caption: toLocalizedText(data.caption),
    tags: Array.isArray(data.tags) ? data.tags : [],
    published: row.published === 1,
    featured: row.featured === 1,
    sort_order: row.sort_order,
    version: row.version,
    created_at: row.created_at,
    updated_at: row.updated_at,
    deleted_at: row.deleted_at,
  };
}

function mapStyleRow(row) {
  const data = JSON.parse(row.json);
  return {
    id: row.id,
    name: toLocalizedText(data.name),
    description: toLocalizedText(data.description),
    price: typeof data.price === "object" && data.price ? data.price : { amount: 0, currency: "KRW" },
    duration_minutes: Number.isInteger(data.duration_minutes) ? data.duration_minutes : 60,
    media_id: typeof data.media_id === "string" ? data.media_id : "",
    category: typeof data.category === "string" ? data.category : "ETC",
    published: row.published === 1,
    version: row.version,
    created_at: row.created_at,
    updated_at: row.updated_at,
    deleted_at: row.deleted_at,
  };
}

function mapReviewRow(row) {
  const data = JSON.parse(row.json);
  return {
    id: row.id,
    author_name: typeof data.author_name === "string" ? data.author_name : "",
    rating: Number.isInteger(data.rating) ? data.rating : 5,
    content: toLocalizedText(data.content),
    source: typeof data.source === "string" ? data.source : "MANUAL",
    source_url: typeof data.source_url === "string" ? data.source_url : undefined,
    published: row.published === 1,
    version: row.version,
    created_at: row.created_at,
    updated_at: row.updated_at,
    deleted_at: row.deleted_at,
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

function getRevisionById(db, id) {
  const row = db
    .prepare(
      "SELECT id, entity_type, entity_id, snapshot_json, summary_json, actor_admin_user_id, created_at FROM revisions WHERE id = ?",
    )
    .get(id);
  if (!row) {
    return null;
  }
  return {
    id: row.id,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    snapshot: JSON.parse(row.snapshot_json),
    summary: row.summary_json ? JSON.parse(row.summary_json) : [],
    actor_admin_user_id: row.actor_admin_user_id,
    created_at: row.created_at,
  };
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
        admin: {
          id: "admin-1",
          username: "admin",
          locale_preference: "ko-KR",
          created_at: new Date().toISOString(),
        },
        tokens: {
          access_token: ADMIN_TOKEN,
          token_type: "Bearer",
          expires_in_seconds: 3600,
        },
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

    sendJson(res, 200, {
      admin: {
        id: "admin-1",
        username: "admin",
        locale_preference: "ko-KR",
        created_at: new Date().toISOString(),
      },
    });
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
        withRevision(db, {
          entity_type: "HOME_PAGE",
          entity_id: "home",
          snapshot: updated,
          summary: changedFields,
          created_at: now,
        });

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

  if (url.pathname === "/api/public/about" && method === "GET") {
    const db = openDb();
    try {
      const about = fetchAbout(db);
      sendJson(res, 200, about, { ETag: `W/"${about.version}"` });
    } finally {
      db.close();
    }
    return;
  }

  if (url.pathname === "/api/admin/about" && method === "PATCH") {
    if (!isAdmin(req)) {
      sendJson(res, 401, { code: "AUTH_REQUIRED", message: "Not authenticated" });
      return;
    }

    const body = await readBody(req);
    const db = openDb();
    try {
      const current = fetchAbout(db);
      const next = {
        brand_story: body.brand_story ? toLocalizedText(body.brand_story) : current.brand_story,
        designer_intro: body.designer_intro ? toLocalizedText(body.designer_intro) : current.designer_intro,
        designer_profile_ids: Array.isArray(body.designer_profile_ids) ? body.designer_profile_ids : current.designer_profile_ids,
        location_block: body.location_block
          ? {
              address: body.location_block.address ? toLocalizedText(body.location_block.address) : current.location_block.address,
              naver_map_url:
                typeof body.location_block.naver_map_url === "string"
                  ? body.location_block.naver_map_url
                  : current.location_block.naver_map_url,
              transport_hint: body.location_block.transport_hint
                ? toLocalizedText(body.location_block.transport_hint)
                : current.location_block.transport_hint,
              parking_hint: body.location_block.parking_hint
                ? toLocalizedText(body.location_block.parking_hint)
                : current.location_block.parking_hint,
              phone:
                typeof body.location_block.phone === "string"
                  ? body.location_block.phone
                  : current.location_block.phone,
            }
          : current.location_block,
      };

      const changedFields = [];
      if (JSON.stringify(current.brand_story) !== JSON.stringify(next.brand_story)) {
        changedFields.push("brand_story");
      }
      if (JSON.stringify(current.designer_intro) !== JSON.stringify(next.designer_intro)) {
        changedFields.push("designer_intro");
      }
      if (JSON.stringify(current.location_block) !== JSON.stringify(next.location_block)) {
        changedFields.push("location_block");
      }
      if (changedFields.length === 0) {
        sendJson(res, 200, current, { ETag: `W/"${current.version}"` });
        return;
      }

      const now = new Date().toISOString();
      db.exec("BEGIN IMMEDIATE");
      try {
        db.prepare("UPDATE about_page SET json = ?, version = version + 1, updated_at = ? WHERE id = ?").run(
          JSON.stringify(next),
          now,
          "about",
        );
        const updated = fetchAbout(db);
        withRevision(db, {
          entity_type: "ABOUT_PAGE",
          entity_id: "about",
          snapshot: updated,
          summary: changedFields,
          created_at: now,
        });
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

  if (url.pathname === "/api/public/site" && method === "GET") {
    const db = openDb();
    try {
      const site = fetchSite(db);
      sendJson(res, 200, site, { ETag: `W/"${site.version}"` });
    } finally {
      db.close();
    }
    return;
  }

  if (url.pathname === "/api/admin/site" && method === "PATCH") {
    if (!isAdmin(req)) {
      sendJson(res, 401, { code: "AUTH_REQUIRED", message: "Not authenticated" });
      return;
    }

    const body = await readBody(req);
    const db = openDb();
    try {
      const current = fetchSite(db);
      const next = {
        ...current,
        links: {
          booking: body.links?.booking
            ? {
                label: body.links.booking.label ? toLocalizedText(body.links.booking.label) : current.links.booking.label,
                url: typeof body.links.booking.url === "string" ? body.links.booking.url : current.links.booking.url,
                open_in_new_tab:
                  typeof body.links.booking.open_in_new_tab === "boolean"
                    ? body.links.booking.open_in_new_tab
                    : current.links.booking.open_in_new_tab,
              }
            : current.links.booking,
          instagram: body.links?.instagram
            ? {
                label: body.links.instagram.label ? toLocalizedText(body.links.instagram.label) : current.links.instagram.label,
                url: typeof body.links.instagram.url === "string" ? body.links.instagram.url : current.links.instagram.url,
                open_in_new_tab:
                  typeof body.links.instagram.open_in_new_tab === "boolean"
                    ? body.links.instagram.open_in_new_tab
                    : current.links.instagram.open_in_new_tab,
              }
            : current.links.instagram,
          naver_map: body.links?.naver_map
            ? {
                label: body.links.naver_map.label ? toLocalizedText(body.links.naver_map.label) : current.links.naver_map.label,
                url: typeof body.links.naver_map.url === "string" ? body.links.naver_map.url : current.links.naver_map.url,
                open_in_new_tab:
                  typeof body.links.naver_map.open_in_new_tab === "boolean"
                    ? body.links.naver_map.open_in_new_tab
                    : current.links.naver_map.open_in_new_tab,
              }
            : current.links.naver_map,
        },
      };
      const changed = JSON.stringify(current.links) !== JSON.stringify(next.links);
      if (!changed) {
        sendJson(res, 200, current, { ETag: `W/"${current.version}"` });
        return;
      }
      const now = new Date().toISOString();
      db.exec("BEGIN IMMEDIATE");
      try {
        db.prepare("UPDATE site_settings SET json = ?, version = version + 1, updated_at = ? WHERE id = ?").run(
          JSON.stringify(next),
          now,
          "site",
        );
        const updated = fetchSite(db);
        withRevision(db, {
          entity_type: "SITE_SETTINGS",
          entity_id: "site",
          snapshot: updated,
          summary: ["links"],
          created_at: now,
        });
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

  if (url.pathname === "/api/public/booking" && method === "GET") {
    const db = openDb();
    try {
      const booking = fetchBooking(db);
      sendJson(res, 200, booking);
    } finally {
      db.close();
    }
    return;
  }

  if (url.pathname === "/api/admin/booking" && method === "PATCH") {
    if (!isAdmin(req)) {
      sendJson(res, 401, { code: "AUTH_REQUIRED", message: "Not authenticated" });
      return;
    }
    const body = await readBody(req);
    const db = openDb();
    try {
      const current = fetchBooking(db);
      const next = {
        booking_url: typeof body.booking_url === "string" ? body.booking_url : current.booking_url,
        open_in_new_tab: typeof body.open_in_new_tab === "boolean" ? body.open_in_new_tab : current.open_in_new_tab,
        note: body.note ? toLocalizedText(body.note) : current.note,
      };
      const changed = JSON.stringify(current) !== JSON.stringify(next);
      if (!changed) {
        sendJson(res, 200, current);
        return;
      }
      const now = new Date().toISOString();
      db.exec("BEGIN IMMEDIATE");
      try {
        db.prepare("UPDATE booking_config SET json = ?, version = version + 1, updated_at = ? WHERE id = ?").run(
          JSON.stringify(next),
          now,
          "booking",
        );
        const updated = fetchBooking(db);
        withRevision(db, {
          entity_type: "SITE_SETTINGS",
          entity_id: "booking",
          snapshot: updated,
          summary: ["booking"],
          created_at: now,
        });
        db.exec("COMMIT");
        sendJson(res, 200, updated);
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    } finally {
      db.close();
    }
    return;
  }

  if (url.pathname === "/api/public/gallery/items" && method === "GET") {
    const db = openDb();
    try {
      const rows = db
        .prepare("SELECT * FROM gallery_items WHERE deleted_at IS NULL AND published = 1 ORDER BY COALESCE(sort_order, 999999), datetime(created_at) DESC")
        .all();
      sendJson(res, 200, { items: rows.map(mapGalleryRow), next_cursor: null });
    } finally {
      db.close();
    }
    return;
  }

  if (url.pathname === "/api/admin/gallery/items" && method === "GET") {
    if (!isAdmin(req)) {
      sendJson(res, 401, { code: "AUTH_REQUIRED", message: "Not authenticated" });
      return;
    }
    const db = openDb();
    try {
      const rows = db
        .prepare("SELECT * FROM gallery_items WHERE deleted_at IS NULL ORDER BY COALESCE(sort_order, 999999), datetime(created_at) DESC")
        .all();
      sendJson(res, 200, { items: rows.map(mapGalleryRow), next_cursor: null });
    } finally {
      db.close();
    }
    return;
  }

  if (url.pathname === "/api/admin/gallery/items" && method === "POST") {
    if (!isAdmin(req)) {
      sendJson(res, 401, { code: "AUTH_REQUIRED", message: "Not authenticated" });
      return;
    }
    const body = await readBody(req);
    const now = new Date().toISOString();
    const id = randomUUID();
    const payload = {
      media_id: typeof body.media_id === "string" ? body.media_id : "",
      caption: toLocalizedText(body.caption),
      tags: Array.isArray(body.tags) ? body.tags : [],
    };
    const db = openDb();
    try {
      db.exec("BEGIN IMMEDIATE");
      try {
        const sortRow = db.prepare("SELECT COUNT(*) as cnt FROM gallery_items WHERE deleted_at IS NULL").get();
        db.prepare(
          "INSERT INTO gallery_items(id, json, published, featured, sort_order, version, created_at, updated_at, deleted_at) VALUES (?, ?, ?, ?, ?, 1, ?, ?, NULL)",
        ).run(
          id,
          JSON.stringify(payload),
          body.published === false ? 0 : 1,
          body.featured === true ? 1 : 0,
          Number.isInteger(body.sort_order) ? body.sort_order : sortRow.cnt,
          now,
          now,
        );
        const row = db.prepare("SELECT * FROM gallery_items WHERE id = ?").get(id);
        const item = mapGalleryRow(row);
        withRevision(db, {
          entity_type: "GALLERY_ITEM",
          entity_id: id,
          snapshot: item,
          summary: ["create"],
          created_at: now,
        });
        db.exec("COMMIT");
        sendJson(res, 201, item);
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    } finally {
      db.close();
    }
    return;
  }

  if (url.pathname === "/api/admin/gallery/items/reorder" && method === "POST") {
    if (!isAdmin(req)) {
      sendJson(res, 401, { code: "AUTH_REQUIRED", message: "Not authenticated" });
      return;
    }
    const body = await readBody(req);
    const items = Array.isArray(body.items) ? body.items : [];
    const db = openDb();
    try {
      db.exec("BEGIN IMMEDIATE");
      try {
        const stmt = db.prepare("UPDATE gallery_items SET sort_order = ?, version = version + 1, updated_at = ? WHERE id = ? AND deleted_at IS NULL");
        const now = new Date().toISOString();
        for (const item of items) {
          if (typeof item.id === "string" && Number.isInteger(item.sort_order)) {
            stmt.run(item.sort_order, now, item.id);
          }
        }
        db.exec("COMMIT");
        sendText(res, 204, "");
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    } finally {
      db.close();
    }
    return;
  }

  if (url.pathname.startsWith("/api/admin/gallery/items/") && method === "PATCH") {
    if (!isAdmin(req)) {
      sendJson(res, 401, { code: "AUTH_REQUIRED", message: "Not authenticated" });
      return;
    }
    const id = url.pathname.split("/").pop();
    const body = await readBody(req);
    const db = openDb();
    try {
      const row = db.prepare("SELECT * FROM gallery_items WHERE id = ? AND deleted_at IS NULL").get(id);
      if (!row) {
        sendJson(res, 404, { code: "NOT_FOUND", message: "Not found" });
        return;
      }
      const current = mapGalleryRow(row);
      const next = {
        media_id: typeof body.media_id === "string" ? body.media_id : current.media_id,
        caption: body.caption ? toLocalizedText(body.caption) : current.caption,
        tags: Array.isArray(body.tags) ? body.tags : current.tags,
      };
      const now = new Date().toISOString();
      db.exec("BEGIN IMMEDIATE");
      try {
        db.prepare(
          "UPDATE gallery_items SET json = ?, published = ?, featured = ?, sort_order = ?, version = version + 1, updated_at = ? WHERE id = ?",
        ).run(
          JSON.stringify(next),
          typeof body.published === "boolean" ? (body.published ? 1 : 0) : row.published,
          typeof body.featured === "boolean" ? (body.featured ? 1 : 0) : row.featured,
          Number.isInteger(body.sort_order) || body.sort_order === null ? body.sort_order : row.sort_order,
          now,
          id,
        );
        const updated = mapGalleryRow(db.prepare("SELECT * FROM gallery_items WHERE id = ?").get(id));
        withRevision(db, {
          entity_type: "GALLERY_ITEM",
          entity_id: id,
          snapshot: updated,
          summary: ["update"],
          created_at: now,
        });
        db.exec("COMMIT");
        sendJson(res, 200, updated);
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    } finally {
      db.close();
    }
    return;
  }

  if (url.pathname.startsWith("/api/admin/gallery/items/") && method === "DELETE") {
    if (!isAdmin(req)) {
      sendJson(res, 401, { code: "AUTH_REQUIRED", message: "Not authenticated" });
      return;
    }
    const id = url.pathname.split("/").pop();
    const db = openDb();
    try {
      const row = db.prepare("SELECT * FROM gallery_items WHERE id = ? AND deleted_at IS NULL").get(id);
      if (!row) {
        sendJson(res, 404, { code: "NOT_FOUND", message: "Not found" });
        return;
      }
      const now = new Date().toISOString();
      db.exec("BEGIN IMMEDIATE");
      try {
        db.prepare("UPDATE gallery_items SET deleted_at = ?, version = version + 1, updated_at = ? WHERE id = ?").run(now, now, id);
        withRevision(db, {
          entity_type: "GALLERY_ITEM",
          entity_id: id,
          snapshot: { ...mapGalleryRow(row), deleted_at: now },
          summary: ["delete"],
          created_at: now,
        });
        db.exec("COMMIT");
        sendText(res, 204, "");
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    } finally {
      db.close();
    }
    return;
  }

  if (url.pathname === "/api/public/styles/items" && method === "GET") {
    const db = openDb();
    try {
      const rows = db.prepare("SELECT * FROM style_items WHERE deleted_at IS NULL AND published = 1 ORDER BY datetime(created_at) DESC").all();
      sendJson(res, 200, { items: rows.map(mapStyleRow) });
    } finally {
      db.close();
    }
    return;
  }

  if (url.pathname === "/api/admin/styles/items" && method === "GET") {
    if (!isAdmin(req)) {
      sendJson(res, 401, { code: "AUTH_REQUIRED", message: "Not authenticated" });
      return;
    }
    const db = openDb();
    try {
      const rows = db.prepare("SELECT * FROM style_items WHERE deleted_at IS NULL ORDER BY datetime(created_at) DESC").all();
      sendJson(res, 200, { items: rows.map(mapStyleRow) });
    } finally {
      db.close();
    }
    return;
  }

  if (url.pathname === "/api/admin/styles/items" && method === "POST") {
    if (!isAdmin(req)) {
      sendJson(res, 401, { code: "AUTH_REQUIRED", message: "Not authenticated" });
      return;
    }
    const body = await readBody(req);
    const now = new Date().toISOString();
    const id = randomUUID();
    const payload = {
      name: toLocalizedText(body.name),
      description: toLocalizedText(body.description),
      price: body.price && typeof body.price === "object" ? body.price : { amount: 0, currency: "KRW" },
      duration_minutes: Number.isInteger(body.duration_minutes) ? body.duration_minutes : 60,
      media_id: typeof body.media_id === "string" ? body.media_id : "",
      category: typeof body.category === "string" ? body.category : "ETC",
    };
    const db = openDb();
    try {
      db.exec("BEGIN IMMEDIATE");
      try {
        db.prepare("INSERT INTO style_items(id, json, published, version, created_at, updated_at, deleted_at) VALUES (?, ?, ?, 1, ?, ?, NULL)").run(
          id,
          JSON.stringify(payload),
          body.published === false ? 0 : 1,
          now,
          now,
        );
        const item = mapStyleRow(db.prepare("SELECT * FROM style_items WHERE id = ?").get(id));
        withRevision(db, {
          entity_type: "STYLE_ITEM",
          entity_id: id,
          snapshot: item,
          summary: ["create"],
          created_at: now,
        });
        db.exec("COMMIT");
        sendJson(res, 201, item);
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    } finally {
      db.close();
    }
    return;
  }

  if (url.pathname.startsWith("/api/admin/styles/items/") && method === "PATCH") {
    if (!isAdmin(req)) {
      sendJson(res, 401, { code: "AUTH_REQUIRED", message: "Not authenticated" });
      return;
    }
    const id = url.pathname.split("/").pop();
    const body = await readBody(req);
    const db = openDb();
    try {
      const row = db.prepare("SELECT * FROM style_items WHERE id = ? AND deleted_at IS NULL").get(id);
      if (!row) {
        sendJson(res, 404, { code: "NOT_FOUND", message: "Not found" });
        return;
      }
      const current = mapStyleRow(row);
      const next = {
        name: body.name ? toLocalizedText(body.name) : current.name,
        description: body.description ? toLocalizedText(body.description) : current.description,
        price: body.price && typeof body.price === "object" ? body.price : current.price,
        duration_minutes: Number.isInteger(body.duration_minutes) ? body.duration_minutes : current.duration_minutes,
        media_id: typeof body.media_id === "string" ? body.media_id : current.media_id,
        category: typeof body.category === "string" ? body.category : current.category,
      };
      const now = new Date().toISOString();
      db.exec("BEGIN IMMEDIATE");
      try {
        db.prepare("UPDATE style_items SET json = ?, published = ?, version = version + 1, updated_at = ? WHERE id = ?").run(
          JSON.stringify(next),
          typeof body.published === "boolean" ? (body.published ? 1 : 0) : row.published,
          now,
          id,
        );
        const updated = mapStyleRow(db.prepare("SELECT * FROM style_items WHERE id = ?").get(id));
        withRevision(db, {
          entity_type: "STYLE_ITEM",
          entity_id: id,
          snapshot: updated,
          summary: ["update"],
          created_at: now,
        });
        db.exec("COMMIT");
        sendJson(res, 200, updated);
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    } finally {
      db.close();
    }
    return;
  }

  if (url.pathname.startsWith("/api/admin/styles/items/") && method === "DELETE") {
    if (!isAdmin(req)) {
      sendJson(res, 401, { code: "AUTH_REQUIRED", message: "Not authenticated" });
      return;
    }
    const id = url.pathname.split("/").pop();
    const db = openDb();
    try {
      const row = db.prepare("SELECT * FROM style_items WHERE id = ? AND deleted_at IS NULL").get(id);
      if (!row) {
        sendJson(res, 404, { code: "NOT_FOUND", message: "Not found" });
        return;
      }
      const now = new Date().toISOString();
      db.exec("BEGIN IMMEDIATE");
      try {
        db.prepare("UPDATE style_items SET deleted_at = ?, version = version + 1, updated_at = ? WHERE id = ?").run(now, now, id);
        withRevision(db, {
          entity_type: "STYLE_ITEM",
          entity_id: id,
          snapshot: { ...mapStyleRow(row), deleted_at: now },
          summary: ["delete"],
          created_at: now,
        });
        db.exec("COMMIT");
        sendText(res, 204, "");
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    } finally {
      db.close();
    }
    return;
  }

  if (url.pathname === "/api/public/reviews/items" && method === "GET") {
    const db = openDb();
    try {
      const rows = db.prepare("SELECT * FROM review_items WHERE deleted_at IS NULL AND published = 1 ORDER BY datetime(created_at) DESC").all();
      sendJson(res, 200, { items: rows.map(mapReviewRow), next_cursor: null });
    } finally {
      db.close();
    }
    return;
  }

  if (url.pathname === "/api/admin/reviews/items" && method === "GET") {
    if (!isAdmin(req)) {
      sendJson(res, 401, { code: "AUTH_REQUIRED", message: "Not authenticated" });
      return;
    }
    const db = openDb();
    try {
      const rows = db.prepare("SELECT * FROM review_items WHERE deleted_at IS NULL ORDER BY datetime(created_at) DESC").all();
      sendJson(res, 200, { items: rows.map(mapReviewRow), next_cursor: null });
    } finally {
      db.close();
    }
    return;
  }

  if (url.pathname === "/api/admin/reviews/items" && method === "POST") {
    if (!isAdmin(req)) {
      sendJson(res, 401, { code: "AUTH_REQUIRED", message: "Not authenticated" });
      return;
    }
    const body = await readBody(req);
    const id = randomUUID();
    const now = new Date().toISOString();
    const payload = {
      author_name: typeof body.author_name === "string" ? body.author_name : "",
      rating: Number.isInteger(body.rating) ? body.rating : 5,
      content: toLocalizedText(body.content),
      source: typeof body.source === "string" ? body.source : "MANUAL",
      source_url: typeof body.source_url === "string" ? body.source_url : "",
    };
    const db = openDb();
    try {
      db.exec("BEGIN IMMEDIATE");
      try {
        db.prepare("INSERT INTO review_items(id, json, published, version, created_at, updated_at, deleted_at) VALUES (?, ?, ?, 1, ?, ?, NULL)").run(
          id,
          JSON.stringify(payload),
          body.published === false ? 0 : 1,
          now,
          now,
        );
        const item = mapReviewRow(db.prepare("SELECT * FROM review_items WHERE id = ?").get(id));
        withRevision(db, {
          entity_type: "REVIEW_ITEM",
          entity_id: id,
          snapshot: item,
          summary: ["create"],
          created_at: now,
        });
        db.exec("COMMIT");
        sendJson(res, 201, item);
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    } finally {
      db.close();
    }
    return;
  }

  if (url.pathname.startsWith("/api/admin/reviews/items/") && method === "PATCH") {
    if (!isAdmin(req)) {
      sendJson(res, 401, { code: "AUTH_REQUIRED", message: "Not authenticated" });
      return;
    }
    const id = url.pathname.split("/").pop();
    const body = await readBody(req);
    const db = openDb();
    try {
      const row = db.prepare("SELECT * FROM review_items WHERE id = ? AND deleted_at IS NULL").get(id);
      if (!row) {
        sendJson(res, 404, { code: "NOT_FOUND", message: "Not found" });
        return;
      }
      const current = mapReviewRow(row);
      const next = {
        author_name: typeof body.author_name === "string" ? body.author_name : current.author_name,
        rating: Number.isInteger(body.rating) ? body.rating : current.rating,
        content: body.content ? toLocalizedText(body.content) : current.content,
        source: typeof body.source === "string" ? body.source : current.source,
        source_url: typeof body.source_url === "string" ? body.source_url : current.source_url,
      };
      const now = new Date().toISOString();
      db.exec("BEGIN IMMEDIATE");
      try {
        db.prepare("UPDATE review_items SET json = ?, published = ?, version = version + 1, updated_at = ? WHERE id = ?").run(
          JSON.stringify(next),
          typeof body.published === "boolean" ? (body.published ? 1 : 0) : row.published,
          now,
          id,
        );
        const updated = mapReviewRow(db.prepare("SELECT * FROM review_items WHERE id = ?").get(id));
        withRevision(db, {
          entity_type: "REVIEW_ITEM",
          entity_id: id,
          snapshot: updated,
          summary: ["update"],
          created_at: now,
        });
        db.exec("COMMIT");
        sendJson(res, 200, updated);
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    } finally {
      db.close();
    }
    return;
  }

  if (url.pathname.startsWith("/api/admin/reviews/items/") && method === "DELETE") {
    if (!isAdmin(req)) {
      sendJson(res, 401, { code: "AUTH_REQUIRED", message: "Not authenticated" });
      return;
    }
    const id = url.pathname.split("/").pop();
    const db = openDb();
    try {
      const row = db.prepare("SELECT * FROM review_items WHERE id = ? AND deleted_at IS NULL").get(id);
      if (!row) {
        sendJson(res, 404, { code: "NOT_FOUND", message: "Not found" });
        return;
      }
      const now = new Date().toISOString();
      db.exec("BEGIN IMMEDIATE");
      try {
        db.prepare("UPDATE review_items SET deleted_at = ?, version = version + 1, updated_at = ? WHERE id = ?").run(now, now, id);
        withRevision(db, {
          entity_type: "REVIEW_ITEM",
          entity_id: id,
          snapshot: { ...mapReviewRow(row), deleted_at: now },
          summary: ["delete"],
          created_at: now,
        });
        db.exec("COMMIT");
        sendText(res, 204, "");
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

  if (url.pathname.startsWith("/api/admin/revisions/") && method === "GET") {
    if (!isAdmin(req)) {
      sendJson(res, 401, { code: "AUTH_REQUIRED", message: "Not authenticated" });
      return;
    }
    const revisionId = url.pathname.split("/").pop();
    const db = openDb();
    try {
      const revision = getRevisionById(db, revisionId);
      if (!revision) {
        sendJson(res, 404, { code: "NOT_FOUND", message: "Not found" });
        return;
      }
      sendJson(res, 200, revision);
    } finally {
      db.close();
    }
    return;
  }

  if (url.pathname.match(/^\/api\/admin\/revisions\/[^/]+\/(restore|revert)$/) && method === "POST") {
    if (!isAdmin(req)) {
      sendJson(res, 401, { code: "AUTH_REQUIRED", message: "Not authenticated" });
      return;
    }
    const parts = url.pathname.split("/");
    const revisionId = parts[4];
    const mode = parts[5];
    const db = openDb();
    try {
      const revision = getRevisionById(db, revisionId);
      if (!revision) {
        sendJson(res, 404, { code: "NOT_FOUND", message: "Not found" });
        return;
      }
      const now = new Date().toISOString();
      const snapshot = revision.snapshot;
      db.exec("BEGIN IMMEDIATE");
      try {
        if (revision.entity_type === "HOME_PAGE") {
          db.prepare("UPDATE home_page SET json = ?, version = version + 1, updated_at = ? WHERE id = ?").run(
            JSON.stringify({
              hero_title: snapshot.hero_title,
              hero_subtitle: snapshot.hero_subtitle,
              hero_cta_label: snapshot.hero_cta_label,
              highlights: snapshot.highlights,
            }),
            now,
            "home",
          );
          const updated = fetchHome(db);
          const newRevisionId = withRevision(db, {
            entity_type: "HOME_PAGE",
            entity_id: "home",
            snapshot: updated,
            summary: ["restore"],
            created_at: now,
          });
          db.exec("COMMIT");
          if (mode === "restore") {
            sendJson(res, 200, {
              entity_type: "HOME_PAGE",
              entity_id: "home",
              restored_snapshot: updated,
              new_revision_id: newRevisionId,
            });
          } else {
            sendJson(res, 200, { revision_id: revisionId, version: updated.version });
          }
          return;
        }

        if (revision.entity_type === "ABOUT_PAGE") {
          db.prepare("UPDATE about_page SET json = ?, version = version + 1, updated_at = ? WHERE id = ?").run(
            JSON.stringify({
              brand_story: snapshot.brand_story,
              designer_intro: snapshot.designer_intro,
              designer_profile_ids: snapshot.designer_profile_ids,
              location_block: snapshot.location_block,
            }),
            now,
            "about",
          );
          const updated = fetchAbout(db);
          const newRevisionId = withRevision(db, {
            entity_type: "ABOUT_PAGE",
            entity_id: "about",
            snapshot: updated,
            summary: ["restore"],
            created_at: now,
          });
          db.exec("COMMIT");
          if (mode === "restore") {
            sendJson(res, 200, {
              entity_type: "ABOUT_PAGE",
              entity_id: "about",
              restored_snapshot: updated,
              new_revision_id: newRevisionId,
            });
          } else {
            sendJson(res, 200, { revision_id: revisionId, version: updated.version });
          }
          return;
        }

        if (revision.entity_type === "SITE_SETTINGS") {
          if (revision.entity_id === "site") {
            const next = {
              ...fetchSite(db),
              ...snapshot,
            };
            db.prepare("UPDATE site_settings SET json = ?, version = version + 1, updated_at = ? WHERE id = ?").run(
              JSON.stringify(next),
              now,
              "site",
            );
            const updated = fetchSite(db);
            const newRevisionId = withRevision(db, {
              entity_type: "SITE_SETTINGS",
              entity_id: "site",
              snapshot: updated,
              summary: ["restore"],
              created_at: now,
            });
            db.exec("COMMIT");
            if (mode === "restore") {
              sendJson(res, 200, {
                entity_type: "SITE_SETTINGS",
                entity_id: "site",
                restored_snapshot: updated,
                new_revision_id: newRevisionId,
              });
            } else {
              sendJson(res, 200, { revision_id: revisionId, version: updated.version });
            }
            return;
          }

          if (revision.entity_id === "booking") {
            db.prepare("UPDATE booking_config SET json = ?, version = version + 1, updated_at = ? WHERE id = ?").run(
              JSON.stringify(snapshot),
              now,
              "booking",
            );
            const updated = fetchBooking(db);
            const newRevisionId = withRevision(db, {
              entity_type: "SITE_SETTINGS",
              entity_id: "booking",
              snapshot: updated,
              summary: ["restore"],
              created_at: now,
            });
            db.exec("COMMIT");
            if (mode === "restore") {
              sendJson(res, 200, {
                entity_type: "SITE_SETTINGS",
                entity_id: "booking",
                restored_snapshot: updated,
                new_revision_id: newRevisionId,
              });
            } else {
              sendJson(res, 200, { revision_id: revisionId, version: updated.version });
            }
            return;
          }
        }

        if (["GALLERY_ITEM", "STYLE_ITEM", "REVIEW_ITEM"].includes(revision.entity_type)) {
          let table = "";
          let payload = snapshot;
          let existing = null;

          if (revision.entity_type === "GALLERY_ITEM") {
            table = "gallery_items";
            payload = {
              media_id: snapshot.media_id,
              caption: snapshot.caption,
              tags: snapshot.tags,
            };
            existing = db.prepare("SELECT version FROM gallery_items WHERE id = ?").get(revision.entity_id);
            if (existing) {
              db.prepare(
                "UPDATE gallery_items SET json = ?, published = ?, featured = ?, sort_order = ?, deleted_at = NULL, version = version + 1, updated_at = ? WHERE id = ?",
              ).run(
                JSON.stringify(payload),
                snapshot.published === false ? 0 : 1,
                snapshot.featured === true ? 1 : 0,
                Number.isInteger(snapshot.sort_order) ? snapshot.sort_order : null,
                now,
                revision.entity_id,
              );
            } else {
              db.prepare(
                "INSERT INTO gallery_items(id, json, published, featured, sort_order, version, created_at, updated_at, deleted_at) VALUES (?, ?, ?, ?, ?, 1, ?, ?, NULL)",
              ).run(
                revision.entity_id,
                JSON.stringify(payload),
                snapshot.published === false ? 0 : 1,
                snapshot.featured === true ? 1 : 0,
                Number.isInteger(snapshot.sort_order) ? snapshot.sort_order : null,
                now,
                now,
              );
            }
          }

          if (revision.entity_type === "STYLE_ITEM") {
            table = "style_items";
            payload = {
              name: snapshot.name,
              description: snapshot.description,
              price: snapshot.price,
              duration_minutes: snapshot.duration_minutes,
              media_id: snapshot.media_id,
              category: snapshot.category,
            };
            existing = db.prepare("SELECT version FROM style_items WHERE id = ?").get(revision.entity_id);
            if (existing) {
              db.prepare(
                "UPDATE style_items SET json = ?, published = ?, deleted_at = NULL, version = version + 1, updated_at = ? WHERE id = ?",
              ).run(JSON.stringify(payload), snapshot.published === false ? 0 : 1, now, revision.entity_id);
            } else {
              db.prepare(
                "INSERT INTO style_items(id, json, published, version, created_at, updated_at, deleted_at) VALUES (?, ?, ?, 1, ?, ?, NULL)",
              ).run(revision.entity_id, JSON.stringify(payload), snapshot.published === false ? 0 : 1, now, now);
            }
          }

          if (revision.entity_type === "REVIEW_ITEM") {
            table = "review_items";
            payload = {
              author_name: snapshot.author_name,
              rating: snapshot.rating,
              content: snapshot.content,
              source: snapshot.source,
              source_url: snapshot.source_url,
            };
            existing = db.prepare("SELECT version FROM review_items WHERE id = ?").get(revision.entity_id);
            if (existing) {
              db.prepare(
                "UPDATE review_items SET json = ?, published = ?, deleted_at = NULL, version = version + 1, updated_at = ? WHERE id = ?",
              ).run(JSON.stringify(payload), snapshot.published === false ? 0 : 1, now, revision.entity_id);
            } else {
              db.prepare(
                "INSERT INTO review_items(id, json, published, version, created_at, updated_at, deleted_at) VALUES (?, ?, ?, 1, ?, ?, NULL)",
              ).run(revision.entity_id, JSON.stringify(payload), snapshot.published === false ? 0 : 1, now, now);
            }
          }

          let restoredSnapshot = snapshot;
          const newRevisionId = withRevision(db, {
            entity_type: revision.entity_type,
            entity_id: revision.entity_id,
            snapshot,
            summary: ["restore"],
            created_at: now,
          });

          if (revision.entity_type === "GALLERY_ITEM") {
            restoredSnapshot = mapGalleryRow(db.prepare("SELECT * FROM gallery_items WHERE id = ?").get(revision.entity_id));
          }
          if (revision.entity_type === "STYLE_ITEM") {
            restoredSnapshot = mapStyleRow(db.prepare("SELECT * FROM style_items WHERE id = ?").get(revision.entity_id));
          }
          if (revision.entity_type === "REVIEW_ITEM") {
            restoredSnapshot = mapReviewRow(db.prepare("SELECT * FROM review_items WHERE id = ?").get(revision.entity_id));
          }

          db.exec("COMMIT");
          if (mode === "restore") {
            sendJson(res, 200, {
              entity_type: revision.entity_type,
              entity_id: revision.entity_id,
              restored_snapshot: restoredSnapshot,
              new_revision_id: newRevisionId,
            });
          } else {
            sendJson(res, 200, { revision_id: revisionId, version: (existing?.version ?? 0) + 1 });
          }
          return;
        }

        db.exec("ROLLBACK");
        sendJson(res, 409, { code: "CONFLICT", message: "Unsupported revision entity type" });
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
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
