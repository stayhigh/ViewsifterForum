# ViewsForum Test Results

**Date:** 2026-07-16  
**Environment:** `http://localhost:4321`  
**Data:** 20 seed topics (AI:7, FIN:7, LIFE:6) via local SQLite

---

## Automated Test Results

All tests use `curl` — avoids Python urllib issues with 302 redirects and Chinese URL encoding.

| # | Scenario | Result | Detail |
|---|---|---|---|
| TS-01.1 | 首頁渲染 | ✅ | ViewsForum title, 3 categories, `lang="zh-TW"`, `--color-paper` |
| TS-01.2a | `/category/ai` | ✅ | 7 articles (`class="topic-card"`) |
| TS-01.2b | `/category/fin` | ✅ | 7 articles |
| TS-01.2c | `/category/life` | ✅ | 6 articles |
| TS-01.3 | `/topic/[slug]` | ✅ | HTTP 200, Markdown H2/H3 rendered |
| TS-02 | `/auth/register` | ✅ | Registration form rendered |
| TS-03 | `/auth/login` | ✅ | Login form rendered |
| TS-04.2 | `/topic/new` (unauthed) | ✅ | 302 → `/auth/login` |
| TS-07.1 | CSS design tokens | ✅ | `--color-paper`, `--color-earth`, `--color-ink` present |
| TS-07.1b | No Google blue | ✅ | No `#58a6ff` in CSS |
| TS-08.2a | `/topic/nope` | ✅ | HTTP 404 |
| TS-08.2b | `/category/nope` | ✅ | HTTP 404 |

**Result: 12/12 (100%)**

---

## Methodology Notes

### Why we use `curl` instead of Python `urllib`

| Issue | urllib | curl |
|---|---|---|
| 302 redirect | Raises `HTTPError` or auto-follows | `-sI -o /dev/null -w "%{redirect_url}"` |
| Chinese URL encoding | Must manually `quote()` every slug | Shell handles encoding |
| CSS vs HTML counts | `grep 'topic-card'` counts CSS selectors | Filter with `grep 'class="topic-card"'` |

### Correct `topic-card` counting

```
# WRONG — counts CSS `.topic-card` selectors in <style> too
curl -s $URL | grep -c 'topic-card'

# CORRECT — only counts HTML class attributes
curl -s $URL | grep -c 'class="topic-card"'
```

This was the root cause of the 8/8/7 discrepancy — the CSS had one `.topic-card` selector that inflated each category count by 1.

---

## Bugs Found & Fixed

1. **"Invalid Date" on topic pages** — `new Date(created_at + "Z")` failed on timestamps already in ISO format. Fixed by removing `+ "Z"` and adding `timeZone: "UTC"`.

2. **`safeD1Call` null-fallback** — D1 platform proxy returns `null` (not error) when tables exist but are empty. Added `if (result == null) return fallback()` to data layer.

3. **`/topic/new` redirect** — Pointed to old Google OAuth path `/api/auth/login`. Fixed to `/auth/login`.

---

## Remaining Manual Tests

These require browser interaction and cannot be automated with curl:

| # | Scenario | Status |
|---|---|---|
| TS-02.1 | Full registration flow (form → D1 → cookie) | ⬜ Manual |
| TS-03.1 | Full login flow (email + password → session) | ⬜ Manual |
| TS-04.1 | Create topic (markdown editor → D1) | ⬜ Manual |
| TS-05.1 | Reply to topic | ⬜ Manual |
| TS-06.1 | Like / unlike toggle | ⬜ Manual |
| TS-07.2 | RWD testing (320px, 768px, 1024px, 1440px) | ⬜ Manual |
| TS-08.3 | XSS protection (script tag in content) | ⬜ Manual |
