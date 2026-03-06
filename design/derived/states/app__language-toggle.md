# App language toggle (derived)

Status: FINAL
Scope: global app shell

## Goal
- Provide global language toggle between `ko-KR` and `en-US`.
- Persist selection across route change and refresh.

## Rules
- Default locale: `ko-KR`.
- Storage key: `mining.lang`.
- All nav/page labels must render via i18n keys only.

## UI
- Toggle button uses `action.toggleLanguage` and `field.language` copy keys.
