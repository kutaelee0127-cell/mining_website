#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "$0")/../../.." && pwd)"
task_dir="${root_dir}/evidence/P9/P9-T1"
actual_dir="${task_dir}/actual"
log_dir="${actual_dir}/logs"
http_dir="${actual_dir}/http"
mkdir -p "$log_dir" "$http_dir"

source "${root_dir}/scripts/_evidence_lib.sh"

piece_id="P9"
task_id="P9-T1"
base_url="http://127.0.0.1:18081"
db_path="${actual_dir}/mining-p9-t1.sqlite"
log_file="${log_dir}/checks.log"
dev_log="${log_dir}/dev_stack.log"

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
  "pass": sys.argv[5] == "true"
})
print(json.dumps(arr, ensure_ascii=False))
PY
)"
}

pass=true
pid=""

cleanup() {
  if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
    kill "$pid" || true
    wait "$pid" 2>/dev/null || true
  fi
}
trap cleanup EXIT

rm -f "$db_path"

PORT=18081 DB_PATH="$db_path" node "${root_dir}/packages/api-server/src/index.js" >> "$dev_log" 2>&1 &
pid="$!"

health_ok=false
for _ in {1..60}; do
  if curl -sf "${base_url}/api/health" > "${http_dir}/health.json"; then
    health_ok=true
    break
  fi
  sleep 1
done
append_check "p9-t1-health" "stack starts and /api/health responds" "evidence/P9/P9-T1/actual/http/health.json" "$health_ok"
if [[ "$health_ok" != "true" ]]; then
  pass=false
fi

token=""
if [[ "$health_ok" == "true" ]]; then
  curl -sS -X POST "${base_url}/api/auth/login" -H "Content-Type: application/json" -d '{"username":"admin","password":"admin1234!"}' > "${http_dir}/auth_login.json"
  token="$(python3 - "${http_dir}/auth_login.json" <<'PY'
import json,sys
obj=json.load(open(sys.argv[1],'r',encoding='utf-8'))
print(obj.get('tokens',{}).get('access_token',''))
PY
)"
fi
login_ok=false
if [[ -n "$token" ]]; then
  login_ok=true
fi
append_check "p9-t1-login" "admin credentials return token" "evidence/P9/P9-T1/actual/http/auth_login.json" "$login_ok"
if [[ "$login_ok" != "true" ]]; then
  pass=false
fi

public_ok=true
for endpoint in home about gallery/items styles/items reviews/items booking; do
  status="$(curl -sS -o "${http_dir}/public_${endpoint//\//_}.json" -w "%{http_code}" "${base_url}/api/public/${endpoint}")"
  echo "public:${endpoint} status=${status}" >> "$log_file"
  if [[ "$status" != "200" ]]; then
    public_ok=false
  fi
done
append_check "p9-t1-public-pages" "all public page APIs respond 200" "evidence/P9/P9-T1/actual/logs/checks.log" "$public_ok"
if [[ "$public_ok" != "true" ]]; then
  pass=false
fi

crud_ok=true
if [[ "$login_ok" == "true" ]]; then
  now="$(date +%s)"

  s1="$(curl -sS -o "${http_dir}/patch_home.json" -w "%{http_code}" -X PATCH "${base_url}/api/admin/home" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d "{\"hero_title\":{\"ko-KR\":\"홈 ${now}\",\"en-US\":\"Home ${now}\"}}")"
  s2="$(curl -sS -o "${http_dir}/patch_about.json" -w "%{http_code}" -X PATCH "${base_url}/api/admin/about" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d "{\"designer_intro\":{\"ko-KR\":\"소개 ${now}\",\"en-US\":\"About ${now}\"}}")"
  s3="$(curl -sS -o "${http_dir}/patch_booking.json" -w "%{http_code}" -X PATCH "${base_url}/api/admin/booking" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d "{\"booking_url\":\"https://smartstore.naver.com/${now}\"}")"

  g_create="$(curl -sS -o "${http_dir}/gallery_create.json" -w "%{http_code}" -X POST "${base_url}/api/admin/gallery/items" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '{"media_id":"https://example.com/g.jpg","caption":{"ko-KR":"g","en-US":"g"}}')"
  g_id="$(python3 - "${http_dir}/gallery_create.json" <<'PY'
import json,sys
obj=json.load(open(sys.argv[1],'r',encoding='utf-8'))
print(obj.get('id',''))
PY
)"
  g_patch="$(curl -sS -o "${http_dir}/gallery_patch.json" -w "%{http_code}" -X PATCH "${base_url}/api/admin/gallery/items/${g_id}" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '{"caption":{"ko-KR":"g2","en-US":"g2"}}')"
  g_del="$(curl -sS -o "${http_dir}/gallery_delete.json" -w "%{http_code}" -X DELETE "${base_url}/api/admin/gallery/items/${g_id}" -H "Authorization: Bearer ${token}")"

  st_create="$(curl -sS -o "${http_dir}/style_create.json" -w "%{http_code}" -X POST "${base_url}/api/admin/styles/items" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '{"name":{"ko-KR":"s","en-US":"s"},"description":{"ko-KR":"d","en-US":"d"},"price":{"amount":10000,"currency":"KRW"},"category":"ETC"}')"
  st_id="$(python3 - "${http_dir}/style_create.json" <<'PY'
