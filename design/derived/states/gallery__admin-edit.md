# Gallery admin edit state (derived)

Status: FINAL
Route: `/gallery`

## Goal
- Provide admin-only CRUD + reorder controls over gallery items.

## States
- visitor: read-only grid
- admin-editing: add/delete/reorder controls visible
- loading: skeleton grid
- empty: `msg.galleryEmpty`
- error: retry action

## Grid
- Mobile: 2 columns
- Desktop: 3-4 columns
