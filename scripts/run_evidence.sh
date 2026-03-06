#!/usr/bin/env bash
set -euo pipefail

# Evidence runner SSOT: docs/mining_website_OpenClaw_Evidence_Playbook_FINAL.md + TDD addendum.
# Creates evidence/summary.json as an aggregate.

scope="full"
selected_task=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --scope) scope="$2"; shift 2;;
    --task) selected_task="$2"; shift 2;;
    *) echo "unknown arg: $1" >&2; exit 2;;
  esac
done

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

mkdir -p evidence/actual/logs

echo "[run_evidence] scope=$scope task=${selected_task:-"-"}"

# Playbook: always run P0 gates. If --task provided, run only that task additionally.
TASKS=("P0/P0-T1" "P0/P0-T2")
if [[ -n "$selected_task" ]]; then
  # Avoid duplicating P0 tasks
  if [[ "$selected_task" != "P0-T1" && "$selected_task" != "P0-T2" ]]; then
    piece="${selected_task%%-*}"
    TASKS+=("${piece}/${selected_task}")
  fi
fi

passes=0
fails=0

ts="$(TZ=Asia/Seoul date -Iseconds)"

tmp_checks="$(mktemp)"
echo '[]' > "$tmp_checks"

append_check() {
  local summary_path="$1"
  local name="$2"
  python3 - "$tmp_checks" "$summary_path" "$name" <<'PY'
import json,sys
out_path, sp, name = sys.argv[1:]
arr=json.load(open(out_path,'r',encoding='utf-8'))
s=json.load(open(sp,'r',encoding='utf-8'))
arr.append({
  'name': name,
  'expected': 'summary.json pass=true and result=PASS',
  'actual_path': sp,
  'pass': bool(s.get('pass')) and s.get('result')=='PASS'
})
open(out_path,'w',encoding='utf-8').write(json.dumps(arr, indent=2, ensure_ascii=False))
PY
}

for pt in "${TASKS[@]}"; do
  piece="${pt%%/*}"
  task="${pt##*/}"
  dir="evidence/${piece}/${task}"

  if [[ ! -f "$dir/run.sh" ]]; then
    echo "[run_evidence] missing $dir/run.sh" | tee -a evidence/actual/logs/run_evidence.log
    fails=$((fails+1))
    continue
  fi

  echo "[run_evidence] run $piece/$task" | tee -a evidence/actual/logs/run_evidence.log
  (cd "$dir" && EVID_TS="$ts" bash run.sh) || true

  if [[ ! -f "$dir/summary.json" ]]; then
    echo "[run_evidence] missing summary.json for $piece/$task" | tee -a evidence/actual/logs/run_evidence.log
    fails=$((fails+1))
    continue
  fi

  pass=$(python3 - <<PY
import json
s=json.load(open('$dir/summary.json','r',encoding='utf-8'))
print('true' if s.get('pass') else 'false')
PY
)
  result=$(python3 - <<PY
import json
s=json.load(open('$dir/summary.json','r',encoding='utf-8'))
print(s.get('result','FAIL'))
PY
)

  echo "[run_evidence] $piece/$task pass=$pass result=$result" | tee -a evidence/actual/logs/run_evidence.log

  append_check "$dir/summary.json" "$piece/$task"

  if [[ "$pass" == "true" && "$result" == "PASS" ]]; then
    passes=$((passes+1))
  else
    fails=$((fails+1))
  fi
done

final_checks=$(cat "$tmp_checks")
rm -f "$tmp_checks"

final_pass=false
final_result=FAIL
if [[ $fails -eq 0 && $passes -ge 2 ]]; then
  final_pass=true
  final_result=PASS
fi

cat > evidence/summary.json <<JSON
{
  "pass": $final_pass,
  "result": "$final_result",
  "scope": "$scope",
  "timestamp": "$ts",
  "checks": $final_checks
}
JSON

echo "[run_evidence] aggregate pass=$final_pass result=$final_result"

if [[ "$final_pass" != "true" ]]; then
  exit 1
fi
