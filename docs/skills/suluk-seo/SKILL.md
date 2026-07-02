---
description: "A complete, framework-agnostic SEO toolkit for a Suluk app — robots.txt, sitemaps (hreflang + images + index), schema.org JSON-LD, head meta (OpenGraph/Twitter/canonical/hreflang), llms.txt, OG-image SVG, the PWA web manifest, and deploy skew-protection. Pure + Cloudflare-safe; inspired by the Nuxt SEO suite. CANDIDATE tooling."
name: suluk-seo
---

# @suluk/seo

A complete, framework-agnostic SEO toolkit for a Suluk app — robots.txt, sitemaps (hreflang + images + index), schema.org JSON-LD, head meta (OpenGraph/Twitter/canonical/hreflang), llms.txt, OG-image SVG, the PWA web manifest, and deploy skew-protection. Pure + Cloudflare-safe; inspired by the Nuxt SEO suite. CANDIDATE tooling.

## Quick Start

```ts
import { robotsTxt } from "@suluk/seo";

const body = robotsTxt({
  groups: [{ userAgent: "*", allow: ["/"], disallow: ["/account", "/checkout", "/api/"] }],
  sitemaps: ["https://example.com/sitemap.xml"],
  host: "example.com",
});
// → "User-agent: *\nAllow: /\nDisallow: /account\n…\nSitemap: https://example.com/sitemap.xml\n"
```

## Configuration

2 configuration interfaces — see references/config.md for details.

## Quick Reference

42 exports (22 functions, 19 types, 1 constants) — see references/ for full API.

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)