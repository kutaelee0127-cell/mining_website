#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "$0")/../../.." && pwd)"
task_dir="${root_dir}/evidence/P0/P0-T4"
actual_dir="${task_dir}/actual/logs"
mkdir -p "$actual_dir"

log_file="${actual_dir}/checks.log"
: > "$log_file"

required_files=(
  "design/derived/states/root__i18n-toggle.md"
  "packages/ui/src/i18n/index.ts"
  "packages/ui/src/i18n/locales/ko-KR.json"
  "packages/ui/src/i18n/locales/en-US.json"
  "packages/ui/src/i18n/copy-keys.spec.ts"
  "packages/ui-kit/src/i18n/index.ts"
  "packages/ui/src/routes/Root.tsx"
)

for file in "${required_files[@]}"; do
  if [[ ! -f "${root_dir}/${file}" ]]; then
    echo "missing:${file}" | tee -a "$log_file"
    exit 1
  fi
  echo "ok:${file}" >> "$log_file"
done

python3 - <<'PY'
import json
import re
from pathlib import Path

root = Path("/home/mining/dev/mining_website")
copy_md = (root / "docs/ui/COPY_KEYS_SSOT.md").read_text(encoding="utf-8")
ko = json.loads((root / "packages/ui/src/i18n/locales/ko-KR.json").read_text(encoding="utf-8"))
en = json.loads((root / "packages/ui/src/i18n/locales/en-US.json").read_text(encoding="utf-8"))

prefixes = ("app.", "nav.", "action.", "msg.", "err.", "field.", "status.")
keys = []
for line in copy_md.splitlines():
    line = line.strip()
    if not line.startswith("|") or "|---" in line:
        continue
    cols = [c.strip() for c in line.split("|") if c.strip()]
    if not cols or cols[0] == "key":
        continue
    key = cols[0]
    if key.startswith(prefixes):
        keys.append(key)

keys = sorted(set(keys))
missing_ko = [k for k in keys if k not in ko]
missing_en = [k for k in keys if k not in en]

log_path = root / "evidence/P0/P0-T4/actual/logs/coverage.log"
with log_path.open("w", encoding="utf-8") as fp:
    fp.write(f"total_required={len(keys)}\n")
    fp.write(f"missing_ko={len(missing_ko)}\n")
    fp.write(f"missing_en={len(missing_en)}\n")
    if missing_ko:
        fp.write("missing_ko_keys=" + ",".join(missing_ko) + "\n")
    if missing_en:
        fp.write("missing_en_keys=" + ",".join(missing_en) + "\n")

if missing_ko or missing_en:
    raise SystemExit(1)
PY

summary_path="${task_dir}/summary.json"
cat > "$summary_path" <<JSON
{
  "piece_id": "P0",
  "task_id": "P0-T4",
  "result": "PASS",
  "pass": true,
  "checks": [
    {
      "name": "i18n-scaffold-files-exist",
      "expected": "P0-T4 scoped files are present",
      "actual_path": "evidence/P0/P0-T4/actual/logs/checks.log",
      "pass": true
    },
    {
      "name": "copy-keys-coverage",
      "expected": "COPY_KEYS baseline namespaces are fully covered in ko-KR/en-US locale JSON",
      "actual_path": "evidence/P0/P0-T4/actual/logs/coverage.log",
      "pass": true
    }
  ]
}
JSON

echo "[P0-T4] PASS summary generated at ${summary_path}"
