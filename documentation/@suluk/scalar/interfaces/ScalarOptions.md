[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/scalar](../README.md) / ScalarOptions

# Interface: ScalarOptions

Defined in: [index.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/scalar/src/index.ts#L32)

## Extended by

- [`ScalarV4Options`](ScalarV4Options.md)

## Properties

### cdn?

> `optional` **cdn?**: `string`

Defined in: [index.ts:36](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/scalar/src/index.ts#L36)

CDN URL for the Scalar standalone bundle (override for pinning/self-hosting).

***

### configuration?

> `optional` **configuration?**: `Record`\<`string`, `unknown`\>

Defined in: [index.ts:42](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/scalar/src/index.ts#L42)

Extra Scalar configuration merged into createApiReference (theme, layout, hideModels, …).

***

### customCss?

> `optional` **customCss?**: `string`

Defined in: [index.ts:40](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/scalar/src/index.ts#L40)

Override the injected suluk theme CSS.

***

### facetBadges?

> `optional` **facetBadges?**: `boolean`

Defined in: [index.ts:38](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/scalar/src/index.ts#L38)

Surface v4 facets (cost + access) as Scalar badges on each operation (default true).

***

### pageTitle?

> `optional` **pageTitle?**: `string`

Defined in: [index.ts:34](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/scalar/src/index.ts#L34)

Browser tab title.
