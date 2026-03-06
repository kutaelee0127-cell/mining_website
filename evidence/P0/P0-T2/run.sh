#!/usr/bin/env bash
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../../.." && pwd)"
cd "$HERE"

source "$ROOT/scripts/_evidence_lib.sh"
export EVID_TS="${EVID_TS:-$(ts_iso)}"

mkdir -p actual/logs

PASS_LIB=false

# Minimal: ensure harness scripts exist and are executable
for f in \
  "$ROOT/scripts/contract/run_cases.sh" \
  "$ROOT/scripts/contract/assert_jq.sh" \
  "$ROOT/scripts/contract/assert_regex.sh" \
  "$ROOT/scripts/contract/write_summary_json.mjs" \
  "$ROOT/scripts/_evidence_lib.sh"; do
  if [[ -f "$f" ]]; then
    echo "OK $f" >> actual/logs/harness_check.log
  else
    echo "MISSING $f" >> actual/logs/harness_check.log
  fi
done

if ! grep -q "MISSING" actual/logs/harness_check.log; then
  PASS_LIB=true
fi

checks=$(PASS_LIB="$PASS_LIB" node - <<'NODE'
const checks=[];
checks.push({name:'harness scripts exist', expected:'all required scripts exist', actual_path:'actual/logs/harness_check.log', pass: process.env.PASS_LIB==='true'});
process.stdout.write(JSON.stringify(checks));
NODE
)

PASS=false
RESULT="FAIL"
if [[ "$PASS_LIB" == "true" ]]; then
  PASS=true
  RESULT="PASS"
fi

PASS_LIB="$PASS_LIB" write_summary_json "P0" "P0-T2" "$PASS" "$RESULT" "$checks" "harness-ready=${PASS_LIB}"

[[ "$PASS" == "true" ]]
