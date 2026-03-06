#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "$0")/../../.." && pwd)"
task_dir="${root_dir}/evidence/P2/P2-T1"
actual_dir="${task_dir}/actual"
log_dir="${actual_dir}/logs"
http_dir="${actual_dir}/http"
mkdir -p "$log_dir" "$http_dir"

source "${root_dir}/scripts/_evidence_lib.sh"

piece_id="P2"
task_id="P2-T1"
log_file="${log_dir}/checks.log"
dev_log="${log_dir}/dev_stack.log"
summary_path="${task_dir}/summary.json"
base_url="http://127.0.0.1:18080"
db_path="${actual_dir}/mining-p2-t1.sqlite"

: > "$log_file"
: > "$dev_log"

checks_json='[]'
append_check() {
  local name="$1" expected="$2" actual_path="$3" pass="$4"
  checks_json="$(python3 - "$checks_json" "$name" "$expected" "$actual_path" "$pass" <<'PY'
import json,sys
arr=json.loads(sys.argv[1])
arr.append({
  "name": sys.argv[2],
  "expected": sys.argv[3],
  "actual_path": sys.argv[4],
  "pass": sys.argv[5] == "true",
})
print(json.dumps(arr, ensure_ascii=False))
PY
)"
}

pass=true
stack_pid=""

cleanup() {
  if [[ -n "$stack_pid" ]] && kill -0 "$stack_pid" 2>/dev/null; then
    kill "$stack_pid" || true
    wait "$stack_pid" 2>/dev/null || true
  fi
}
trap cleanup EXIT

start_api() {
  PORT=18080 DB_PATH="$db_path" node "${root_dir}/packages/api-server/src/index.js" >> "$dev_log" 2>&1 &
  stack_pid="$!"
}

required_files=(
  "evidence/P2/P2-T1/expected.md"
  "evidence/P2/P2-T1/cases/P2-T1-HAPPY-001.case.yaml"
  "evidence/P2/P2-T1/cases/P2-T1-NEG-001.case.yaml"
)
files_ok=true
for file in "${required_files[@]}"; do
  if [[ ! -f "${root_dir}/${file}" ]]; then
    echo "missing:${file}" | tee -a "$log_file"
    files_ok=false
  else
    echo "ok:${file}" >> "$log_file"
  fi
done
append_check "p2-t1-evidence-files" "expected.md + 2 case yamls exist" "evidence/P2/P2-T1/actual/logs/checks.log" "$files_ok"
if [[ "$files_ok" != "true" ]]; then
  pass=false
fi

rm -f "$db_path"
start_api

health_ok=false
for _ in {1..60}; do
  if curl -sf "${base_url}/api/health" > "${http_dir}/health.json"; then
    health_ok=true
    break
  fi
  sleep 1
done
append_check "p2-t1-stack-health" "dev stack starts and /api/health responds" "evidence/P2/P2-T1/actual/http/health.json" "$health_ok"
if [[ "$health_ok" != "true" ]]; then
  pass=false
fi

token=""
if [[ "$health_ok" == "true" ]]; then
  curl -sS -X POST "${base_url}/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin1234!"}' \
    > "${http_dir}/auth_login.json"

  token="$(python3 - "${http_dir}/auth_login.json" <<'PY'
import json,sys
obj=json.load(open(sys.argv[1],'r',encoding='utf-8'))
print(obj.get('access_token',''))
PY
)"
fi

login_ok=false
if [[ -n "$token" ]]; then
  login_ok=true
fi
append_check "p2-t1-login" "admin hidden route credentials can obtain bearer token" "evidence/P2/P2-T1/actual/http/auth_login.json" "$login_ok"
if [[ "$login_ok" != "true" ]]; then
  pass=false
fi

happy_ok=false
if [[ "$login_ok" == "true" ]]; then
  next_title="P2-T1 Hero $(date +%s)"
  next_subtitle="Persistent subtitle $(date +%s)"

  patch_status="$(curl -sS -o "${http_dir}/admin_home_patch.json" -w "%{http_code}" \
    -X PATCH "${base_url}/api/admin/home" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${token}" \
    -d "{\"hero_title\":{\"ko-KR\":\"${next_title}\",\"en-US\":\"${next_title}\"},\"hero_subtitle\":{\"ko-KR\":\"${next_subtitle}\",\"en-US\":\"${next_subtitle}\"}}")"

  curl -sS "${base_url}/api/public/home" > "${http_dir}/public_home_after_patch.json"
  curl -sS -H "Authorization: Bearer ${token}" "${base_url}/api/admin/revisions" > "${http_dir}/admin_revisions.json"

  title_matches="$(python3 - "${http_dir}/admin_home_patch.json" "${http_dir}/public_home_after_patch.json" <<'PY'
