# Viewsifter Forum — Domain Glossary

## Project

- **Name**: Viewsifter Forum (`viewsifter-forum`)
- **Repository**: `stayhigh/ViewsifterForum` (GitHub)
- **Local**: `~/workspace/ViewsifterForum/`

## Core Entities

- **Guest (訪客)**: Unauthenticated visitor who can browse all topics and comments but cannot create, reply, or like.
- **Member (會員)**: User authenticated via email + password with bcrypt hashing. Can create topics, reply to topics, and like content.
- **Admin (管理員)**: Member with elevated privileges to remove content and pin announcements.
- **Topic (主題)**: A user-created discussion post belonging to exactly one Category. Contains title, markdown body, a URL-safe `slug` (generated as `{timestamp}-{random}` for uniqueness, e.g. `1784291505889-abc123`), and metadata.
- **Comment (回覆)**: A flat (樓層式) reply to a Topic. Not threaded — replies appear in chronological order under the parent topic.
- **Like (按讚)**: A binary interaction from a Member on a Topic or Comment. One like per user per target; toggled via POST to `/api/likes`.
- **Category (分類)**: A pre-defined discussion board. Three fixed values:
  - `AI` — 科技奇點 (Artificial Intelligence, blockchain, future of work)
  - `FIN` — 財富自由 (Investing, macroeconomics, real estate)
  - `LIFE` — 生命哲學 (Meaning of life, psychology, classic literature)

## Deployment & Infrastructure

- **Database**: Cloudflare D1 `viewsforum-db` (id: `147e78a3-1fd2-4aea-8b70-f847c63b4cc1`), APAC region (Singapore).
- **Seed Data**: 1 seed user + 54 seed topics in remote D1. Category breakdown: AI 21, FIN 17, LIFE 16.
- **Development**: Local SQLite at `.db/viewsforum.sqlite` via `better-sqlite3` + `tsx` scripts. Dev server on `astro dev`.
- **CI/CD**: Cloudflare Pages Git Integration (main → forum.viewsifter.com). Auto-deploys on `git push` to main.
- **Auth**: Email + password authentication with bcrypt hashing (ADR-0005). Register at `/auth/register`, login at `/auth/login`.
- **Session**: Cookie-based (7-day expiry). `user_info` cookie stores `{id, name, email}` as JSON. Session token via SHA-256 hash stored in `session` cookie.
- **Topic Slug**: `{Date.now()}-{Math.random().toString(36)}` format (e.g. `1784291505889-a3f8k2`). Maximizes uniqueness; avoids CJK URL encoding issues.

## Current Status (2026-07-17)

| Component | Status |
|---|---|
| Astro SSR + CF Pages scaffold | ✅ |
| 4 D1 tables (users, topics, comments, likes) | ✅ |
| 54 seed topics in remote D1 | ✅ |
| Category pages / topic detail / homepage | ✅ |
| Wabi-Sabi CSS design system | ✅ |
| Email + password auth (register/login/logout) | ✅ |
| Create topic API (D1 INSERT + slug gen) | ✅ |
| Comments (reply form + display on topic) | ✅ |
| Likes (toggle on topic pages) | ✅ |
| Hot sort (likes×3 + replies×1) | ✅ |
| Nav bar user avatar + new topic CTA | ✅ |
| Mobile touch targets (44px min via ADR-0007) | ✅ |

## Behavior

- **Hot Sort**: Ranking formula = `(likes × 3) + (replies × 1)`. Used for the "熱門" tab alongside chronological sort.
- **Seed Content (種子文章)**: Pre-written topics to bootstrap the community. Initially AI-generated at scale (no manual review); content can be refined or replaced later as real users contribute.

## Architecture Decisions

| ADR | Title | Status |
|---|---|---|
| 0001 | Astro SSR on Cloudflare Pages + D1 | Accepted |
| 0002 | Slug-based Topic URLs | Accepted |
| 0003 | D1 Native SQL Migrations | Accepted |
| 0004 | Cloudflare Pages Git Integration | Accepted |
| 0005 | Email + Password Auth (bcrypt) | Accepted |
| 0006 | Non-Google Identity + Topic Slug Strategy | Accepted |
| 0007 | Minimum 44px Touch Targets for Mobile | Accepted |
