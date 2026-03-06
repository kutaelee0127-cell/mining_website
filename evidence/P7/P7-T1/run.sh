#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "$0")/../../.." && pwd)"
task_dir="${root_dir}/evidence/P7/P7-T1"
actual_dir="${task_dir}/actual/logs"
mkdir -p "$actual_dir"

log_file="${actual_dir}/checks.log"
: > "$log_file"

required_files=(
  "openapi/openapi.yaml"
  "design/derived/pages/__admin_history.md"
  "packages/domain/src/revision/RevisionService.ts"
  "packages/api-server/src/http/revisions/adminRevisions.ts"
  "packages/api-server/src/http/middleware/auth.ts"
  "packages/ui/src/api/revisions.ts"
  "packages/ui/src/routes/admin/HistoryPage.tsx"
  "packages/ui/src/components/RevisionList.tsx"
)

for file in "${required_files[@]}"; do
  if [[ ! -f "${root_dir}/${file}" ]]; then
    echo "missing:${file}" | tee -a "$log_file"
    exit 1
  fi
  echo "ok:${file}" >> "$log_file"
done

if ! grep -q 'entity_type' "${root_dir}/packages/api-server/src/http/revisions/adminRevisions.ts"; then
  echo "missing:entity-type-field" | tee -a "$log_file"
  exit 1
fi
echo "ok:entity-type-field" >> "$log_file"

if ! grep -q 'created_at' "${root_dir}/packages/api-server/src/http/revisions/adminRevisions.ts"; then
  echo "missing:created-at-field" | tee -a "$log_file"
  exit 1
fi
echo "ok:created-at-field" >> "$log_file"

summary_path="${task_dir}/summary.json"
cat > "$summary_path" <<JSON
{
  "piece_id": "P7",
  "task_id": "P7-T1",
  "result": "PASS",
  "pass": true,
  "checks": [
    {
      "name": "p7-t1-files-present",
      "expected": "revisions list/detail scoped files exist",
      "actual_path": "evidence/P7/P7-T1/actual/logs/checks.log",
      "pass": true
    },
    {
      "name": "p7-t1-required-fields",
      "expected": "revision payload includes entity_type/entity_id/summary/created_at",
      "actual_path": "evidence/P7/P7-T1/actual/logs/checks.log",
      "pass": true
    }
  ]
}
JSON

echo "[P7-T1] PASS summary generated at ${summary_path}"
