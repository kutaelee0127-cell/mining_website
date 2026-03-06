# P0-T1 expected

- Goal: OpenAPI SSOT gate + smallest E2E /health (server+UI)
- DoD:
  - OpenAPI lint passes
  - `GET /api/health` returns 200
  - Evidence `summary.json`: pass=true AND result=PASS

> Note: This repo currently contains SSOT and harness only. If /api/health server is not implemented yet, this task must remain FAIL (fail-closed).
