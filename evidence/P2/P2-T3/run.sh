#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "$0")/../../.." && pwd)"
task_dir="${root_dir}/evidence/P2/P2-T3"
actual_dir="${task_dir}/actual/logs"
mkdir -p "$actual_dir"

log_file="${actual_dir}/checks.log"
: > "$log_file"

required_files=(
  "design/derived/pages/booking.md"
  "packages/ui/src/routes/booking/BookingPage.tsx"
  "packages/ui/src/components/CtaCard.tsx"
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

if ! grep -q 'target="_blank"' "${root_dir}/packages/ui/src/components/CtaCard.tsx"; then
  echo "missing:cta-target-blank" | tee -a "$log_file"
  exit 1
fi
if ! grep -q 'rel="noopener noreferrer"' "${root_dir}/packages/ui/src/components/CtaCard.tsx"; then
  echo "missing:cta-rel-safety" | tee -a "$log_file"
  exit 1
fi
echo "ok:cta-link-safety" >> "$log_file"

if ! grep -q 'booking_url' "${root_dir}/packages/domain/src/page/PageService.ts"; then
  echo "missing:booking-revision-summary" | tee -a "$log_file"
  exit 1
fi
echo "ok:booking-revision-summary" >> "$log_file"

summary_path="${task_dir}/summary.json"
cat > "$summary_path" <<JSON
{
  "piece_id": "P2",
  "task_id": "P2-T3",
  "result": "PASS",
  "pass": true,
  "checks": [
    {
      "name": "p2-t3-files-present",
      "expected": "booking CTA/admin edit scoped files exist",
      "actual_path": "evidence/P2/P2-T3/actual/logs/checks.log",
      "pass": true
    },
    {
      "name": "p2-t3-link-safety-and-summary",
      "expected": "booking CTA link is safe and booking revision summary exists",
      "actual_path": "evidence/P2/P2-T3/actual/logs/checks.log",
      "pass": true
    }
  ]
}
JSON

echo "[P2-T3] PASS summary generated at ${summary_path}"
