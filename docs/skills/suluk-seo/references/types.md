# Types & Enums

## robots

### `RobotsGroup`
robots.txt generation — user-agent groups with allow/disallow/crawl-delay, plus sitemap + host directives.
**Properties:**
- `userAgent: string | string[]`
- `allow: string[]` (optional)
- `disallow: string[]` (optional)
- `crawlDelay: number` (optional)

## sitemap

### `SitemapUrl`
**Properties:**
- `loc: string`
- `lastmod: string | number | Date` (optional)
- `changefreq: ChangeFreq` (optional)
- `priority: number` (optional)
- `images: SitemapImage[]` (optional)
- `alternates: SitemapAlternate[]` (optional)

### `SitemapImage`
**Properties:**
- `loc: string`
- `title: string` (optional)
- `caption: string` (optional)

### `SitemapAlternate`
**Properties:**
- `hreflang: string`
- `href: string`

### `ChangeFreq`
```ts
"always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"
```

## schema

### `OfferInput`
**Properties:**
- `price: string | number`
- `currency: string` (optional)
- `availability: string` (optional)
- `url: string` (optional)
- `priceValidUntil: string` (optional)

### `ProductInput`
**Properties:**
- `name: string`
- `description: string` (optional)
- `image: string | string[]` (optional)
- `sku: string` (optional)
- `brand: string` (optional)
- `url: string` (optional)
- `category: string` (optional)
- `offers: OfferInput | OfferInput[]` (optional)
- `rating: { ratingValue: number; reviewCount: number }` (optional)

### `ArticleInput`
**Properties:**
- `headline: string`
- `description: string` (optional)
- `image: string` (optional)
- `author: string` (optional)
- `datePublished: string` (optional)
- `dateModified: string` (optional)
- `url: string` (optional)
- `publisher: Node` (optional)

## meta

### `SeoTagsInput`
**Properties:**
- `title: string` (optional)
- `titleTemplate: string` (optional) — A template containing `%s`, e.g. "%s — saasuluk".
- `description: string` (optional)
- `canonical: string` (optional)
- `url: string` (optional)
- `image: string` (optional)
- `imageAlt: string` (optional)
- `type: string` (optional)
- `siteName: string` (optional)
- `locale: string` (optional)
- `twitterCard: "summary" | "summary_large_image"` (optional)
- `twitterSite: string` (optional)
- `twitterCreator: string` (optional)
- `robots: string | RobotsMeta` (optional)
- `noindex: boolean` (optional)
- `alternates: Alternate[]` (optional)
- `themeColor: string` (optional)
- `keywords: string[]` (optional)
- `publishedTime: string` (optional)
- `modifiedTime: string` (optional)

### `Tag`
**Properties:**
- `tag: "title" | "meta" | "link"`
- `attrs: Record<string, string>`
- `text: string` (optional)

### `Alternate`
**Properties:**
- `hreflang: string`
- `href: string`

### `RobotsMeta`
**Properties:**
- `index: boolean` (optional)
- `follow: boolean` (optional)
- `noarchive: boolean` (optional)
- `maxSnippet: number` (optional)
- `maxImagePreview: "none" | "standard" | "large"` (optional)

## llms

### `LlmsTxtInput`
**Properties:**
- `title: string`
- `summary: string` (optional) — One-line summary, rendered as a blockquote.
- `details: string` (optional) — Free-form markdown paragraph(s) after the summary.
- `sections: LlmsSection[]` (optional)

### `LlmsSection`
**Properties:**
- `title: string`
- `links: LlmsLink[]`

### `LlmsLink`
llms.txt generation (llmstxt.org) — a curated, LLM-friendly map of the site: H1 title, blockquote summary,
 optional details, then `## Section` lists of `- [title](url): description` links.
**Properties:**
- `title: string`
- `url: string`
- `description: string` (optional)

## og

### `OgImageInput`
**Properties:**
- `title: string`
- `subtitle: string` (optional)
- `brand: string` (optional)
- `eyebrow: string` (optional)
- `width: number` (optional)
- `height: number` (optional)
- `bg: string` (optional)
- `fg: string` (optional)
- `accent: string` (optional)
- `accent2: string` (optional)

## manifest

### `WebManifestInput`
**Properties:**
- `name: string`
- `shortName: string` (optional)
- `description: string` (optional)
- `startUrl: string` (optional)
- `scope: string` (optional)
- `display: "fullscreen" | "standalone" | "minimal-ui" | "browser"` (optional)
- `orientation: string` (optional)
- `themeColor: string` (optional)
- `backgroundColor: string` (optional)
- `lang: string` (optional)
- `dir: "ltr" | "rtl" | "auto"` (optional)
- `categories: string[]` (optional)
- `icons: ManifestIcon[]` (optional)
- `shortcuts: ManifestShortcut[]` (optional)

### `ManifestIcon`
PWA web app manifest generation (W3C). Pure JSON-string builder with sane defaults.
**Properties:**
- `src: string`
- `sizes: string`
- `type: string` (optional)
- `purpose: string` (optional)

### `ManifestShortcut`
**Properties:**
- `name: string`
- `url: string`
- `description: string` (optional)
- `icons: ManifestIcon[]` (optional)
