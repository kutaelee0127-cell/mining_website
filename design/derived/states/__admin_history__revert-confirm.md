# Admin history revert confirm (derived)

Status: FINAL
Route: `/__admin/revisions`

## Goal
- Confirm before revert and handle optimistic concurrency conflict.

## Flow
- Admin selects revision -> open confirm dialog.
- Confirm sends revert request with expected version token.
- Conflict response shows `err.conflict`.
- Success shows `msg.changesSaved`.
