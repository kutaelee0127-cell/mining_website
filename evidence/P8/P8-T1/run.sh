#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "$0")/../../.." && pwd)"
task_dir="${root_dir}/evidence/P8/P8-T1"
actual_dir="${task_dir}/actual/logs"
mkdir -p "$actual_dir"

log_file="${actual_dir}/checks.log"
: > "$log_file"

required_files=(
  "docs/ui/COPY_KEYS_SSOT.md"
  "docs/ui/IA_NAV_SSOT.md"
  "packages/ui/src/i18n/locales/ko-KR.json"
  "packages/ui/src/i18n/locales/en-US.json"
  "packages/ui/src/app/LanguageToggle.tsx"
  "packages/ui/src/app/AppShell.tsx"
  "packages/ui/src/i18n/copy-keys.spec.ts"
  "design/derived/states/app__language-toggle.md"
)

for file in "${required_files[@]}"; do
  if [[ ! -f "${root_dir}/${file}" ]]; then
    echo "missing:${file}" | tee -a "$log_file"
    exit 1
  fi
  echo "ok:${file}" >> "$log_file"
done

python3 - "$root_dir" <<'PY'
import json
import sys
from pathlib import Path

root = Path(sys.argv[1])
ko = json.loads((root / 'packages/ui/src/i18n/locales/ko-KR.json').read_text(encoding='utf-8'))
en = json.loads((root / 'packages/ui/src/i18n/locales/en-US.json').read_text(encoding='utf-8'))

required = [
  'nav.home','nav.about','nav.gallery','nav.styles','nav.reviews','nav.booking',
  'action.toggleLanguage','field.language',
  'about.designer.title','about.designer.instagram','about.location.title',
  'admin.history.title',
]

missing_ko = [k for k in required if k not in ko]
missing_en = [k for k in required if k not in en]
if missing_ko or missing_en:
  raise SystemExit(f"missing ko={missing_ko} en={missing_en}")
PY

summary_path="${task_dir}/summary.json"
cat > "$summary_path" <<JSON
{
  "piece_id": "P8",
  "task_id": "P8-T1",
  "result": "PASS",
  "pass": true,
  "checks": [
    {
      "name": "p8-t1-files-present",
      "expected": "language toggle and locale coverage scoped files exist",
      "actual_path": "evidence/P8/P8-T1/actual/logs/checks.log",
      "pass": true
    },
    {
      "name": "p8-t1-nav-page-keys-covered",
      "expected": "nav/page/admin keys exist in both ko/en locale files",
      "actual_path": "evidence/P8/P8-T1/actual/logs/checks.log",
      "pass": true
    }
  ]
}
JSON

echo "[P8-T1] PASS summary generated at ${summary_path}"
