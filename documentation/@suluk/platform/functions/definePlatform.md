[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / definePlatform

# Function: definePlatform()

`@suluk/platform` — the platform generator (C051). Write one `definePlatform` manifest; the generator plans the
shadcn-registry adds, generates the wired Hono entry, and merges each module's provision fragment into a single
provision.config. The higher-level surface over C047's provision.config + the C050 registry: `services: ["auth",
"credits", "billing"]` → a whole backend. The generated `provision.config.ts` imports `mergeProvision` from here.

## Call Signature

> **definePlatform**(`input`): [`PlatformManifest`](../interfaces/PlatformManifest.md)

Defined in: [manifest.ts:108](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/platform/src/manifest.ts#L108)

Validate + return a platform. Accepts BOTH the legacy [PlatformManifest](../interfaces/PlatformManifest.md) and the C053 `{ system, brand }` shape
(discriminated on the `system` key). Overloaded so the return type matches the input surface.

### Parameters

#### input

[`PlatformManifest`](../interfaces/PlatformManifest.md)

### Returns

[`PlatformManifest`](../interfaces/PlatformManifest.md)

## Call Signature

> **definePlatform**(`input`): [`Platform`](../interfaces/Platform.md)

Defined in: [manifest.ts:109](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/platform/src/manifest.ts#L109)

Validate + return a platform. Accepts BOTH the legacy [PlatformManifest](../interfaces/PlatformManifest.md) and the C053 `{ system, brand }` shape
(discriminated on the `system` key). Overloaded so the return type matches the input surface.

### Parameters

#### input

[`Platform`](../interfaces/Platform.md)

### Returns

[`Platform`](../interfaces/Platform.md)
