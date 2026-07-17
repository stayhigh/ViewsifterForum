# ADR-0006: Non-Google User Identity & Topic Slug Strategy

**Date**: 2026-07-17
**Status**: Accepted
**Replaces/Amends**: ADR-0005 (Email Auth)

## Context

After migrating from Google OAuth to email+password auth (ADR-0005), two issues surfaced in production:

1. **`google_id` UNIQUE constraint was blocking registrations**: The original `users` table schema had `google_id TEXT UNIQUE NOT NULL`. When email-auth users registered with `google_id = ''` (empty string), the second registration would hit a UNIQUE constraint violation because SQLite treats duplicate empty strings as duplicate values for UNIQUE columns (unlike NULL, which is always considered distinct from other NULLs).

2. **Topic slug generation with CJK titles**: The original slug plan (ADR-0002) called for auto-generated slugs from titles. In production, CJK (Chinese/Japanese/Korean) characters caused slug regex issues and URL encoding complexity.

## Decision

### google_id Fix

Use the **user's email** as the `google_id` value for email-authenticated users. Since email is already unique per user (enforced by a UNIQUE index), this satisfies the `google_id UNIQUE` constraint without requiring a schema migration.

```
INSERT INTO users (google_id, email, name, password_hash)
VALUES (?, ?, ?, ?)  -- google_id = email
```

**Trade-off**: Semantically the column now means "external identity provider ID or email". Cleaner solution would be a schema migration to drop the UNIQUE constraint and rename the column, but SQLite ALTER TABLE limitations make this high-effort for low immediate value.

### Topic Slug

Use a **hybrid format**: `{Date.now()}-{Math.random().toString(36).slice(2, 8)}`.

Example: `1784291505889-a3f8k2`

- `Date.now()` provides temporal ordering and collision resistance
- 6-char random suffix provides additional uniqueness
- Entirely ASCII, no CJK URL encoding issues
- Title is stored in DB and displayed on page; slug is for routing only

## Consequences

- Newly registered email users have `google_id = email` (transparent to users)
- Old seed user (`seed_user`) retains original `google_id = 'seed_user'` — no migration needed
- Topic URLs are opaque slugs (no semantic content in URL); SEO impact is neutral since title is in `<title>` and `<h1>`
- Slug generation is deterministic across environments (both dev and prod use `Date.now()`)
