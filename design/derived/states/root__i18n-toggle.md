# i18n toggle baseline (derived)

Status: FINAL
Route: `/`

## Goal
- Provide a minimal global language toggle for `ko-KR` and `en-US`.
- Persist language preference across refresh.

## Behavior
- Default language: `ko-KR`.
- Storage key: `mining.lang`.
- Toggle action switches `ko-KR <-> en-US`.
- All static UI strings must be resolved via `t(key)` from locale dictionaries.

## Coverage rule
- COPY keys in baseline namespaces must exist in both locale JSON files:
  - `app.*`
  - `nav.*`
  - `action.*`
  - `msg.*`
  - `err.*`
  - `field.*`
  - `status.*`

## Acceptance notes
- Language toggle works on `/` and survives refresh.
- Missing copy key in locale files fails `copy-keys.spec.ts`.
