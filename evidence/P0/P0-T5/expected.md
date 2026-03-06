# P0-T5 expected

- Goal: Runtime bootstrap. Latest main can start API + UI (dev) and create SQLite DB file.
- DoD:
  - `npm install` at repo root succeeds
  - `npm run dev` starts:
    - API server on :8080
    - UI dev server on :5173
  - Evidence checks:
    - `GET /api/health` returns 200 and indicates sqlite ready
    - `GET http://localhost:5173/` returns 200
    - `data/mining.sqlite` exists
  - Evidence `summary.json` has pass=true and result=PASS
