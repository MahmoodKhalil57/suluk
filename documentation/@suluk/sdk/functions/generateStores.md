[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/sdk](../README.md) / generateStores

# Function: generateStores()

> **generateStores**(`doc`, `opts?`): `string`

Defined in: [generate-stores.ts:36](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/sdk/src/generate-stores.ts#L36)

generateStores(doc) — project the C037 reactive facet (`x-suluk-store` + `x-suluk-notify`) into a typed Nano Stores
reactive layer (states + mutation→store invalidation + a hookable callback seam) on top of the generated client.

  import { generateSdk, generateStores } from "@suluk/sdk";
  const sdk = generateSdk(doc, { baseURL });   // the typed RPC client
  const stores = generateStores(doc);          // the reactive layer over it (a self-contained .ts file)

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### opts?

[`StoresOptions`](../interfaces/StoresOptions.md) = `{}`

## Returns

`string`
