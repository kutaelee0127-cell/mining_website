#!/usr/bin/env bash
set -euo pipefail

scope=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --scope)
      scope="${2:-}"
      shift 2
      ;;
    *)
      echo "unknown arg: $1" >&2
      exit 2
      ;;
  esac
done

if [[ -z "$scope" ]]; then
  echo "missing required --scope <ui|full>" >&2
  exit 2
fi

case "$scope" in
  ui|full)
    ;;
  *)
    echo "invalid scope: $scope" >&2
    exit 2
    ;;
esac

root_dir="$(pwd)"
evidence_root="${root_dir}/evidence"
actual_dir="${evidence_root}/actual/logs"
mkdir -p "$actual_dir"

checks_log="${actual_dir}/ci-checks.log"
: > "$checks_log"

check_paths=(
  "scripts/ci_select_scope.sh"
  "scripts/ci_poll.sh"
  "scripts/run_evidence.sh"
  ".github/workflows/ci.yml"
)

for p in "${check_paths[@]}"; do
  if [[ ! -f "$p" ]]; then
    echo "missing:$p" | tee -a "$checks_log"
    exit 1
  fi
  echo "ok:$p" >> "$checks_log"
done

summary_path="${evidence_root}/summary.json"
cat > "$summary_path" <<JSON
{
  "piece_id": "P0",
  "task_id": "P0-T2",
  "result": "PASS",
  "pass": true,
  "checks": [
    {
      "name": "scope-argument-valid",
      "expected": "scope is ui or full",
      "actual_path": "evidence/actual/logs/ci-checks.log",
      "pass": true
    },
    {
      "name": "ci-required-files-exist",
      "expected": "ci scripts and workflow are present",
      "actual_path": "evidence/actual/logs/ci-checks.log",
      "pass": true
    }
  ],
  "meta": {
    "scope": "$scope"
  }
}
JSON

echo "[run_evidence] scope=$scope summary=${summary_path}"
