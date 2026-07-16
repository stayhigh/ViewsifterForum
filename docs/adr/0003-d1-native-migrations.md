# ADR-0003: D1 Native SQL Migrations (No ORM)

**Date:** 2026-07-15
**Status:** Accepted

## Context

ViewsForum uses Cloudflare D1 (SQLite) as its database. The schema consists of
4 tables (Users, Topics, Comments, Likes). We need a way to version, apply, and
roll back schema changes across local, dev, and production environments.

## Decision

Use D1's built-in migration system with raw SQL files managed via `wrangler` CLI.
No ORM (Drizzle, Prisma, etc.).

Migrations live in `migrations/` with numbered filenames:
- `0001_create_users.sql`
- `0002_create_topics.sql`
- `0003_create_comments.sql`
- `0004_create_likes.sql`

Commands:
- Local: `npx wrangler d1 execute viewsforum-db --local --file=migrations/0001.sql`
- Remote: `npx wrangler d1 execute viewsforum-db --file=migrations/0001.sql`

CI/CD pipeline runs pending migrations against the target environment automatically.

## Consequences

- ✅ Schema changes are versioned in git, fully reproducible
- ✅ Zero additional dependencies (no ORM, no migration framework)
- ✅ Simple — D1 is SQLite, and the schema is small enough to manage without an ORM
- ⚠️ No type-safe query builder — SQL strings are hand-written
- ⚠️ Migration rollbacks must be written as forward migrations (no automatic down migration)
- ⚠️ Schema and application code can drift if not kept in sync by discipline

## Alternatives Considered

| Option | Rejected Because |
|---|---|
| Drizzle ORM | Adds dependency and abstraction for a 4-table schema; type safety benefit is marginal |
| Manual D1 console editing | Not reproducible, not version-controlled, error-prone |
| Prisma | Heavy dependency, D1 support is community-maintained and not first-class |
