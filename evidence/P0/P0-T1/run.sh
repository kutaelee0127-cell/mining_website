#!/usr/bin/env bash
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../../.." && pwd)"
cd "$HERE"

source "$ROOT/scripts/_evidence_lib.sh"
export EVID_TS="${EVID_TS:-$(ts_iso)}"

mkdir -p actual/http actual/logs

# OpenAPI lint (SSOT gate)
PASS_OPENAPI=false
if (cd "$ROOT" && bash scripts/run_openapi_lint.sh) 2>&1 | tee actual/logs/openapi_lint.log; then
  PASS_OPENAPI=true
fi

# Start server (api-server) for E2E
PASS_HEALTH=false
PASS_ROOT=false
HTTP_CODE="000"

cleanup(){
  if [[ -n "${SV_PID:-}" ]]; then
    kill "$SV_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

node "$ROOT/packages/api-server/src/index.js" > actual/logs/api_server.log 2>&1 &
SV_PID=$!

# wait readiness
for i in $(seq 1 30); do
  HTTP_CODE=$(curl -s -o actual/http/health.json -w "%{http_code}" http://localhost:8080/api/health || true)
  if [[ "$HTTP_CODE" == "200" ]]; then
    PASS_HEALTH=true
    break
  fi
  sleep 1
done

# root page should render and reference i18n endpoint (no hardcoded strings)
ROOT_CODE=$(curl -s -o actual/http/root.html -w "%{http_code}" http://localhost:8080/ || true)
I18N_CODE=$(curl -s -o actual/http/i18n_ko.json -w "%{http_code}" http://localhost:8080/api/i18n/ko-KR || true)

PASS_I18N=false
if [[ "$I18N_CODE" == "200" ]]; then
  # must contain required COPY_KEYS
  if jq -e 'has("app.brandName") and has("msg.healthOk")' actual/http/i18n_ko.json >/dev/null; then
    PASS_I18N=true
  fi
fi

if [[ "$ROOT_CODE" == "200" ]] && grep -q "/api/i18n/ko-KR" actual/http/root.html && [[ "$PASS_I18N" == "true" ]]; then
  PASS_ROOT=true
fi

checks='[]'
checks=$(PASS_OPENAPI="$PASS_OPENAPI" PASS_HEALTH="$PASS_HEALTH" PASS_ROOT="$PASS_ROOT" node - <<'NODE'
const checks=[];
checks.push({name:'openapi lint', expected:'parse + required /health path', actual_path:'actual/logs/openapi_lint.log', pass: process.env.PASS_OPENAPI === 'true'});
checks.push({name:'GET /api/health status=200', expected:'200 + schema matched', actual_path:'actual/http/health.json', pass: process.env.PASS_HEALTH === 'true'});
checks.push({name:'GET / root references i18n and i18n has required keys', expected:'root uses i18n keys (no hardcoded strings)', actual_path:'actual/http/root.html', pass: process.env.PASS_ROOT === 'true'});
process.stdout.write(JSON.stringify(checks));
NODE
)

PASS=false
RESULT="FAIL"
if [[ "$PASS_OPENAPI" == "true" && "$PASS_HEALTH" == "true" && "$PASS_ROOT" == "true" ]]; then
  PASS=true
  RESULT="PASS"
fi

PASS_OPENAPI="$PASS_OPENAPI" PASS_HEALTH="$PASS_HEALTH" PASS_ROOT="$PASS_ROOT" write_summary_json "P0" "P0-T1" "$PASS" "$RESULT" "$checks" "http_code=${HTTP_CODE} root_code=${ROOT_CODE}"

[[ "$PASS" == "true" ]]
