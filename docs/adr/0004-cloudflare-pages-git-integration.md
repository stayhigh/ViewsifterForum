# ADR-0004: Cloudflare Pages Git Integration for CI/CD

**Date:** 2026-07-15
**Status:** Accepted

## Context

ViewsForum needs a deployment pipeline that separates development (preview
URLs) from production (`forum.viewsifter.com`). The PRD specifies branch-based
deployment: `dev` for preview, `main` for production.

## Decision

Use Cloudflare Pages native Git Integration instead of GitHub Actions.

- Connect the GitHub repository to Cloudflare Pages
- `main` branch → production environment → `forum.viewsifter.com`
- `dev` branch → preview environment → auto-generated `*.pages.dev` URL
- Build command: `npm run build`
- Output directory: `dist/`
- D1 bindings and environment variables configured in the Cloudflare Dashboard

## Consequences

- ✅ Zero CI/CD maintenance — Cloudflare manages the pipeline
- ✅ Instant preview deployments for every push to non-main branches
- ✅ Built-in preview URL comments on pull requests (when connected)
- ✅ D1 bindings are managed at the platform level, not in code
- ⚠️ No pre-deploy checks (lint, test) unless added as a separate workflow
- ⚠️ Limited customization compared to GitHub Actions
- ⚠️ Environment secrets must be set manually in the Cloudflare Dashboard (not in code)

## Alternatives Considered

| Option | Rejected Because |
|---|---|
| GitHub Actions + wrangler CLI | Over-engineered for MVP; more setup and maintenance |
| Manual `wrangler pages deploy` | No automation; requires local CLI every deploy |
