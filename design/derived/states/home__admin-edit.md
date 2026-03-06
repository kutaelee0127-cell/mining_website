# Home admin edit state (derived)

Status: FINAL
Route: `/`

## Goal
- Allow admin users to edit hero title/subtitle inline.
- Keep visitor mode read-only.

## States
- visitor: hero text only, no edit controls
- admin-idle: `action.edit` button visible
- admin-editing: title/subtitle inputs + `action.save`
- admin-saved: show `msg.changesSaved`

## Revision rule
- Saving hero text creates a revision summary item including:
  - `hero_title`
  - `hero_subtitle`
