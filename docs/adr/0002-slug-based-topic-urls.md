# ADR-0002: Slug-based Topic URLs

**Date:** 2026-07-15
**Status:** Accepted

## Context

Topics need to appear in URLs (e.g., `/topic/ai-agent-qu-shi`). The PRD
specifies auto-increment integer IDs, which would produce URLs like `/topic/123`.
This has several drawbacks for a public-facing forum.

## Decision

Topics will have a `slug` column (unique, auto-generated from title) used in all
public-facing URLs and API endpoints. The internal `id` (auto-increment integer)
remains for database relationships (foreign keys from Comments and Likes) where
compactness and join performance matter.

Slug generation rule: lowercase, Chinese characters preserved (not transliterated),
spaces and special chars replaced with hyphens. Example:
`"2026 AI Agent：從對話機器人到自主工作流"` → `2026-ai-agent-從對話機器人到自主工作流`

## Consequences

- ✅ SEO-friendly URLs with topic keywords visible to search engines
- ✅ Human-readable: users can guess content from the URL
- ✅ Prevents trivial content enumeration via URL guessing (no sequential IDs exposed)
- ⚠️ Slug must remain stable after creation — changing a title should NOT change the slug
- ⚠️ Title collision edge case: if two topics share a title, slug generation must append a
  disambiguating suffix (e.g., `-2`)
- ⚠️ Slug uniqueness must be enforced at the database level
