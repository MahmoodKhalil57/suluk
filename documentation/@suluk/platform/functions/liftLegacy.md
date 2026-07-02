[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / liftLegacy

# Function: liftLegacy()

> **liftLegacy**(`m`): [`Platform`](../interfaces/Platform.md)

Defined in: [resolve.ts:121](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/platform/src/resolve.ts#L121)

The MIGRATE direction — a legacy [PlatformManifest](../interfaces/PlatformManifest.md) → the C053 `{ system, brand }` split (the inverse of
[liftSystemBrand](liftSystemBrand.md)). `opts` → per-service serviceOpts; `vars` split into globalServiceOpts (system-shaped) vs
globalBrandOpts (identity). Round-trips byte-for-byte: `liftSystemBrand(liftLegacy(m))` generates the same app as `m`.

## Parameters

### m

[`PlatformManifest`](../interfaces/PlatformManifest.md)

## Returns

[`Platform`](../interfaces/Platform.md)
