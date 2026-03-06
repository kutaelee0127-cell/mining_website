#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "$0")/../../.." && pwd)"
task_dir="${root_dir}/evidence/P1/P1-T1"
actual_dir="${task_dir}/actual/logs"
mkdir -p "$actual_dir"

log_file="${actual_dir}/checks.log"
: > "$log_file"

required_files=(
  "design/derived/pages/__admin_login.md"
  "packages/api-server/src/http/auth/login.ts"
  "packages/api-server/src/http/auth/logout.ts"
  "packages/api-server/src/http/auth/me.ts"
  "packages/api-server/src/http/middleware/auth.ts"
  "packages/domain/src/auth/AuthService.ts"
  "packages/domain/src/user/UserRepository.ts"
  "packages/ui/src/routes/admin/LoginPage.tsx"
)

for file in "${required_files[@]}"; do
  if [[ ! -f "${root_dir}/${file}" ]]; then
    echo "missing:${file}" | tee -a "$log_file"
    exit 1
  fi
  echo "ok:${file}" >> "$log_file"
done

if ! grep -q "AUTH_INVALID_CREDENTIALS" "${root_dir}/packages/api-server/src/http/auth/login.ts"; then
  echo "missing:invalid-credential-response" | tee -a "$log_file"
  exit 1
fi
echo "ok:invalid-credential-response" >> "$log_file"

if ! grep -q "AUTH_REQUIRED" "${root_dir}/packages/api-server/src/http/auth/me.ts"; then
  echo "missing:auth-required-response" | tee -a "$log_file"
  exit 1
fi
echo "ok:auth-required-response" >> "$log_file"

summary_path="${task_dir}/summary.json"
cat > "$summary_path" <<JSON
{
  "piece_id": "P1",
  "task_id": "P1-T1",
  "result": "PASS",
  "pass": true,
  "checks": [
    {
      "name": "p1-t1-files-present",
      "expected": "auth/domain/ui scoped files exist",
      "actual_path": "evidence/P1/P1-T1/actual/logs/checks.log",
      "pass": true
    },
    {
      "name": "p1-t1-auth-error-contract",
      "expected": "login 401 and me 401 error markers exist",
      "actual_path": "evidence/P1/P1-T1/actual/logs/checks.log",
      "pass": true
    }
  ]
}
JSON

echo "[P1-T1] PASS summary generated at ${summary_path}"
