[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / liftLegacy

# Function: liftLegacy()

> **liftLegacy**(`m`): [`Platform`](../interfaces/Platform.md)

Defined in: [resolve.ts:80](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/platform/src/resolve.ts#L80)

The MIGRATE direction — a legacy [PlatformManifest](../interfaces/PlatformManifest.md) → the C053 `{ system, brand }` split (the inverse of
[liftSystemBrand](liftSystemBrand.md)). `opts` → per-service serviceOpts; `vars` split into globalServiceOpts (system-shaped) vs
globalBrandOpts (identity). Round-trips byte-for-byte: `liftSystemBrand(liftLegacy(m))` generates the same app as `m`.

## Parameters

### m

[`PlatformManifest`](../interfaces/PlatformManifest.md)

## Returns

[`Platform`](../interfaces/Platform.md)
