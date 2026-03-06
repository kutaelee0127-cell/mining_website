# Responsive media delivery (derived)

Status: FINAL
Scope: gallery/styles image rendering

## Goal
- Optimize public image delivery with cache headers and responsive UI rendering.

## API
- `GET /public/media/{mediaId}` returns cache policy header.
- Header baseline: `Cache-Control: public, max-age=31536000, immutable`.

## UI
- Use lazy loading for below-the-fold images.
- Use `srcset` + `sizes` to provide responsive candidates.
