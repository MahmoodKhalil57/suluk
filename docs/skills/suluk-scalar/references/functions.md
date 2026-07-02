# Functions

## `enrichFacetBadges`
Mutate a downgraded 3.1 spec: attach Scalar `x-badges` derived from the carried-through v4 facets, so cost +
 access show up right on each operation in Scalar's UI (which has no native concept of them).
```ts
enrichFacetBadges(spec: { paths?: Record<string, Record<string, unknown>> }): void
```
**Parameters:**
- `spec: { paths?: Record<string, Record<string, unknown>> }`

## `enrichFacetDetail`
Append the v4 facet detail to each operation's description (progressive disclosure, complementing the badges).
```ts
enrichFacetDetail(spec: { paths?: Record<string, Record<string, unknown>> }): void
```
**Parameters:**
- `spec: { paths?: Record<string, Record<string, unknown>> }`

## `v4Intro`
Prepend a short "this is a Suluk v4 contract" note (+ a cost-coverage tally) to the doc intro Scalar shows up top.
```ts
v4Intro(spec: { info?: Record<string, unknown>; paths?: Record<string, Record<string, unknown>> }): void
```
**Parameters:**
- `spec: { info?: Record<string, unknown>; paths?: Record<string, Record<string, unknown>> }`

## `enrichedSpec`
Project a v4 document to the 3.1 spec Scalar consumes, ENRICHED with the v4 facets (cost/access → badges + detail
 + intro). The standalone (+ the /reference composite's view-as endpoint) both serve this. Never mutates `doc`.
```ts
enrichedSpec(doc: OpenAPIv4Document, opts: { facetBadges?: boolean }): { spec: Record<string, unknown>; diagnostics: Diagnostic[] }
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `opts: { facetBadges?: boolean }` — default: `{}`
**Returns:** `{ spec: Record<string, unknown>; diagnostics: Diagnostic[] }`

## `enrichV4Facets`
Mutate a v4 document: stamp the facet badges + detail on each REQUEST (the v4 by-name operation) and prepend the
 v4-contract intro — the same superpowers as the 3.1 path, but kept in v4 shape. The forked Scalar ingests this
 natively (projects requests→ops internally) and carries `x-badges` / `x-suluk-*` through, so cost + access render
 on each operation AND the version badge reads 4.0.0-candidate (no downgrade). Reuses the 3.1 badge helpers since a
 v4 request carries `x-suluk-cost` / `x-suluk-access` directly.
```ts
enrichV4Facets(doc: { paths?: Record<string, { requests?: Record<string, Record<string, unknown>> }>; info?: Record<string, unknown> }): void
```
**Parameters:**
- `doc: { paths?: Record<string, { requests?: Record<string, Record<string, unknown>> }>; info?: Record<string, unknown> }`

## `enrichedV4`
Enrich a v4 document with the suluk facets (badges + detail + intro) WITHOUT downgrading — for the forked Scalar
 that ingests v4 NATIVELY. Never mutates `doc` (JSON-clone first). The output is fed to Scalar's `content` as-is.
```ts
enrichedV4(doc: OpenAPIv4Document, opts: { facetBadges?: boolean }): { spec: Record<string, unknown> }
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `opts: { facetBadges?: boolean }` — default: `{}`
**Returns:** `{ spec: Record<string, unknown> }`

## `scalarHtml`
Render a v4 document to a self-contained Scalar HTML page (+ downgrade diagnostics).
```ts
scalarHtml(doc: OpenAPIv4Document, opts: ScalarOptions): RenderResult
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `opts: ScalarOptions` — default: `{}`
**Returns:** `RenderResult`

## `scalarResponse`
Convenience for Bun.serve / Hono / fetch handlers: the Scalar page as a text/html Response.
```ts
scalarResponse(doc: OpenAPIv4Document, opts: ScalarOptions): Response
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `opts: ScalarOptions` — default: `{}`
**Returns:** `Response`

## `scalarV4Html`
The saasuluk-grade **v4 reference**: the self-hosted Scalar UI fed the v4 doc (faithful + facet-enriched), wrapped
in a suluk toolbar that adds the v4-native "View as" ROLE projector (Anonymous / Signed-in / Admin) — picking a
role re-mounts Scalar with that role's projected spec from `specUrl` — and a link out to the deep native renderer.
```ts
scalarV4Html(doc: OpenAPIv4Document, opts: ScalarV4Options): RenderResult
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `opts: ScalarV4Options` — default: `{}`
**Returns:** `RenderResult`

## `scalarV4Response`
The v4 Scalar reference as a text/html Response.
```ts
scalarV4Response(doc: OpenAPIv4Document, opts: ScalarV4Options): Response
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `opts: ScalarV4Options` — default: `{}`
**Returns:** `Response`
