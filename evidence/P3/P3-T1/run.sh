#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "$0")/../../.." && pwd)"
task_dir="${root_dir}/evidence/P3/P3-T1"
actual_dir="${task_dir}/actual/logs"
mkdir -p "$actual_dir"

log_file="${actual_dir}/checks.log"
: > "$log_file"

required_files=(
  "openapi/openapi.yaml"
  "design/derived/states/admin__image-uploader.md"
  "packages/api-server/src/http/media/uploadImage.ts"
  "packages/api-server/src/http/middleware/auth.ts"
  "packages/domain/src/media/MediaService.ts"
  "packages/domain/src/media/MediaRepository.ts"
  "packages/ui/src/components/ImageUploader.tsx"
  "packages/ui/src/api/media.ts"
  "evidence/P3/P3-T1/cases/P3-T1-UPLOAD-001.case.yaml"
)

for file in "${required_files[@]}"; do
  if [[ ! -f "${root_dir}/${file}" ]]; then
    echo "missing:${file}" | tee -a "$log_file"
    exit 1
  fi
  echo "ok:${file}" >> "$log_file"
done

if ! grep -q 'VALIDATION_ERROR' "${root_dir}/packages/api-server/src/http/media/uploadImage.ts"; then
  echo "missing:validation-error-path" | tee -a "$log_file"
  exit 1
fi
echo "ok:validation-error-path" >> "$log_file"

if ! grep -q 'AUTH_REQUIRED' "${root_dir}/packages/api-server/src/http/media/uploadImage.ts"; then
  echo "missing:admin-only-guard" | tee -a "$log_file"
  exit 1
fi
echo "ok:admin-only-guard" >> "$log_file"

if ! grep -q 'findByHash' "${root_dir}/packages/domain/src/media/MediaService.ts"; then
  echo "missing:sha256-dedupe" | tee -a "$log_file"
  exit 1
fi
echo "ok:sha256-dedupe" >> "$log_file"

summary_path="${task_dir}/summary.json"
cat > "$summary_path" <<JSON
{
  "piece_id": "P3",
  "task_id": "P3-T1",
  "result": "PASS",
  "pass": true,
  "checks": [
    {
      "name": "p3-t1-files-present",
      "expected": "upload API/domain/UI/evidence scoped files exist",
      "actual_path": "evidence/P3/P3-T1/actual/logs/checks.log",
      "pass": true
    },
    {
      "name": "p3-t1-guard-validation-dedupe",
      "expected": "admin guard, validation path, and sha256 dedupe markers exist",
      "actual_path": "evidence/P3/P3-T1/actual/logs/checks.log",
      "pass": true
    }
  ]
}
JSON

echo "[P3-T1] PASS summary generated at ${summary_path}"
