[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / resolveNodeOpts

# Function: resolveNodeOpts()

> **resolveNodeOpts**(`system`, `brand`): `object`

Defined in: [resolve.ts:49](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/resolve.ts#L49)

Resolve the node quadrants of `{ system, brand }` into the `{ services, opts, vars }` a legacy manifest carries:
 - `opts[id]` (→ entry): the globalServiceOpts keys the service `reads`, deep-merged UNDER its per-service serviceOpts.
   Empty results are omitted, so the map matches a hand-written legacy manifest (which only lists services that HAVE opts).
 - `vars` (→ [vars]): every scalar value across globalServiceOpts + globalBrandOpts + per-service brandOpts. `buildWrangler`
   only surfaces the ones that are declared service env vars, so extra keys are harmless.

## Parameters

### system

[`SystemManifest`](../interfaces/SystemManifest.md)

### brand

[`BrandManifest`](../interfaces/BrandManifest.md)

## Returns

`object`

### opts

> **opts**: `Record`\<`string`, `Record`\<`string`, `unknown`\>\>

### services

> **services**: `string`[]

### vars

> **vars**: `Record`\<`string`, `string`\>
