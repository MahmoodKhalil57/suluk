[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/sdk](../README.md) / SdkOptions

# Interface: SdkOptions

Defined in: [generate.ts:153](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/sdk/src/generate.ts#L153)

`@suluk/sdk` — generate a complete, intuitive TypeScript SDK from a v4 "Suluk" contract. ofetch-based,
entity-grouped, fully typed, auth wired, and the v4 superpowers (declared cost + access) surfaced as typed
metadata on each method. A library a developer downloads and uses straight away — not a bag of functions.

  import { generateSdk } from "@suluk/sdk";
  const tsSource = generateSdk(v4Document, { baseURL: "https://api.example.com" }); // a self-contained .ts file

## Properties

### baseURL?

> `optional` **baseURL?**: `string`

Defined in: [generate.ts:153](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/sdk/src/generate.ts#L153)
