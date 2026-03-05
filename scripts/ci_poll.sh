#!/usr/bin/env bash
set -euo pipefail

# Poll GitHub Actions for a branch or PR.
# Requirements: gh + jq, gh auth already configured.
#
# Usage:
#   scripts/ci_poll.sh --branch <branch> [--interval 300] [--timeout 3600]
#   scripts/ci_poll.sh --pr <number> [--interval 300] [--timeout 3600]

interval=300
timeout=3600
branch=""
pr=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --interval) interval="$2"; shift 2;;
    --timeout) timeout="$2"; shift 2;;
    --branch) branch="$2"; shift 2;;
    --pr) pr="$2"; shift 2;;
    *) echo "unknown arg: $1" >&2; exit 2;;
  esac
done

if [[ -z "$branch" && -z "$pr" ]]; then
  echo "need --branch or --pr" >&2
  exit 2
fi

if [[ -n "$pr" ]]; then
  branch="$(gh pr view "$pr" --json headRefName -q .headRefName)"
fi

start_ts="$(date +%s)"
echo "[ci_poll] branch=$branch interval=${interval}s timeout=${timeout}s"

while true; do
  now="$(date +%s)"
  elapsed=$((now - start_ts))
  if (( elapsed > timeout )); then
    echo "[ci_poll] TIMEOUT after ${elapsed}s"
    exit 1
  fi

  run_json="$(gh run list --branch "$branch" --limit 1 --json databaseId,status,conclusion,url,createdAt -q '.[0]')"
  if [[ -z "$run_json" || "$run_json" == "null" ]]; then
    echo "[ci_poll] no runs found yet; sleeping..."
    sleep "$interval"
    continue
  fi

  run_id="$(echo "$run_json" | jq -r '.databaseId')"
  status="$(echo "$run_json" | jq -r '.status')"
  conclusion="$(echo "$run_json" | jq -r '.conclusion')"
  url="$(echo "$run_json" | jq -r '.url')"

  echo "[ci_poll] run_id=$run_id status=$status conclusion=$conclusion url=$url"

  if [[ "$status" == "completed" ]]; then
    if [[ "$conclusion" == "success" ]]; then
      exit 0
    else
      echo "[ci_poll] FAILED: conclusion=$conclusion"
      gh run view "$run_id" --log-failed || true
      exit 1
    fi
  fi

  sleep "$interval"
done
