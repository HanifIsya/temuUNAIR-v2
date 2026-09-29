# Architecture Decision Records

One file per decision. Format: context → options → decision → consequences. Numbered
`ADR-####`, never renumbered or deleted (supersede with a new ADR and update `status`).

| ADR | Title | Status |
|---|---|---|
| [ADR-0001](ADR-0001-monorepo.md) | Monorepo with pnpm workspaces and Turborepo | accepted |
| [ADR-0002](ADR-0002-nextjs-api.md) | Next.js route handlers as the API layer | accepted |
| [ADR-0003](ADR-0003-postgres-pgvector.md) | PostgreSQL 16 with pgvector as the single data store | accepted |
| [ADR-0004](ADR-0004-clip-text-encoder.md) | Multilingual CLIP-aligned text encoder for text↔image matching | proposed |
| [ADR-0005](ADR-0005-pg-boss.md) | pg-boss on PostgreSQL instead of Redis | accepted |
| [ADR-0006](ADR-0006-auth.md) | Auth.js with Google OAuth and a domain allowlist | proposed |
| [ADR-0007](ADR-0007-hidden-detail-verification.md) | Hidden-detail challenge for ownership verification | accepted |
| [ADR-0008](ADR-0008-storage-and-masking.md) | Presigned uploads, EXIF stripping and masking of sensitive photos | accepted |
| [ADR-0009](ADR-0009-yolo-role-and-licence.md) | YOLO as a crop helper only (and its AGPL licence) | accepted |
| [ADR-0010](ADR-0010-chat-transport.md) | Polling-first chat transport with an SSE upgrade path | accepted |

## Writing an ADR

Use the `write-adr` skill (`/adr <title>`). Minimum sections: Context, Options, Decision,
Consequences. Link the DEC IDs and docs it affects. Then update this index and
`docs/08-project/decisions-log.md`.
