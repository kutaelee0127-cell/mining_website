# Admin bar skeleton (derived)

Status: FINAL
Scope: global app shell

## Goal
- Show global admin bar only when admin is authenticated.
- Keep login route hidden from public navigation.

## Visibility
- Visitor: admin bar hidden.
- Admin: admin bar visible with:
  - `action.enterEditMode`
  - `nav.rollback` (`/__admin/revisions`)
  - `action.logout`

## Route behavior
- `/__admin/login`: direct access allowed (not in public nav).
- `/__admin/revisions`: admin only.
- Unauthorized access to revisions shows forbidden state with `err.forbidden`.
