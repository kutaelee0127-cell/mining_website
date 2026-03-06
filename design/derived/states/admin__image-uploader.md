# Admin image uploader (derived)

Status: FINAL
Scope: admin edit overlay shared component

## Goal
- Reusable uploader for gallery/style/page editors.
- Upload allowed only for authenticated admin.

## Validation
- Allowed content types: image/jpeg, image/png, image/webp, image/heic
- Max file size: 10MB
- Invalid input shows `err.validation`

## Behavior
- While uploading, show `msg.uploading`.
- Success returns `MediaAsset` and updates preview immediately.
- If same `sha256` already exists, API may return existing asset (`200`).
