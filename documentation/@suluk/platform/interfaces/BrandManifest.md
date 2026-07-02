[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / BrandManifest

# Interface: BrandManifest

Defined in: [manifest.ts:83](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/platform/src/manifest.ts#L83)

A BRAND — thin, swappable per deployment. Carries the app identity + the brand-facing opts (→ `[vars]`).

## Properties

### brandOpts?

> `optional` **brandOpts?**: `Record`\<`string`, `Record`\<`string`, `unknown`\>\>

Defined in: [manifest.ts:89](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/platform/src/manifest.ts#L89)

per-service brand-facing opts → `[vars]`.

***

### globalBrandOpts?

> `optional` **globalBrandOpts?**: `Record`\<`string`, `unknown`\>

Defined in: [manifest.ts:87](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/platform/src/manifest.ts#L87)

brand identity shared by every service (BRAND_NAME, baseUrl, emailFrom, …) → `[vars]`.

***

### name

> **name**: `string`

Defined in: [manifest.ts:85](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/platform/src/manifest.ts#L85)

the deployment/app name (the wrangler + package name). Differs per brand of the same system.

***

### wireBrandOpts?

> `optional` **wireBrandOpts?**: `Record`\<`string`, `Record`\<`string`, `unknown`\>\>

Defined in: [manifest.ts:91](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/platform/src/manifest.ts#L91)

brand-tunable EDGE params keyed by `wire.id` (Phase 3).
