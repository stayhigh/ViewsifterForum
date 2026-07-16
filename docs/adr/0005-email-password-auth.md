# ADR-0005: Email + Password Authentication (Replace Google OAuth)

**Date:** 2026-07-16
**Status:** Accepted

## Context

The PRD originally specified Google OAuth as the sole authentication method. During implementation, the decision was made to replace Google OAuth with a self-built email + password system. This removes the dependency on Google Cloud Console and gives ViewsForum full control over its user identity system.

## Decision

Implement email + password authentication using bcrypt for password hashing.

**Users table changes:**
- `google_id` → nullable (kept for future Google OAuth option)
- Add `password_hash TEXT NOT NULL`
- `email` remains the primary login identifier

**Registration flow:**
1. User enters email + password + name on `/auth/register`
2. Password is hashed with bcrypt (salt rounds: 12)
3. User row inserted into D1
4. Session cookie set → redirect to homepage

**Login flow:**
1. User enters email + password on `/auth/login`
2. Look up user by email in D1
3. Compare password with bcrypt
4. Session cookie set → redirect to homepage

## Consequences

- **Positive**: No external dependency (Google Cloud Console), full control over auth UX, simpler setup for contributors
- **Negative**: Must implement password reset flow (later), responsible for password security, slightly more login friction for users
- **Neutral**: Retains `google_id` column as nullable — can add Google OAuth as an alternative login method later without breaking the schema

## Trade-offs

| | Google OAuth | Email + Password |
|---|---|---|
| Setup complexity | High (Google Console) | Low |
| User friction | Low (one click) | Medium (type email + pw) |
| Security responsibility | Google | Us |
| Future optionality | Locked into Google | Can add Google later as secondary |
