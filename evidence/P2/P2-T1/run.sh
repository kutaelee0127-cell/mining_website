#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "$0")/../../.." && pwd)"
task_dir="${root_dir}/evidence/P2/P2-T1"
actual_dir="${task_dir}/actual/logs"
mkdir -p "$actual_dir"

log_file="${actual_dir}/checks.log"
: > "$log_file"

required_files=(
  "design/derived/pages/home.md"
  "design/derived/states/home__admin-edit.md"
  "packages/domain/src/page/PageService.ts"
  "packages/domain/src/revision/RevisionService.ts"
  "packages/api-server/src/http/pages/publicPages.ts"
  "packages/api-server/src/http/pages/adminPages.ts"
  "packages/ui/src/routes/home/HomePage.tsx"
  "packages/ui/src/components/AdminInlineEditor.tsx"
)

for file in "${required_files[@]}"; do
  if [[ ! -f "${root_dir}/${file}" ]]; then
    echo "missing:${file}" | tee -a "$log_file"
    exit 1
  fi
  echo "ok:${file}" >> "$log_file"
done

if ! grep -q '"/booking"' "${root_dir}/packages/ui/src/routes/home/HomePage.tsx"; then
  echo "missing:booking-cta" | tee -a "$log_file"
  exit 1
fi
echo "ok:booking-cta" >> "$log_file"

if ! grep -q 'hero_title' "${root_dir}/packages/domain/src/page/PageService.ts"; then
  echo "missing:revision-summary-hero-title" | tee -a "$log_file"
  exit 1
fi
echo "ok:revision-summary-hero-title" >> "$log_file"

summary_path="${task_dir}/summary.json"
cat > "$summary_path" <<JSON
{
  "piece_id": "P2",
  "task_id": "P2-T1",
  "result": "PASS",
  "pass": true,
  "checks": [
    {
      "name": "p2-t1-files-present",
      "expected": "home page/admin edit/revision scoped files exist",
      "actual_path": "evidence/P2/P2-T1/actual/logs/checks.log",
      "pass": true
    },
    {
      "name": "p2-t1-cta-and-summary-rule",
      "expected": "home has booking CTA and revision summary includes hero_title",
      "actual_path": "evidence/P2/P2-T1/actual/logs/checks.log",
      "pass": true
    }
  ]
}
JSON

echo "[P2-T1] PASS summary generated at ${summary_path}"
