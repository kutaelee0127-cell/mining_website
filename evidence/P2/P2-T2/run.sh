#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "$0")/../../.." && pwd)"
task_dir="${root_dir}/evidence/P2/P2-T2"
actual_dir="${task_dir}/actual/logs"
mkdir -p "$actual_dir"

log_file="${actual_dir}/checks.log"
: > "$log_file"

required_files=(
  "design/derived/pages/about.md"
  "packages/ui/src/routes/about/AboutPage.tsx"
  "packages/ui/src/components/ExternalLinkCard.tsx"
  "packages/api-server/src/http/pages/publicPages.ts"
  "packages/api-server/src/http/pages/adminPages.ts"
  "packages/domain/src/page/PageService.ts"
)

for file in "${required_files[@]}"; do
  if [[ ! -f "${root_dir}/${file}" ]]; then
    echo "missing:${file}" | tee -a "$log_file"
    exit 1
  fi
  echo "ok:${file}" >> "$log_file"
done

if ! grep -q 'target="_blank"' "${root_dir}/packages/ui/src/components/ExternalLinkCard.tsx"; then
  echo "missing:external-target" | tee -a "$log_file"
  exit 1
fi
if ! grep -q 'rel="noopener noreferrer"' "${root_dir}/packages/ui/src/components/ExternalLinkCard.tsx"; then
  echo "missing:external-rel" | tee -a "$log_file"
  exit 1
fi
echo "ok:external-link-safety" >> "$log_file"

if ! grep -q 'about_instagram_url' "${root_dir}/packages/domain/src/page/PageService.ts"; then
  echo "missing:about-revision-summary" | tee -a "$log_file"
  exit 1
fi
echo "ok:about-revision-summary" >> "$log_file"

summary_path="${task_dir}/summary.json"
cat > "$summary_path" <<JSON
{
  "piece_id": "P2",
  "task_id": "P2-T2",
  "result": "PASS",
  "pass": true,
  "checks": [
    {
      "name": "p2-t2-files-present",
      "expected": "about page/admin edit scoped files exist",
      "actual_path": "evidence/P2/P2-T2/actual/logs/checks.log",
      "pass": true
    },
    {
      "name": "p2-t2-link-safety-and-summary",
      "expected": "external links use safe rel and about revision summary exists",
      "actual_path": "evidence/P2/P2-T2/actual/logs/checks.log",
      "pass": true
    }
  ]
}
JSON

echo "[P2-T2] PASS summary generated at ${summary_path}"
