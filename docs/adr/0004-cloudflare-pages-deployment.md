# 0004: Deploy on Cloudflare Pages

The static site is deployed to Cloudflare Pages with automatic GitHub-based deployments. Cloudflare's CDN has strong edge presence in Taiwan, which matters for a knowledge base targeting Taiwanese readers.

**Considered options:**
- **GitHub Pages** — simplest but no build pipeline for Astro, limited to static file serving
- **Vercel** — Astro-native support and preview deploys, but Cloudflare's Taiwan CDN edge is better for our audience
- **Netlify** — comparable to Vercel, no compelling advantage for this use case
- **Cloudflare Pages (chosen)** — best latency to Taiwan users, generous free tier, integrates with the Cloudflare ecosystem the project already uses

**Consequences:** Cloudflare Pages has a 500 build/month free limit; acceptable for a content site with infrequent updates. Custom domain setup requires Cloudflare DNS.
