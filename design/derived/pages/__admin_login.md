# Admin login page (derived)

Status: FINAL
Route: `/__admin/login` (hidden route)

## Goal
- Provide admin-only login entry without exposing login in public navigation.
- Support username/password authentication with clear failure state.

## Layout
- Single centered card on mobile/desktop.
- Fields:
  - `field.username`
  - `field.password`
- Actions:
  - `action.login`

## States
- idle: empty form
- loading: submit disabled + `status.loading`
- error: invalid credentials -> `err.unauthorized`
- success: authenticated session, route can transition to admin area

## Rules
- Public nav must not include login link.
- Page is reachable only by direct URL.
