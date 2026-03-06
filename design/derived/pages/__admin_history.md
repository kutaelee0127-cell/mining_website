# /__admin/revisions — derived UI spec

Depends-on: `design/derived/states/__admin__layout.md`

## Goal
- Admin-only revision history list with detail preview.

## Required fields
- entity_type
- entity_id
- summary
- created_at

## Grouping
- UI groups records by recent window (last 1h / 24h / this week) using `created_at`.
