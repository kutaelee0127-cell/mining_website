# Theme toggle baseline (derived)

Status: FINAL
Route: `/`

## Goal
- Provide a minimal dark/light theme toggle baseline.
- Default theme is `dark` on first render.
- Persist user selection in `localStorage` key: `mining.theme`.

## Tokens
- Source: `packages/ui-kit/src/tokens/theme.css`
- Required variables:
  - `--bg`
  - `--fg`
  - `--surface`
  - `--border`

## Behavior
- On initial load:
  - If `localStorage.mining.theme` exists and is `light` or `dark`, use it.
  - Otherwise use `dark`.
- Toggle action switches between `dark` and `light` immediately.
- The active theme is applied on `document.documentElement` via `data-theme`.

## UI
- A single button is shown in app shell.
- Button text is i18n-key driven:
  - action: `action.toggleTheme`
  - state label: `status.themeDark` or `status.themeLight`

## Acceptance notes
- Default render is dark.
- Theme change is visible immediately via CSS variables.
- User selection survives refresh by local storage persistence.
