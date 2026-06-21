<p align="center">
  <a href="https://github.com/MahmoodKhalil57/suluk">
    <img src="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/wordmark.png" alt="Suluk" width="360" />
  </a>
</p>

<h1 align="center">@suluk/seo</h1>

<p align="center"><b>One import → every SEO surface an ecommerce site needs, generated as pure strings. Framework-agnostic, zero-dependency, Cloudflare-safe.</b></p>

---

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```sh
bun add @suluk/seo
```

## What it does

A complete SEO toolkit (inspired by the Nuxt SEO suite) as a set of **pure builder functions** — each takes plain input and returns a `string` (or a structured object you render). No runtime dependencies, no `node:fs`, no argless `new Date()` — so it runs identically in Node, Bun, the browser, **and a Cloudflare Worker**. It generates:

- **`robots.txt`** — user-agent groups (allow/disallow/crawl-delay) + `Sitemap:` / `Host:` directives.
- **Sitemaps** — `sitemap.xml` with image entries and hreflang alternates, plus a `sitemap-index`. XML is escaped and `priority` is clamped to `[0,1]`.
- **schema.org JSON-LD** — the ecommerce graph (Organization, WebSite+SearchAction, BreadcrumbList, Product+Offer+AggregateRating, FAQPage, BlogPosting, ItemList), composable into one `@graph` script.
- **Head meta** — title (templated), description, canonical, robots, hreflang, OpenGraph + Twitter — returned as structured tag descriptors so a framework can render them, or as an SSR `<head>` HTML string.
- **`llms.txt`** ([llmstxt.org](https://llmstxt.org)) — a curated, LLM-friendly map of the site.
- **OG image** — a branded 1200×630 social card as an SVG string (word-wrapped title; serve as `image/svg+xml`).
- **PWA web manifest** — a W3C `manifest.json` string with sane defaults.
- **Deploy skew-protection** — pin a client to the deployment it loaded and force a full reload after a new deploy.

## When to reach for it

Reach for it when a Suluk app (or any public site) needs its SEO/discovery surfaces — `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `<head>` meta, JSON-LD, an OG image, a web manifest. You drive each builder from your own data (the seed catalog, the request, the configured site origin) and write the result to a route/file. It does not crawl, fetch, or host anything — it only **generates the bytes**; serving them is your route handler's job (see [Boundary](#boundary)).

## Usage

Every export is a plain function. A few common surfaces, as you'd wire them into Astro/Hono routes:

### robots.txt

```ts
import { robotsTxt } from "@suluk/seo";

const body = robotsTxt({
  groups: [{ userAgent: "*", allow: ["/"], disallow: ["/account", "/checkout", "/api/"] }],
  sitemaps: ["https://example.com/sitemap.xml"],
  host: "example.com",
});
// → "User-agent: *\nAllow: /\nDisallow: /account\n…\nSitemap: https://example.com/sitemap.xml\n"
```

### sitemap.xml (+ index)

```ts
import { sitemapXml, sitemapIndex, type SitemapUrl } from "@suluk/seo";

const urls: SitemapUrl[] = [
  { loc: "https://example.com/", changefreq: "daily", priority: 1.0 },
  {
    loc: "https://example.com/products/founder-tee",
    changefreq: "weekly",
    priority: 0.8,
    images: [{ loc: "https://example.com/img/founder-tee.jpg", title: "Founder Tee" }],
    alternates: [{ hreflang: "ar", href: "https://example.com/ar/products/founder-tee" }],
  },
];

const xml = sitemapXml(urls);                                        // <urlset> with image + xhtml namespaces auto-added
const index = sitemapIndex([{ loc: "https://example.com/sitemap-products.xml", lastmod: new Date() }]);
```

### Head meta — structured tags or SSR HTML

`seoTags()` returns `Tag[]` descriptors (so a framework can render them however it likes); `renderTags()` turns them into a plain `<head>` HTML string.

```ts
import { seoTags, renderTags, resolveTitle } from "@suluk/seo";

const tags = seoTags({
  title: "Store",
  titleTemplate: "%s — saasuluk",        // → "Store — saasuluk"
  description: "Shop the catalog",
  canonical: "https://example.com/products",
  url: "https://example.com/products",
  image: "https://example.com/og.svg",
  imageAlt: "saasuluk",
  siteName: "saasuluk",
  locale: "en",
  twitterCard: "summary_large_image",
  themeColor: "#6366f1",
  robots: { maxImagePreview: "large" },  // or `noindex: true` to force "noindex, nofollow"
  alternates: [{ hreflang: "ar", href: "https://example.com/ar/products" }],
});

const headHtml = renderTags(tags);       // "<title>…</title>\n<meta name=…>\n<link rel=\"canonical\" …>"
resolveTitle("Store", "%s — saasuluk");  // "Store — saasuluk" (standalone title resolver)
```

### schema.org JSON-LD — compose into one `@graph`

The builders return plain nodes (empty fields dropped). `graph()` wraps several into one `@graph` script; `ld()` wraps a single node with `@context` for a standalone `<script>`.

```ts
import { graph, organization, website, breadcrumb, product, faqPage } from "@suluk/seo";

const jsonLd = graph(
  organization({ name: "saasuluk", url: "https://example.com", logo: "https://example.com/logo.svg" }),
  website({ name: "saasuluk", url: "https://example.com", searchUrl: "https://example.com/search?q={search_term_string}" }),
  breadcrumb([{ name: "Home", url: "/" }, { name: "Store", url: "/products" }]),
  product({
    name: "Founder Tee",
    sku: "TEE-001",
    brand: "saasuluk",
    image: "https://example.com/img/founder-tee.jpg",
    offers: { price: 29, currency: "USD", availability: "InStock" }, // price → "29.00", availability → schema.org URL
    rating: { ratingValue: 4.6, reviewCount: 12 },
  }),
  faqPage([{ question: "Do you ship worldwide?", answer: "Yes." }]),
);

const script = `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
```

Other node builders: `article()` (BlogPosting), `itemList()`, `offer()`, `aggregateRating()`.

### llms.txt

```ts
import { llmsTxt } from "@suluk/seo";

const txt = llmsTxt({
  title: "saasuluk",
  summary: "An ecommerce + SaaS starter projected from one OpenAPI v4 contract.",
  details: "The products below are real slices of this repository.",
  sections: [
    { title: "Docs", links: [{ title: "API reference", url: "/reference", description: "The live v4 contract" }] },
  ],
});
```

### OG image (SVG)

```ts
import { ogImageSvg } from "@suluk/seo";

const svg = ogImageSvg({ title: "Founder Tee", subtitle: "$29", brand: "saasuluk", eyebrow: "Store" });
// serve with content-type: image/svg+xml — defaults to 1200×630; override width/height/bg/fg/accent
```

### Web manifest

```ts
import { webManifest } from "@suluk/seo";

const manifest = webManifest({
  name: "saasuluk",
  themeColor: "#6366f1",
  icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
}); // → a manifest.json string (display defaults to "standalone")
```

### Deploy skew-protection

Stamp the deployment id into `<head>`, echo it from a light endpoint, and include the guard script once. When a newer deploy is detected, the next same-origin link click becomes a full page load — so a long-lived tab never runs stale HTML against rotated chunks.

```ts
import { deploymentMeta, skewGuardScript, DEPLOYMENT_HEADER } from "@suluk/seo";

// Server — in <head>:
deploymentMeta(BUILD_ID);                       // <meta name="x-deployment-id" content="…">
// …and on a health route, echo the same id:
app.get("/api/health", (c) => c.json({ ok: true }, 200, { [DEPLOYMENT_HEADER]: BUILD_ID }));

// Client — include once (inline <script>):
skewGuardScript();                              // defaults: polls /api/health every 60s
```

## API

| Export | Returns | Does |
| --- | --- | --- |
| `robotsTxt(opts)` | `string` | robots.txt from user-agent groups + sitemap/host directives |
| `sitemapXml(urls)` / `sitemapIndex(maps)` | `string` | sitemap.xml (image + hreflang) / sitemap index |
| `seoTags(input)` | `Tag[]` | structured head-tag descriptors (title/meta/link) |
| `renderTags(tags)` | `string` | render `Tag[]` to SSR `<head>` HTML |
| `resolveTitle(title, template?)` | `string` | apply a `%s` title template |
| `organization` `website` `breadcrumb` `product` `offer` `aggregateRating` `faqPage` `article` `itemList` | `Node` | schema.org JSON-LD node builders |
| `graph(...nodes)` / `ld(node)` | `Node` | wrap nodes in one `@graph` / a single node with `@context` |
| `llmsTxt(input)` | `string` | the llmstxt.org site map |
| `ogImageSvg(input)` | `string` | 1200×630 branded social-card SVG |
| `webManifest(input)` | `string` | a W3C `manifest.json` string |
| `deploymentMeta(id)` / `skewGuardScript(opts?)` | `string` | skew-protection `<meta>` / inline guard script |
| `DEPLOYMENT_HEADER` | `"x-deployment-id"` | the response header the guard polls |

## Boundary

This is an L3 **generator** — it emits owned bytes (strings) and stops there. It never crawls, fetches, hosts, or rasterizes: `ogImageSvg` returns an SVG string (rasterize to PNG with a renderer if a platform needs it), and serving every output — wiring `/robots.txt`, `/sitemap.xml`, `/llms.txt`, the `<head>`, `/og.svg`, the manifest — is your route handler's job. All inputs are injected by the caller: you pass the site origin, the catalog/seed data, and the deploy id (no ambient `Date.now()`, no env reads). Keep the IO at the app seam; keep the package pure.

## License

Apache-2.0.