import json,sys
patched=json.load(open(sys.argv[1],'r',encoding='utf-8'))
public=json.load(open(sys.argv[2],'r',encoding='utf-8'))
print('true' if patched.get('hero_title') and patched.get('hero_title')==public.get('hero_title') else 'false')
PY
)"
  revision_has_entry="$(python3 - "${http_dir}/admin_revisions.json" <<'PY'
import json,sys
obj=json.load(open(sys.argv[1],'r',encoding='utf-8'))
items=obj.get('items',[])
ok=False
for item in items:
  if item.get('entity_type')=='home' and 'hero_title' in item.get('summary',[]):
    ok=True
    break
print('true' if ok else 'false')
PY
)"

  if [[ "$patch_status" == "200" && "$title_matches" == "true" && "$revision_has_entry" == "true" ]]; then
    happy_ok=true
  fi

  echo "case:P2-T1-HAPPY-001 status=${patch_status} title_match=${title_matches} revision=${revision_has_entry}" >> "$log_file"

  kill "$stack_pid" || true
  wait "$stack_pid" 2>/dev/null || true
  stack_pid=""

  start_api

  restart_health=false
  for _ in {1..40}; do
    if curl -sf "${base_url}/api/health" > "${http_dir}/health_restart.json"; then
      restart_health=true
      break
    fi
    sleep 1
  done

  persistence_ok=false
  if [[ "$restart_health" == "true" ]]; then
    curl -sS "${base_url}/api/public/home" > "${http_dir}/public_home_after_restart.json"
    persistence_ok="$(python3 - "${http_dir}/public_home_after_patch.json" "${http_dir}/public_home_after_restart.json" <<'PY'
import json,sys
before=json.load(open(sys.argv[1],'r',encoding='utf-8'))
after=json.load(open(sys.argv[2],'r',encoding='utf-8'))
print('true' if before.get('hero_title')==after.get('hero_title') and before.get('hero_subtitle')==after.get('hero_subtitle') else 'false')
PY
)"
  fi

  if [[ "$persistence_ok" == "true" ]]; then
    happy_ok=true
  else
    happy_ok=false
  fi
fi

append_check "p2-t1-happy-flow" "admin login -> PATCH /admin/home -> GET /public/home reflects update + revision entry + persists across restart" "evidence/P2/P2-T1/actual/http/public_home_after_restart.json" "$happy_ok"
if [[ "$happy_ok" != "true" ]]; then
  pass=false
fi

negative_ok=false
if [[ "$health_ok" == "true" ]]; then
  unauthorized_status="$(curl -sS -o "${http_dir}/admin_home_unauthorized.json" -w "%{http_code}" \
    -X PATCH "${base_url}/api/admin/home" \
    -H "Content-Type: application/json" \
    -d '{"hero_title":{"ko-KR":"should fail"}}')"
  if [[ "$unauthorized_status" == "401" || "$unauthorized_status" == "403" ]]; then
    negative_ok=true
  fi
  echo "case:P2-T1-NEG-001 status=${unauthorized_status}" >> "$log_file"
fi

append_check "p2-t1-negative-unauthorized-write" "unauth visitor cannot PATCH /admin/home (401/403)" "evidence/P2/P2-T1/actual/http/admin_home_unauthorized.json" "$negative_ok"
if [[ "$negative_ok" != "true" ]]; then
  pass=false
fi

result="PASS"
if [[ "$pass" != "true" ]]; then
  result="FAIL"
fi

details="P2-T1 real home admin edit + sqlite persistence + revision evidence"
(cd "$task_dir" && write_summary_json "$piece_id" "$task_id" "$pass" "$result" "$checks_json" "$details")

echo "[P2-T1] ${result} summary generated at ${summary_path}"
if [[ "$pass" != "true" ]]; then
  exit 1
fi
