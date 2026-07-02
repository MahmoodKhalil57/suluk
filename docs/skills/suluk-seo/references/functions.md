# Functions

## robots

### `robotsTxt`
`@suluk/seo` — a complete, framework-agnostic SEO toolkit for a Suluk app, inspired by the Nuxt SEO suite but
pure + Cloudflare-safe (no runtime deps, no argless Date). It generates: robots.txt, sitemaps (with image +
hreflang entries, plus a sitemap index), schema.org JSON-LD (the ecommerce graph), head meta (OpenGraph /
Twitter / canonical / hreflang / robots), llms.txt, an OG-image SVG, the PWA web manifest, and deploy
skew-protection. One import → every SEO surface a real ecommerce template needs. CANDIDATE tooling.
```ts
robotsTxt(opts: RobotsOptions): string
```
**Parameters:**
- `opts: RobotsOptions` — default: `{}`
**Returns:** `string`

## sitemap

### `sitemapXml`
```ts
sitemapXml(urls: SitemapUrl[]): string
```
**Parameters:**
- `urls: SitemapUrl[]`
**Returns:** `string`

### `sitemapIndex`
```ts
sitemapIndex(sitemaps: { loc: string; lastmod?: string | number | Date }[]): string
```
**Parameters:**
- `sitemaps: { loc: string; lastmod?: string | number | Date }[]`
**Returns:** `string`

## schema

### `organization`
```ts
organization(i: { name: string; url: string; logo?: string; sameAs?: string[]; description?: string }): Node
```
**Parameters:**
- `i: { name: string; url: string; logo?: string; sameAs?: string[]; description?: string }`
**Returns:** `Node`

### `website`
```ts
website(i: { name: string; url: string; searchUrl?: string; description?: string; publisher?: Node }): Node
```
**Parameters:**
- `i: { name: string; url: string; searchUrl?: string; description?: string; publisher?: Node }`
**Returns:** `Node`

### `breadcrumb`
```ts
breadcrumb(items: { name: string; url: string }[]): Node
```
**Parameters:**
- `items: { name: string; url: string }[]`
**Returns:** `Node`

### `offer`
```ts
offer(i: OfferInput): Node
```
**Parameters:**
- `i: OfferInput`
**Returns:** `Node`

### `aggregateRating`
```ts
aggregateRating(i: { ratingValue: number; reviewCount: number; best?: number }): Node
```
**Parameters:**
- `i: { ratingValue: number; reviewCount: number; best?: number }`
**Returns:** `Node`

### `product`
```ts
product(i: ProductInput): Node
```
**Parameters:**
- `i: ProductInput`
**Returns:** `Node`

### `faqPage`
```ts
faqPage(faqs: { question: string; answer: string }[]): Node
```
**Parameters:**
- `faqs: { question: string; answer: string }[]`
**Returns:** `Node`

### `article`
```ts
article(i: ArticleInput): Node
```
**Parameters:**
- `i: ArticleInput`
**Returns:** `Node`

### `itemList`
```ts
itemList(items: { name: string; url: string }[]): Node
```
**Parameters:**
- `items: { name: string; url: string }[]`
**Returns:** `Node`

### `graph`
Compose nodes into ONE `@graph` document — the recommended single-script form (de-duplicates `@context`).
```ts
graph(nodes: Node[]): Node
```
**Parameters:**
- `nodes: Node[]`
**Returns:** `Node`

### `ld`
Wrap a single node with `@context` for a standalone <script type="application/ld+json">.
```ts
ld(node: Node): Node
```
**Parameters:**
- `node: Node`
**Returns:** `Node`

## meta

### `seoTags`
```ts
seoTags(i: SeoTagsInput): Tag[]
```
**Parameters:**
- `i: SeoTagsInput`
**Returns:** `Tag[]`

### `renderTags`
Render tag descriptors to an HTML string (for an SSR <head>).
```ts
renderTags(tags: Tag[]): string
```
**Parameters:**
- `tags: Tag[]`
**Returns:** `string`

### `resolveTitle`
```ts
resolveTitle(title: string | undefined, template?: string): string
```
**Parameters:**
- `title: string | undefined`
- `template: string` (optional)
**Returns:** `string`

## llms

### `llmsTxt`
```ts
llmsTxt(i: LlmsTxtInput): string
```
**Parameters:**
- `i: LlmsTxtInput`
**Returns:** `string`

## og

### `ogImageSvg`
```ts
ogImageSvg(i: OgImageInput): string
```
**Parameters:**
- `i: OgImageInput`
**Returns:** `string`

## manifest

### `webManifest`
```ts
webManifest(i: WebManifestInput): string
```
**Parameters:**
- `i: WebManifestInput`
**Returns:** `string`

## skew

### `deploymentMeta`
A <meta> stamping the build/deployment id into the page.
```ts
deploymentMeta(id: string): string
```
**Parameters:**
- `id: string`
**Returns:** `string`

### `skewGuardScript`
Inline client guard (drop into a <script>). Detects a newer deploy and converts the next same-origin link
 click into a full page load so the user lands on the new version cleanly.
```ts
skewGuardScript(opts: SkewGuardOptions): string
```
**Parameters:**
- `opts: SkewGuardOptions` — default: `{}`
**Returns:** `string`
