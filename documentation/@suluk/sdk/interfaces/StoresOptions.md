[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/sdk](../README.md) / StoresOptions

# Interface: StoresOptions

Defined in: [generate-stores.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/sdk/src/generate-stores.ts#L24)

generateStores(doc) — project the C037 reactive facet (`x-suluk-store` + `x-suluk-notify`) into a typed Nano Stores
reactive layer (states + mutation→store invalidation + a hookable callback seam) on top of the generated client.

  import { generateSdk, generateStores } from "@suluk/sdk";
  const sdk = generateSdk(doc, { baseURL });   // the typed RPC client
  const stores = generateStores(doc);          // the reactive layer over it (a self-contained .ts file)

## Properties

### clientModule?

> `optional` **clientModule?**: `string`

Defined in: [generate-stores.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/sdk/src/generate-stores.ts#L26)

Import specifier for the generated SDK module (where `SulukClient` lives). Default `"./sdk"`.
