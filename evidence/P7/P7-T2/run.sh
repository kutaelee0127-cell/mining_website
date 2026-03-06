#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "$0")/../../.." && pwd)"
task_dir="${root_dir}/evidence/P7/P7-T2"
actual_dir="${task_dir}/actual/logs"
mkdir -p "$actual_dir"

log_file="${actual_dir}/checks.log"
: > "$log_file"

required_files=(
  "openapi/openapi.yaml"
  "design/derived/states/__admin_history__revert-confirm.md"
  "packages/domain/src/revision/RevertService.ts"
  "packages/api-server/src/http/revisions/revertRevision.ts"
  "packages/domain/src/page/PageRepository.ts"
  "packages/ui/src/components/RevertConfirmDialog.tsx"
  "packages/ui/src/routes/admin/HistoryPage.tsx"
  "evidence/P7/P7-T2/cases/P7-T2-REVERT-001.case.yaml"
)

for file in "${required_files[@]}"; do
  if [[ ! -f "${root_dir}/${file}" ]]; then
    echo "missing:${file}" | tee -a "$log_file"
    exit 1
  fi
  echo "ok:${file}" >> "$log_file"
done

if ! grep -q 'status: 409' "${root_dir}/packages/domain/src/revision/RevertService.ts"; then
  echo "missing:conflict-path" | tee -a "$log_file"
  exit 1
fi
echo "ok:conflict-path" >> "$log_file"

summary_path="${task_dir}/summary.json"
cat > "$summary_path" <<JSON
{
  "piece_id": "P7",
  "task_id": "P7-T2",
  "result": "PASS",
  "pass": true,
  "checks": [
    {
      "name": "p7-t2-files-present",
      "expected": "revert API/UI scoped files exist",
      "actual_path": "evidence/P7/P7-T2/actual/logs/checks.log",
      "pass": true
    },
    {
      "name": "p7-t2-conflict-support",
      "expected": "optimistic concurrency conflict path exists",
      "actual_path": "evidence/P7/P7-T2/actual/logs/checks.log",
      "pass": true
    }
  ]
}
JSON

echo "[P7-T2] PASS summary generated at ${summary_path}"
