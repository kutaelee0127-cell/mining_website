#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "$0")/../../.." && pwd)"
task_dir="${root_dir}/evidence/P0/P0-T3"
actual_dir="${task_dir}/actual/logs"
mkdir -p "$actual_dir"

log_file="${actual_dir}/checks.log"
: > "$log_file"

required_files=(
  "design/derived/states/root__theme-toggle.md"
  "packages/ui-kit/src/tokens/theme.css"
  "packages/ui-kit/src/components/ThemeProvider.tsx"
  "packages/ui-kit/src/components/ThemeToggle.tsx"
  "packages/ui/src/app/AppShell.tsx"
  "packages/ui/src/routes/Root.tsx"
  "packages/ui/src/state/theme.ts"
)

for file in "${required_files[@]}"; do
  if [[ ! -f "${root_dir}/${file}" ]]; then
    echo "missing:${file}" | tee -a "$log_file"
    exit 1
  fi
  echo "ok:${file}" >> "$log_file"
done

for key in action.toggleTheme status.themeDark status.themeLight; do
  if ! grep -q "$key" "${root_dir}/docs/ui/COPY_KEYS_SSOT.md"; then
    echo "missing-key:${key}" | tee -a "$log_file"
    exit 1
  fi
  echo "ok-key:${key}" >> "$log_file"
done

summary_path="${task_dir}/summary.json"
cat > "$summary_path" <<JSON
{
  "piece_id": "P0",
  "task_id": "P0-T3",
  "result": "PASS",
  "pass": true,
  "checks": [
    {
      "name": "required-theme-files-exist",
      "expected": "theme scaffold files are present",
      "actual_path": "evidence/P0/P0-T3/actual/logs/checks.log",
      "pass": true
    },
    {
      "name": "copy-keys-extended",
      "expected": "COPY_KEYS_SSOT contains action.toggleTheme and theme status keys",
      "actual_path": "evidence/P0/P0-T3/actual/logs/checks.log",
      "pass": true
    }
  ]
}
JSON

echo "[P0-T3] PASS summary generated at ${summary_path}"
