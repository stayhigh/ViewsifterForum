# ADR-0001: Astro SSR on Cloudflare Pages + D1

**Date:** 2026-07-15
**Status:** Accepted

## Context

ViewsForum is a dynamic forum application with user authentication (Google OAuth),
CRUD operations on topics/comments, and like interactions across three topic
categories (AI, Investing, Philosophy). User-generated content means every page
is dynamic — a purely static site (SSG) cannot serve authenticated views or
fresh content without client-side hydration and a separate API backend.

## Decision

Use **Astro SSR** (server-side rendering) deployed on **Cloudflare Pages** with
**Cloudflare D1** (SQLite-compatible edge database) as the data store.

Architecture:
- Astro `.astro` components for page templates and UI
- `@astrojs/cloudflare` adapter for SSR via Pages Functions
- D1 accessed directly from server-side API routes (no separate Worker)
- Google OAuth handled via server-side session + JWT

## Consequences

- ✅ Single repository, single deployment target — low operational overhead
- ✅ Server-rendered pages for SEO and fast initial load
- ✅ Direct D1 access from Astro API routes (no extra Worker layer)
- ✅ Aligns with the `forum.viewsifter.com` deployment target
- ⚠️ D1 is still maturing — some SQL features (e.g., real-time subscriptions) are absent
- ⚠️ Pages Functions have execution limits (CPU time, duration) that may constrain complex queries
- ⚠️ Cold starts on Pages Functions may add latency for infrequently accessed routes

## Alternatives Considered

| Option | Rejected Because |
|---|---|
| Astro SSG + client-side SPA API calls | No SEO for dynamic content; two separate builds |
| Next.js on Vercel | Platform divergence from the rest of the `viewsifter.com` ecosystem (Cloudflare) |
| SPA (React/Vue) + separate Worker API | Higher complexity, poor SEO without SSR |
