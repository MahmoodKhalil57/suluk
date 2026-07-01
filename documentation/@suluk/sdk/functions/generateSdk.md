[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/sdk](../README.md) / generateSdk

# Function: generateSdk()

> **generateSdk**(`doc`, `opts?`): `string`

Defined in: [generate.ts:155](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/sdk/src/generate.ts#L155)

`@suluk/sdk` — generate a complete, intuitive TypeScript SDK from a v4 "Suluk" contract. ofetch-based,
entity-grouped, fully typed, auth wired, and the v4 superpowers (declared cost + access) surfaced as typed
metadata on each method. A library a developer downloads and uses straight away — not a bag of functions.

  import { generateSdk } from "@suluk/sdk";
  const tsSource = generateSdk(v4Document, { baseURL: "https://api.example.com" }); // a self-contained .ts file

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### opts?

[`SdkOptions`](../interfaces/SdkOptions.md) = `{}`

## Returns

`string`
