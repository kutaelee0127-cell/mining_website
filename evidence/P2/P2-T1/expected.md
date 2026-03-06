# P2-T1 Expected (DoD)

- Admin can authenticate using hidden route credentials (`admin` / `admin1234!`) and receive a bearer token.
- Admin can update Home hero title/subtitle via `PATCH /api/admin/home`.
- `GET /api/public/home` returns updated hero content immediately after patch.
- A revision entry is created for home update and includes `hero_title` in summary.
- Unauthorized visitor write to `PATCH /api/admin/home` is rejected with `401` or `403`.
- Updated Home content remains after API restart, proving SQLite persistence.
