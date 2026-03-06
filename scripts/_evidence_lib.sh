#!/usr/bin/env bash
set -euo pipefail

# Common helpers for evidence scripts.

here_dir() {
  cd "$(dirname "${BASH_SOURCE[0]}")" && pwd
}

ts_iso() {
  TZ=Asia/Seoul date -Iseconds
}

write_summary_json() {
  # args: piece task pass result checks_json details
  local piece="$1" task="$2" pass="$3" result="$4" checks_json="$5" details="$6"

  python3 - "$piece" "$task" "$pass" "$result" "$checks_json" "$details" <<'PY'
import json, os, sys
piece, task, p, result, checks_json, details = sys.argv[1:]
out = {
  'piece_id': piece,
  'task_id': task,
  'pass': True if p == 'true' else False,
  'result': result,
  'timestamp': os.environ.get('EVID_TS'),
  'checks': json.loads(checks_json),
  'details': details,
}
open('summary.json','w',encoding='utf-8').write(json.dumps(out, indent=2, ensure_ascii=False)+"\n")
PY
}
