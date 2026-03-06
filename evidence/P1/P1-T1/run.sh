#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "$0")/../../.." && pwd)"
task_dir="${root_dir}/evidence/P1/P1-T1"
actual_dir="${task_dir}/actual/logs"
mkdir -p "$actual_dir"

source "${root_dir}/scripts/_evidence_lib.sh"

piece_id="P1"
task_id="P1-T1"

log_file="${actual_dir}/checks.log"
: > "$log_file"

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

required_files=(
  "design/derived/pages/__admin_login.md"
  "packages/api-server/src/http/auth/login.ts"
  "packages/api-server/src/http/auth/logout.ts"
  "packages/api-server/src/http/auth/me.ts"
  "packages/api-server/src/http/middleware/auth.ts"
  "packages/domain/src/auth/AuthService.ts"
  "packages/domain/src/user/UserRepository.ts"
  "packages/ui/src/routes/admin/LoginPage.tsx"
  "evidence/P1/P1-T1/expected.md"
  "evidence/P1/P1-T1/cases/P1-T1-AUTH-001.case.yaml"
  "evidence/P1/P1-T1/cases/P1-T1-AUTH-002.case.yaml"
)

files_ok=true
for file in "${required_files[@]}"; do
  if [[ ! -f "${root_dir}/${file}" ]]; then
    echo "missing:${file}" | tee -a "$log_file"
    files_ok=false
    continue
  fi
  echo "ok:${file}" >> "$log_file"
done
append_check "p1-t1-files-and-cases-present" "auth files + evidence files exist" "evidence/P1/P1-T1/actual/logs/checks.log" "$files_ok"

auth_login_ok=true
if ! grep -q "AUTH_INVALID_CREDENTIALS" "${root_dir}/packages/api-server/src/http/auth/login.ts"; then
  echo "missing:invalid-credential-response" | tee -a "$log_file"
  auth_login_ok=false
fi
echo "ok:invalid-credential-response" >> "$log_file"
append_check "p1-t1-login-contract" "login includes AUTH_INVALID_CREDENTIALS marker" "packages/api-server/src/http/auth/login.ts" "$auth_login_ok"

auth_me_ok=true
if ! grep -q "AUTH_REQUIRED" "${root_dir}/packages/api-server/src/http/auth/me.ts"; then
  echo "missing:auth-required-response" | tee -a "$log_file"
  auth_me_ok=false
fi
echo "ok:auth-required-response" >> "$log_file"
append_check "p1-t1-me-contract" "me includes AUTH_REQUIRED marker" "packages/api-server/src/http/auth/me.ts" "$auth_me_ok"

pass=true
result="PASS"
if [[ "$files_ok" != "true" || "$auth_login_ok" != "true" || "$auth_me_ok" != "true" ]]; then
  pass=false
  result="FAIL"
fi

details="P1-T1 backfill evidence run"
(cd "$task_dir" && write_summary_json "$piece_id" "$task_id" "$pass" "$result" "$checks_json" "$details")

echo "[P1-T1] ${result} summary generated at ${task_dir}/summary.json"

if [[ "$pass" != "true" ]]; then
  exit 1
fi
