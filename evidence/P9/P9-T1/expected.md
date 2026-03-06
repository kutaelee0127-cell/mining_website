# P9-T1 Expected (DoD)

- Visitor routes `/`, `/about`, `/gallery`, `/styles`, `/reviews`, `/booking` are backed by real API responses.
- Admin can authenticate through hidden login credentials and perform page edits and CRUD operations.
- Public endpoints reflect admin writes.
- Unauthorized write requests are rejected with `401` or `403`.
- Revisions are created for writes and at least one restore operation succeeds.
- Data remains persisted in SQLite for the running stack.
