#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "$0")/../../.." && pwd)"
task_dir="${root_dir}/evidence/P1/P1-T2"
actual_dir="${task_dir}/actual/logs"
mkdir -p "$actual_dir"

log_file="${actual_dir}/checks.log"
: > "$log_file"

required_files=(
  "design/derived/states/app__admin-bar.md"
  "packages/ui/src/app/AppShell.tsx"
  "packages/ui/src/app/AdminBar.tsx"
  "packages/ui/src/routes/admin/LoginPage.tsx"
  "packages/ui/src/routes/admin/HistoryPage.tsx"
  "packages/ui/src/api/auth.ts"
  "packages/ui/src/tests/nav-hidden-login.spec.ts"
)

for file in "${required_files[@]}"; do
  if [[ ! -f "${root_dir}/${file}" ]]; then
    echo "missing:${file}" | tee -a "$log_file"
    exit 1
  fi
  echo "ok:${file}" >> "$log_file"
done

if grep -q 'href: "/__admin/login"' "${root_dir}/packages/ui/src/routes/Root.tsx"; then
  echo "invalid:public-nav-login-link" | tee -a "$log_file"
  exit 1
fi
echo "ok:hidden-login-route" >> "$log_file"

if ! grep -q 'err.forbidden' "${root_dir}/packages/ui/src/routes/admin/HistoryPage.tsx"; then
  echo "missing:forbidden-ui" | tee -a "$log_file"
  exit 1
fi
echo "ok:forbidden-ui" >> "$log_file"

summary_path="${task_dir}/summary.json"
cat > "$summary_path" <<JSON
{
  "piece_id": "P1",
  "task_id": "P1-T2",
  "result": "PASS",
  "pass": true,
  "checks": [
    {
      "name": "p1-t2-files-present",
      "expected": "admin bar and hidden login scoped files exist",
      "actual_path": "evidence/P1/P1-T2/actual/logs/checks.log",
      "pass": true
    },
    {
      "name": "p1-t2-nav-and-forbidden-rules",
      "expected": "public nav has no login link and revisions page has forbidden state",
      "actual_path": "evidence/P1/P1-T2/actual/logs/checks.log",
      "pass": true
    }
  ]
}
JSON

echo "[P1-T2] PASS summary generated at ${summary_path}"
