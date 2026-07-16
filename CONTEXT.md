# ViewsForum — Domain Glossary

## Core Entities

- **Guest (訪客)**: Unauthenticated visitor who can browse all topics and comments but cannot create, reply, or like.
- **Member (會員)**: User authenticated via Google OAuth. Can create topics, reply to topics, and like content.
- **Admin (管理員)**: Member with elevated privileges to remove content and pin announcements.
- **Topic (主題)**: A user-created discussion post belonging to exactly one Category. Contains title, markdown body, a URL-safe `slug` (auto-generated from title, stable after creation), and metadata.
- **Comment (回覆)**: A flat (樓層式) reply to a Topic. Not threaded — replies appear in chronological order under the parent topic.
- **Like (按讚)**: A binary interaction from a Member on a Topic or Comment. One like per user per target; can be toggled off.
- **Category (分類)**: A pre-defined discussion board. Three fixed values:
  - `AI` — 科技奇點 (Artificial Intelligence, blockchain, future of work)
  - `FIN` — 財富自由 (Investing, macroeconomics, real estate)
  - `LIFE` — 生命哲學 (Meaning of life, psychology, classic literature)

## Deployment & Infrastructure

- **Database**: Cloudflare D1 `viewsforum-db` (id: `147e78a3-1fd2-4aea-8b70-f847c63b4cc1`), APAC region (Singapore). 
- **Seed Data**: 1 seed user (`seed_user`) + 20 seed topics loaded into remote D1. Category breakdown: AI 7, FIN 7, LIFE 6.
- **Development**: Local SQLite at `.db/viewsforum.sqlite` via `better-sqlite3` + `tsx` scripts. Dev server on `astro dev`.
- **CI/CD**: Planned — Cloudflare Pages Git Integration (main → forum.viewsifter.com). Not yet connected.
- **Auth**: Email + password authentication with bcrypt hashing (ADR-0005). Register at `/auth/register`, login at `/auth/login`.
- **API Token**: Cloudflare API Token with D1 Edit + Pages Edit permissions.

## Current Status (2026-07-16)

| Component | Status |
|---|---|
| Astro SSR + CF Pages scaffold | ✅ |
| 4 D1 tables (users, topics, comments, likes) | ✅ |
| 20 seed topics in remote D1 | ✅ |
| Category pages / topic detail / homepage | ✅ |
| Wabi-Sabi CSS design system | ✅ |
| Google OAuth auth flow (login/callback/logout) | ✅ |
| Create topic / comment / like API routes | 🔧 (logic ready, needs authed user flow) |
| Cloudflare Pages deployment | ⬜ pending |
| forum.viewsifter.com custom domain | ⬜ pending |

## Behavior

- **Hot Sort**: Ranking formula = `(likes × 3) + (replies × 1)`. Used for the "熱門" tab alongside chronological sort.
- **Seed Content (種子文章)**: Pre-written topics to bootstrap the community. Initially AI-generated at scale (no manual review); content can be refined or replaced later as real users contribute.
