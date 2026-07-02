# Functions

## marketing

### `buildMarketing`
Build the marketing landing — sections + blocks + a page — from one spec. Synchronous: no fetch, no runtime.
```ts
buildMarketing(spec: MarketingSpec): BuiltMarketing
```
**Parameters:**
- `spec: MarketingSpec`
**Returns:** `BuiltMarketing`

### `marketingPage`
A landing page composing the given marketing sections — mirrors appPage (exposes only { tone, sections }).
```ts
marketingPage(name: string, sectionNames: string[]): DslDocument
```
**Parameters:**
- `name: string`
- `sectionNames: string[]`
**Returns:** `DslDocument`

### `seoMeta`
Resolve a seoMeta field-group: og* default to title/description, sensible card/type/locale defaults.
```ts
seoMeta(input: SeoMetaInput): SeoMeta
```
**Parameters:**
- `input: SeoMetaInput`
**Returns:** `SeoMeta`

### `jsonLd`
Emit a schema.org JSON-LD object for an entity/page — drop it into a <script type="application/ld+json">.
```ts
jsonLd(kind: JsonLdKind, data: Record<string, unknown>): Record<string, unknown>
```
**Parameters:**
- `kind: JsonLdKind`
- `data: Record<string, unknown>`
**Returns:** `Record<string, unknown>`
