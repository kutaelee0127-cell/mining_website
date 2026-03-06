#!/usr/bin/env bash
set -euo pipefail

# Minimal OpenAPI lint for SSOT gate.
# Fail-closed: if parsing fails or required keys missing => fail.

node - <<'NODE'
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const p = path.resolve(process.cwd(), 'openapi/openapi.yaml');
const raw = fs.readFileSync(p, 'utf8');
const doc = yaml.load(raw);

function assert(cond, msg) {
  if (!cond) {
    console.error('[openapi:lint] FAIL:', msg);
    process.exit(1);
  }
}

assert(doc && typeof doc === 'object', 'openapi is not an object');
assert(doc.openapi && String(doc.openapi).startsWith('3.'), 'openapi version missing');
assert(doc.info && doc.info.title, 'info.title missing');
assert(doc.paths && typeof doc.paths === 'object', 'paths missing');

// Required by Playbook P0-T1
assert(doc.paths['/health'] && doc.paths['/health'].get, 'paths./health.get missing');

console.log('[openapi:lint] PASS');
NODE
