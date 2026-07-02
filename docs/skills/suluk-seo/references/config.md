# Configuration

## RobotsOptions

`@suluk/seo` — a complete, framework-agnostic SEO toolkit for a Suluk app, inspired by the Nuxt SEO suite but
pure + Cloudflare-safe (no runtime deps, no argless Date). It generates: robots.txt, sitemaps (with image +
hreflang entries, plus a sitemap index), schema.org JSON-LD (the ecommerce graph), head meta (OpenGraph /
Twitter / canonical / hreflang / robots), llms.txt, an OG-image SVG, the PWA web manifest, and deploy
skew-protection. One import → every SEO surface a real ecommerce template needs. CANDIDATE tooling.

### Properties

#### groups

Groups; defaults to a single `User-agent: *` / `Allow: /` group.

**Type:** `RobotsGroup[]`

#### sitemaps

Absolute sitemap URLs to advertise.

**Type:** `string[]`

#### host

Optional `Host:` directive (canonical host).

**Type:** `string`

## SkewGuardOptions

### Properties

#### endpoint

Endpoint that echoes the current deployment id in the header (default "/api/health").

**Type:** `string`

#### header

Response header carrying the id (default "x-deployment-id").

**Type:** `string`

#### intervalMs

Poll interval ms (default 60000).

**Type:** `number`