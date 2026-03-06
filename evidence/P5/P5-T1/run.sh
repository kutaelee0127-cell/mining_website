#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "$0")/../../.." && pwd)"
task_dir="${root_dir}/evidence/P5/P5-T1"
actual_dir="${task_dir}/actual/logs"
mkdir -p "$actual_dir"

log_file="${actual_dir}/checks.log"
: > "$log_file"

required_files=(
  "openapi/openapi.yaml"
  "design/derived/pages/styles.md"
  "packages/domain/src/style/StyleService.ts"
  "packages/api-server/src/http/styles/publicStyles.ts"
  "packages/api-server/src/http/styles/adminStyles.ts"
  "packages/ui/src/routes/styles/StylesPage.tsx"
  "packages/ui/src/components/StyleEditorModal.tsx"
  "packages/ui/src/api/styles.ts"
)

for file in "${required_files[@]}"; do
  if [[ ! -f "${root_dir}/${file}" ]]; then
    echo "missing:${file}" | tee -a "$log_file"
    exit 1
  fi
  echo "ok:${file}" >> "$log_file"
done

if ! grep -q 'Intl.NumberFormat' "${root_dir}/packages/ui/src/routes/styles/StylesPage.tsx"; then
  echo "missing:price-format" | tee -a "$log_file"
  exit 1
fi
echo "ok:price-format" >> "$log_file"

summary_path="${task_dir}/summary.json"
cat > "$summary_path" <<JSON
{
  "piece_id": "P5",
  "task_id": "P5-T1",
  "result": "PASS",
  "pass": true,
  "checks": [
    {
      "name": "p5-t1-files-present",
      "expected": "styles CRUD scoped files exist",
      "actual_path": "evidence/P5/P5-T1/actual/logs/checks.log",
      "pass": true
    },
    {
      "name": "p5-t1-price-format-policy",
      "expected": "styles page applies locale-aware currency format",
      "actual_path": "evidence/P5/P5-T1/actual/logs/checks.log",
      "pass": true
    }
  ]
}
JSON

echo "[P5-T1] PASS summary generated at ${summary_path}"
