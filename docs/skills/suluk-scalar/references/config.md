# Configuration

## ScalarOptions

### Properties

#### pageTitle

Browser tab title.

**Type:** `string`

#### cdn

CDN URL for the Scalar standalone bundle (override for pinning/self-hosting).

**Type:** `string`

#### facetBadges

Surface v4 facets (cost + access) as Scalar badges on each operation (default true).

**Type:** `boolean`

#### customCss

Override the injected suluk theme CSS.

**Type:** `string`

#### configuration

Extra Scalar configuration merged into createApiReference (theme, layout, hideModels, …).

**Type:** `Record<string, unknown>`

## ScalarV4Options

### Properties

#### brand

Brand shown in the suluk toolbar.

**Type:** `string`

#### specUrl

Endpoint returning the ENRICHED 3.1 spec (see `enrichedSpec`); the view selector appends `?<param>=<value>` and
 re-mounts Scalar with the result — a real per-role v4 projection driving Scalar's UI.

**Type:** `string`

#### specParam

**Type:** `string`

#### views

Role/view projections offered in the toolbar (e.g. Anonymous / Signed-in / Admin).

**Type:** `{ label: string; value: string }[]`

#### insightsUrl

URL of the embeddable v4 SUPERPOWERS panels (e.g. @suluk/reference's `referenceInsightsHtml`) — opened as an
 in-page slide-in DRAWER (no second dashboard). The current "View as" role is passed via the same `specParam`.

**Type:** `string`

#### insightsLabel

**Type:** `string`

#### nativeUrl

(legacy) link out to a separate renderer instead of the in-page drawer. Prefer `insightsUrl`.

**Type:** `string`

#### nativeLabel

**Type:** `string`

#### pageTitle

Browser tab title.

**Type:** `string`

#### cdn

CDN URL for the Scalar standalone bundle (override for pinning/self-hosting).

**Type:** `string`

#### facetBadges

Surface v4 facets (cost + access) as Scalar badges on each operation (default true).

**Type:** `boolean`

#### customCss

Override the injected suluk theme CSS.

**Type:** `string`

#### configuration

Extra Scalar configuration merged into createApiReference (theme, layout, hideModels, …).

**Type:** `Record<string, unknown>`