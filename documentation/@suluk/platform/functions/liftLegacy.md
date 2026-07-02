[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / liftLegacy

# Function: liftLegacy()

> **liftLegacy**(`m`): [`Platform`](../interfaces/Platform.md)

Defined in: [resolve.ts:121](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/resolve.ts#L121)

The MIGRATE direction — a legacy [PlatformManifest](../interfaces/PlatformManifest.md) → the C053 `{ system, brand }` split (the inverse of
[liftSystemBrand](liftSystemBrand.md)). `opts` → per-service serviceOpts; `vars` split into globalServiceOpts (system-shaped) vs
globalBrandOpts (identity). Round-trips byte-for-byte: `liftSystemBrand(liftLegacy(m))` generates the same app as `m`.

## Parameters

### m

[`PlatformManifest`](../interfaces/PlatformManifest.md)

## Returns

[`Platform`](../interfaces/Platform.md)
