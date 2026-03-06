#!/usr/bin/env bash
set -euo pipefail

file="$1"
pattern="$2"

grep -Eq "$pattern" "$file"
