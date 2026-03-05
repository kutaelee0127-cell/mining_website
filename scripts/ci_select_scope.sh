#!/usr/bin/env bash
set -euo pipefail

# Determine EVIDENCE_SCOPE from git diff against base.
# Usage:
#   scripts/ci_select_scope.sh <base_ref> [<head_ref>]
# Example:
#   scripts/ci_select_scope.sh origin/main HEAD
#
# Outputs:
#   EVIDENCE_SCOPE=<ui|full>
#   SCOPE_REASON=<text>

BASE_REF="${1:-origin/main}"
HEAD_REF="${2:-HEAD}"

# Manual override.
if [[ -n "${EVIDENCE_SCOPE:-}" ]]; then
  echo "EVIDENCE_SCOPE=${EVIDENCE_SCOPE}"
  echo "SCOPE_REASON=manual"
  exit 0
fi

changed="$(git diff --name-only "${BASE_REF}...${HEAD_REF}" || true)"

# Fail-closed if diff unavailable.
if [[ -z "${changed}" ]]; then
  echo "EVIDENCE_SCOPE=full"
  echo "SCOPE_REASON=diff-empty-or-unavailable"
  exit 0
fi

ui_only=true
while IFS= read -r f; do
  [[ -z "$f" ]] && continue

  case "$f" in
    docs/ui/*|design/derived/*|packages/ui/*|packages/ui-kit/*|packages/ui/**|packages/ui-kit/**)
      ;;
    public/*|assets/*|packages/ui/public/*|packages/ui/assets/*)
      ;;
    openapi/*|packages/api/*|packages/server/*|compose.yaml|docker-compose.yml|Dockerfile*|scripts/run_evidence.sh|scripts/run_route_snapshot_harness.sh|evidence/*|db/*|migrations/*|.github/workflows/*)
      ui_only=false
      break
      ;;
    *)
      ui_only=false
      break
      ;;
  esac
done <<< "$changed"

if [[ "${ui_only}" == "true" ]]; then
  echo "EVIDENCE_SCOPE=ui"
  echo "SCOPE_REASON=ui-only-diff"
else
  echo "EVIDENCE_SCOPE=full"
  echo "SCOPE_REASON=non-ui-change"
fi
