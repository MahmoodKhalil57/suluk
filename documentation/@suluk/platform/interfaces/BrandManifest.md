[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / BrandManifest

# Interface: BrandManifest

Defined in: [manifest.ts:75](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/platform/src/manifest.ts#L75)

A BRAND — thin, swappable per deployment. Carries the app identity + the brand-facing opts (→ `[vars]`).

## Properties

### brandOpts?

> `optional` **brandOpts?**: `Record`\<`string`, `Record`\<`string`, `unknown`\>\>

Defined in: [manifest.ts:81](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/platform/src/manifest.ts#L81)

per-service brand-facing opts → `[vars]`.

***

### globalBrandOpts?

> `optional` **globalBrandOpts?**: `Record`\<`string`, `unknown`\>

Defined in: [manifest.ts:79](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/platform/src/manifest.ts#L79)

brand identity shared by every service (BRAND_NAME, baseUrl, emailFrom, …) → `[vars]`.

***

### name

> **name**: `string`

Defined in: [manifest.ts:77](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/platform/src/manifest.ts#L77)

the deployment/app name (the wrangler + package name). Differs per brand of the same system.

***

### wireBrandOpts?

> `optional` **wireBrandOpts?**: `Record`\<`string`, `Record`\<`string`, `unknown`\>\>

Defined in: [manifest.ts:83](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/platform/src/manifest.ts#L83)

brand-tunable EDGE params keyed by `wire.id` (Phase 3).