import json,sys
obj=json.load(open(sys.argv[1],'r',encoding='utf-8'))
print(obj.get('id',''))
PY
)"
  st_patch="$(curl -sS -o "${http_dir}/style_patch.json" -w "%{http_code}" -X PATCH "${base_url}/api/admin/styles/items/${st_id}" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '{"name":{"ko-KR":"s2","en-US":"s2"}}')"
  st_del="$(curl -sS -o "${http_dir}/style_delete.json" -w "%{http_code}" -X DELETE "${base_url}/api/admin/styles/items/${st_id}" -H "Authorization: Bearer ${token}")"

  r_create="$(curl -sS -o "${http_dir}/review_create.json" -w "%{http_code}" -X POST "${base_url}/api/admin/reviews/items" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '{"author_name":"u","content":{"ko-KR":"c","en-US":"c"},"source":"MANUAL","rating":5}')"
  r_id="$(python3 - "${http_dir}/review_create.json" <<'PY'
import json,sys
obj=json.load(open(sys.argv[1],'r',encoding='utf-8'))
print(obj.get('id',''))
PY
)"
  r_patch="$(curl -sS -o "${http_dir}/review_patch.json" -w "%{http_code}" -X PATCH "${base_url}/api/admin/reviews/items/${r_id}" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '{"author_name":"u2"}')"
  r_del="$(curl -sS -o "${http_dir}/review_delete.json" -w "%{http_code}" -X DELETE "${base_url}/api/admin/reviews/items/${r_id}" -H "Authorization: Bearer ${token}")"

  if [[ "$s1" != "200" || "$s2" != "200" || "$s3" != "200" || "$g_create" != "201" || "$g_patch" != "200" || "$g_del" != "204" || "$st_create" != "201" || "$st_patch" != "200" || "$st_del" != "204" || "$r_create" != "201" || "$r_patch" != "200" || "$r_del" != "204" ]]; then
    crud_ok=false
  fi

  curl -sS -H "Authorization: Bearer ${token}" "${base_url}/api/admin/revisions" > "${http_dir}/revisions.json"
  restore_id="$(python3 - "${http_dir}/revisions.json" <<'PY'
import json,sys
obj=json.load(open(sys.argv[1],'r',encoding='utf-8'))
items=obj.get('items',[])
print(items[0]['id'] if items else '')
PY
)"
  restore_ok=false
  if [[ -n "$restore_id" ]]; then
    restore_status="$(curl -sS -o "${http_dir}/restore.json" -w "%{http_code}" -X POST "${base_url}/api/admin/revisions/${restore_id}/restore" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '{}')"
    if [[ "$restore_status" == "200" ]]; then
      restore_ok=true
    fi
  fi
  append_check "p9-t1-revision-restore" "revision restore endpoint works" "evidence/P9/P9-T1/actual/http/restore.json" "$restore_ok"
  if [[ "$restore_ok" != "true" ]]; then
    pass=false
  fi
fi

append_check "p9-t1-admin-crud" "admin can edit pages and CRUD gallery/styles/reviews" "evidence/P9/P9-T1/actual/logs/checks.log" "$crud_ok"
if [[ "$crud_ok" != "true" ]]; then
  pass=false
fi

neg_ok=false
neg_status="$(curl -sS -o "${http_dir}/unauthorized_about_patch.json" -w "%{http_code}" -X PATCH "${base_url}/api/admin/about" -H "Content-Type: application/json" -d '{"designer_intro":{"ko-KR":"x"}}')"
if [[ "$neg_status" == "401" || "$neg_status" == "403" ]]; then
  neg_ok=true
fi
append_check "p9-t1-negative-unauthorized" "unauthorized admin writes blocked" "evidence/P9/P9-T1/actual/http/unauthorized_about_patch.json" "$neg_ok"
if [[ "$neg_ok" != "true" ]]; then
  pass=false
fi

result="PASS"
if [[ "$pass" != "true" ]]; then
  result="FAIL"
fi

details="P9-T1 full usable e2e pages/admin/revisions evidence"
(cd "$task_dir" && write_summary_json "$piece_id" "$task_id" "$pass" "$result" "$checks_json" "$details")

echo "[P9-T1] ${result} summary generated at ${task_dir}/summary.json"
if [[ "$pass" != "true" ]]; then
  exit 1
fi
