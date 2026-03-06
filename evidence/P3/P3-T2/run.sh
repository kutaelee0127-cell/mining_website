#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "$0")/../../.." && pwd)"
task_dir="${root_dir}/evidence/P3/P3-T2"
actual_dir="${task_dir}/actual/logs"
mkdir -p "$actual_dir"

log_file="${actual_dir}/checks.log"
: > "$log_file"

required_files=(
  "openapi/openapi.yaml"
  "design/derived/states/media__responsive.md"
  "packages/api-server/src/http/media/getImage.ts"
  "packages/api-server/src/http/middleware/cache.ts"
  "packages/ui/src/components/ResponsiveImage.tsx"
  "packages/ui/src/components/ImageGrid.tsx"
  "packages/ui/src/routes/gallery/GalleryPage.tsx"
  "packages/ui/src/routes/styles/StylesPage.tsx"
)

for file in "${required_files[@]}"; do
  if [[ ! -f "${root_dir}/${file}" ]]; then
    echo "missing:${file}" | tee -a "$log_file"
    exit 1
  fi
  echo "ok:${file}" >> "$log_file"
done

if ! grep -q 'Cache-Control' "${root_dir}/openapi/openapi.yaml"; then
  echo "missing:cache-control-spec" | tee -a "$log_file"
  exit 1
fi
echo "ok:cache-control-spec" >> "$log_file"

if ! grep -q 'loading="lazy"' "${root_dir}/packages/ui/src/components/ResponsiveImage.tsx"; then
  echo "missing:lazy-loading" | tee -a "$log_file"
  exit 1
fi
echo "ok:lazy-loading" >> "$log_file"

summary_path="${task_dir}/summary.json"
cat > "$summary_path" <<JSON
{
  "piece_id": "P3",
  "task_id": "P3-T2",
  "result": "PASS",
  "pass": true,
  "checks": [
    {
      "name": "p3-t2-files-present",
      "expected": "media delivery optimization scoped files exist",
      "actual_path": "evidence/P3/P3-T2/actual/logs/checks.log",
      "pass": true
    },
    {
      "name": "p3-t2-cache-and-lazy",
      "expected": "openapi cache header and UI lazy-loading are present",
      "actual_path": "evidence/P3/P3-T2/actual/logs/checks.log",
      "pass": true
    }
  ]
}
JSON

echo "[P3-T2] PASS summary generated at ${summary_path}"
