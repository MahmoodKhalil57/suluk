[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/seo](../README.md) / RobotsOptions

# Interface: RobotsOptions

Defined in: [robots.ts:9](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/seo/src/robots.ts#L9)

`@suluk/seo` — a complete, framework-agnostic SEO toolkit for a Suluk app, inspired by the Nuxt SEO suite but
pure + Cloudflare-safe (no runtime deps, no argless Date). It generates: robots.txt, sitemaps (with image +
hreflang entries, plus a sitemap index), schema.org JSON-LD (the ecommerce graph), head meta (OpenGraph /
Twitter / canonical / hreflang / robots), llms.txt, an OG-image SVG, the PWA web manifest, and deploy
skew-protection. One import → every SEO surface a real ecommerce template needs. CANDIDATE tooling.

## Properties

### groups?

> `optional` **groups?**: [`RobotsGroup`](RobotsGroup.md)[]

Defined in: [robots.ts:11](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/seo/src/robots.ts#L11)

Groups; defaults to a single `User-agent: *` / `Allow: /` group.

***

### host?

> `optional` **host?**: `string`

Defined in: [robots.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/seo/src/robots.ts#L15)

Optional `Host:` directive (canonical host).

***

### sitemaps?

> `optional` **sitemaps?**: `string`[]

Defined in: [robots.ts:13](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/seo/src/robots.ts#L13)

Absolute sitemap URLs to advertise.
