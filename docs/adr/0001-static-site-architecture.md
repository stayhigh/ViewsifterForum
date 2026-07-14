# 0001: Static site architecture for investment methodology knowledge base

We chose a pure static site (Astro SSG) over a full-stack or interactive web app. The knowledge base's core value is content authority — curated investment strategies, market rules, and case studies — none of which require server-side logic or user accounts. Starting with a static site lets us ship the content fast; we can layer on client-side interactivity (filters, simple calculators) later without changing the architecture.

**Considered options:**
- **Next.js SSR + database** — overkill for a content-first project; user accounts and personalization add complexity with no clear payoff at this stage
- **SSG + client-side JS** — a reasonable middle ground, but the interactivity isn't needed until the content exists

**Consequences:** content updates require rebuilding and redeploying; acceptable trade-off for zero backend maintenance.
