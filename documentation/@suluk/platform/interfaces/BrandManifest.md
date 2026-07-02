[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / BrandManifest

# Interface: BrandManifest

Defined in: [manifest.ts:80](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/platform/src/manifest.ts#L80)

A BRAND — thin, swappable per deployment. Carries the app identity + the brand-facing opts (→ `[vars]`).

## Properties

### brandOpts?

> `optional` **brandOpts?**: `Record`\<`string`, `Record`\<`string`, `unknown`\>\>

Defined in: [manifest.ts:86](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/platform/src/manifest.ts#L86)

per-service brand-facing opts → `[vars]`.

***

### globalBrandOpts?

> `optional` **globalBrandOpts?**: `Record`\<`string`, `unknown`\>

Defined in: [manifest.ts:84](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/platform/src/manifest.ts#L84)

brand identity shared by every service (BRAND_NAME, baseUrl, emailFrom, …) → `[vars]`.

***

### name

> **name**: `string`

Defined in: [manifest.ts:82](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/platform/src/manifest.ts#L82)

the deployment/app name (the wrangler + package name). Differs per brand of the same system.

***

### wireBrandOpts?

> `optional` **wireBrandOpts?**: `Record`\<`string`, `Record`\<`string`, `unknown`\>\>

Defined in: [manifest.ts:88](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/platform/src/manifest.ts#L88)

brand-tunable EDGE params keyed by `wire.id` (Phase 3).
