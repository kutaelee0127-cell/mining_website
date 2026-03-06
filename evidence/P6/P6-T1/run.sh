#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "$0")/../../.." && pwd)"
task_dir="${root_dir}/evidence/P6/P6-T1"
actual_dir="${task_dir}/actual/logs"
mkdir -p "$actual_dir"

log_file="${actual_dir}/checks.log"
: > "$log_file"

required_files=(
  "openapi/openapi.yaml"
  "design/derived/pages/reviews.md"
  "packages/domain/src/review/ReviewService.ts"
  "packages/api-server/src/http/reviews/publicReviews.ts"
  "packages/api-server/src/http/reviews/adminReviews.ts"
  "packages/ui/src/routes/reviews/ReviewsPage.tsx"
  "packages/ui/src/components/ReviewEditorDrawer.tsx"
  "packages/ui/src/api/reviews.ts"
)

for file in "${required_files[@]}"; do
  if [[ ! -f "${root_dir}/${file}" ]]; then
    echo "missing:${file}" | tee -a "$log_file"
    exit 1
  fi
  echo "ok:${file}" >> "$log_file"
done

if ! grep -q 'aria-label={t("field.rating")}' "${root_dir}/packages/ui/src/routes/reviews/ReviewsPage.tsx"; then
  echo "missing:rating-aria-label" | tee -a "$log_file"
  exit 1
fi
echo "ok:rating-aria-label" >> "$log_file"

summary_path="${task_dir}/summary.json"
cat > "$summary_path" <<JSON
{
  "piece_id": "P6",
  "task_id": "P6-T1",
  "result": "PASS",
  "pass": true,
  "checks": [
    {
      "name": "p6-t1-files-present",
      "expected": "reviews CRUD scoped files exist",
      "actual_path": "evidence/P6/P6-T1/actual/logs/checks.log",
      "pass": true
    },
    {
      "name": "p6-t1-rating-a11y",
      "expected": "rating output includes aria-label",
      "actual_path": "evidence/P6/P6-T1/actual/logs/checks.log",
      "pass": true
    }
  ]
}
JSON

echo "[P6-T1] PASS summary generated at ${summary_path}"
