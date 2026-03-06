#!/usr/bin/env bash
set -euo pipefail

json_file="$1"
expr="$2"

jq -e "$expr" "$json_file" >/dev/null
