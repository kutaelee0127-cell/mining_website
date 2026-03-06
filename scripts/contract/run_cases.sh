#!/usr/bin/env bash
set -euo pipefail

# Run contract case YAML files against a base URL.
# Usage: scripts/contract/run_cases.sh --base <base_url> --cases <dir>

base=""
cases_dir=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --base) base="$2"; shift 2;;
    --cases) cases_dir="$2"; shift 2;;
    *) echo "unknown arg: $1" >&2; exit 2;;
  esac
done

if [[ -z "$base" || -z "$cases_dir" ]]; then
  echo "need --base and --cases" >&2
  exit 2
fi

mkdir -p actual/http actual/logs

node - <<'NODE'
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const base = process.env.CASE_BASE;
const casesDir = process.env.CASES_DIR;

function listCases(dir){
  return fs.readdirSync(dir).filter(f=>f.endsWith('.case.yaml')).map(f=>path.join(dir,f));
}

const files = listCases(casesDir);
if (files.length === 0) {
  console.error('[cases] no case files');
  process.exit(2);
}

console.log(`[cases] base=${base}`);
console.log(`[cases] files=${files.length}`);
NODE
