const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function send(res, status, headers, body) {
  res.writeHead(status, headers);
  res.end(body);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host}`);

  if (url.pathname === '/api/health') {
    const out = { ok: true, ts: new Date().toISOString() };
    return send(res, 200, { 'Content-Type': 'application/json' }, JSON.stringify(out));
  }

  if (url.pathname === '/api/i18n/ko-KR') {
    const p = path.resolve(__dirname, '../../../locales/ko-KR.json');
    const out = readJson(p);
    return send(res, 200, { 'Content-Type': 'application/json' }, JSON.stringify(out));
  }

  if (url.pathname === '/api/i18n/en-US') {
    const p = path.resolve(__dirname, '../../../locales/en-US.json');
    const out = readJson(p);
    return send(res, 200, { 'Content-Type': 'application/json' }, JSON.stringify(out));
  }

  if (url.pathname === '/' || url.pathname === '/index.html') {
    // Minimal root page that uses COPY_KEYS_SSOT keys (no hardcoded UI strings)
    const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>mining_website</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto; background:#0b0b0f; color:#eaeaf0; padding:24px}
    .badge{display:inline-block;padding:6px 10px;border-radius:999px;background:#1f2937;color:#e5e7eb;font-size:12px}
  </style>
</head>
<body>
  <h1 id="brand"></h1>
  <div class="badge" id="health">...</div>
  <script>
    async function main(){
      const dict = await fetch('/api/i18n/ko-KR').then(r=>r.json());
      document.querySelector('#brand').textContent = dict['app.brandName'];
      const health = await fetch('/api/health').then(r=>r.json());
      document.querySelector('#health').textContent = health.ok ? dict['msg.healthOk'] : 'FAIL';
    }
    main();
  </script>
</body>
</html>`;
    return send(res, 200, { 'Content-Type': 'text/html; charset=utf-8' }, html);
  }

  return send(res, 404, { 'Content-Type': 'application/json' }, JSON.stringify({ error: 'NOT_FOUND' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[api-server] listening on :${PORT}`);
});
