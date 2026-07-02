[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/scalar](../README.md) / ScalarV4Options

# Interface: ScalarV4Options

Defined in: [index.ts:227](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/scalar/src/index.ts#L227)

## Extends

- [`ScalarOptions`](ScalarOptions.md)

## Properties

### brand?

> `optional` **brand?**: `string`

Defined in: [index.ts:229](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/scalar/src/index.ts#L229)

Brand shown in the suluk toolbar.

***

### cdn?

> `optional` **cdn?**: `string`

Defined in: [index.ts:36](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/scalar/src/index.ts#L36)

CDN URL for the Scalar standalone bundle (override for pinning/self-hosting).

#### Inherited from

[`ScalarOptions`](ScalarOptions.md).[`cdn`](ScalarOptions.md#cdn)

***

### configuration?

> `optional` **configuration?**: `Record`\<`string`, `unknown`\>

Defined in: [index.ts:42](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/scalar/src/index.ts#L42)

Extra Scalar configuration merged into createApiReference (theme, layout, hideModels, …).

#### Inherited from

[`ScalarOptions`](ScalarOptions.md).[`configuration`](ScalarOptions.md#configuration)

***

### customCss?

> `optional` **customCss?**: `string`

Defined in: [index.ts:40](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/scalar/src/index.ts#L40)

Override the injected suluk theme CSS.

#### Inherited from

[`ScalarOptions`](ScalarOptions.md).[`customCss`](ScalarOptions.md#customcss)

***

### facetBadges?

> `optional` **facetBadges?**: `boolean`

Defined in: [index.ts:38](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/scalar/src/index.ts#L38)

Surface v4 facets (cost + access) as Scalar badges on each operation (default true).

#### Inherited from

[`ScalarOptions`](ScalarOptions.md).[`facetBadges`](ScalarOptions.md#facetbadges)

***

### insightsLabel?

> `optional` **insightsLabel?**: `string`

Defined in: [index.ts:239](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/scalar/src/index.ts#L239)

***

### insightsUrl?

> `optional` **insightsUrl?**: `string`

Defined in: [index.ts:238](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/scalar/src/index.ts#L238)

URL of the embeddable v4 SUPERPOWERS panels (e.g. @suluk/reference's `referenceInsightsHtml`) — opened as an
 in-page slide-in DRAWER (no second dashboard). The current "View as" role is passed via the same `specParam`.

***

### nativeLabel?

> `optional` **nativeLabel?**: `string`

Defined in: [index.ts:242](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/scalar/src/index.ts#L242)

***

### nativeUrl?

> `optional` **nativeUrl?**: `string`

Defined in: [index.ts:241](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/scalar/src/index.ts#L241)

(legacy) link out to a separate renderer instead of the in-page drawer. Prefer `insightsUrl`.

***

### pageTitle?

> `optional` **pageTitle?**: `string`

Defined in: [index.ts:34](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/scalar/src/index.ts#L34)

Browser tab title.

#### Inherited from

[`ScalarOptions`](ScalarOptions.md).[`pageTitle`](ScalarOptions.md#pagetitle)

***

### specParam?

> `optional` **specParam?**: `string`

Defined in: [index.ts:233](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/scalar/src/index.ts#L233)

***

### specUrl?

> `optional` **specUrl?**: `string`

Defined in: [index.ts:232](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/scalar/src/index.ts#L232)

Endpoint returning the ENRICHED 3.1 spec (see `enrichedSpec`); the view selector appends `?<param>=<value>` and
 re-mounts Scalar with the result — a real per-role v4 projection driving Scalar's UI.

***

### views?

> `optional` **views?**: `object`[]

Defined in: [index.ts:235](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/scalar/src/index.ts#L235)

Role/view projections offered in the toolbar (e.g. Anonymous / Signed-in / Admin).

#### label

> **label**: `string`

#### value

> **value**: `string`
