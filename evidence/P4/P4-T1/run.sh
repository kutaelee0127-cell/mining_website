#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "$0")/../../.." && pwd)"
task_dir="${root_dir}/evidence/P4/P4-T1"
actual_dir="${task_dir}/actual/logs"
mkdir -p "$actual_dir"

log_file="${actual_dir}/checks.log"
: > "$log_file"

required_files=(
  "design/derived/pages/gallery.md"
  "design/derived/states/gallery__admin-edit.md"
  "packages/domain/src/gallery/GalleryService.ts"
  "packages/api-server/src/http/gallery/publicGallery.ts"
  "packages/api-server/src/http/gallery/adminGallery.ts"
  "packages/ui/src/routes/gallery/GalleryPage.tsx"
  "packages/ui/src/components/GalleryEditorDrawer.tsx"
  "packages/ui/src/api/gallery.ts"
  "evidence/P4/P4-T1/cases/P4-T1-GALLERY-001.case.yaml"
)

for file in "${required_files[@]}"; do
  if [[ ! -f "${root_dir}/${file}" ]]; then
    echo "missing:${file}" | tee -a "$log_file"
    exit 1
  fi
  echo "ok:${file}" >> "$log_file"
done

if ! grep -q 'msg.galleryEmpty' "${root_dir}/packages/ui/src/routes/gallery/GalleryPage.tsx"; then
  echo "missing:gallery-empty-state" | tee -a "$log_file"
  exit 1
fi
echo "ok:gallery-empty-state" >> "$log_file"

if ! grep -q 'action.delete' "${root_dir}/packages/ui/src/routes/gallery/GalleryPage.tsx"; then
  echo "missing:gallery-admin-delete" | tee -a "$log_file"
  exit 1
fi
echo "ok:gallery-admin-delete" >> "$log_file"

summary_path="${task_dir}/summary.json"
cat > "$summary_path" <<JSON
{
  "piece_id": "P4",
  "task_id": "P4-T1",
  "result": "PASS",
  "pass": true,
  "checks": [
    {
      "name": "p4-t1-files-present",
      "expected": "gallery CRUD scoped files exist",
      "actual_path": "evidence/P4/P4-T1/actual/logs/checks.log",
      "pass": true
    },
    {
      "name": "p4-t1-states-and-admin-actions",
      "expected": "empty state and admin delete action are present",
      "actual_path": "evidence/P4/P4-T1/actual/logs/checks.log",
      "pass": true
    }
  ]
}
JSON

echo "[P4-T1] PASS summary generated at ${summary_path}"
