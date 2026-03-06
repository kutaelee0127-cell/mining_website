#!/usr/bin/env bash
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../../.." && pwd)"
cd "$HERE"

source "$ROOT/scripts/_evidence_lib.sh"
export EVID_TS="${EVID_TS:-$(ts_iso)}"

mkdir -p actual/logs actual/http actual/fs

# Start dev stack
cleanup(){
  if [[ -n "${DEV_PID:-}" ]]; then
    kill "$DEV_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

(cd "$ROOT" && npm install) 2>&1 | tee actual/logs/npm_install.log

node "$ROOT/scripts/dev.mjs" > actual/logs/dev_stack.log 2>&1 &
DEV_PID=$!

PASS_API=false
PASS_UI=false
PASS_DB=false

# wait api
for i in $(seq 1 40); do
  CODE=$(curl -s -o actual/http/health.json -w "%{http_code}" http://localhost:8080/api/health || true)
  if [[ "$CODE" == "200" ]]; then
    if jq -e '.db.ok == true' actual/http/health.json >/dev/null 2>&1; then
      PASS_API=true
      break
    fi
  fi
  sleep 1
done

# wait ui
for i in $(seq 1 40); do
  UCODE=$(curl -s -o actual/http/ui_root.html -w "%{http_code}" http://localhost:5173/ || true)
  if [[ "$UCODE" == "200" ]]; then
    PASS_UI=true
    break
  fi
  sleep 1
done

# check db file
if [[ -f "$ROOT/data/mining.sqlite" ]]; then
  PASS_DB=true
  sha256sum "$ROOT/data/mining.sqlite" > actual/fs/mining.sqlite.sha256 || true
fi

checks=$(PASS_API="$PASS_API" PASS_UI="$PASS_UI" PASS_DB="$PASS_DB" node - <<'NODE'
const checks=[];
checks.push({name:'API /health 200 + sqlite ready', expected:'200 and db.ok=true', actual_path:'actual/http/health.json', pass: process.env.PASS_API==='true'});
checks.push({name:'UI / returns 200', expected:'http 200', actual_path:'actual/http/ui_root.html', pass: process.env.PASS_UI==='true'});
checks.push({name:'sqlite file exists', expected:'data/mining.sqlite exists', actual_path:'actual/fs/mining.sqlite.sha256', pass: process.env.PASS_DB==='true'});
process.stdout.write(JSON.stringify(checks));
NODE
)

PASS=false
RESULT=FAIL
if [[ "$PASS_API" == "true" && "$PASS_UI" == "true" && "$PASS_DB" == "true" ]]; then
  PASS=true
  RESULT=PASS
fi

write_summary_json "P0" "P0-T5" "$PASS" "$RESULT" "$checks" "api=${PASS_API} ui=${PASS_UI} db=${PASS_DB}"

[[ "$PASS" == "true" ]]
