[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/sdk](../README.md) / OpInfo

# Interface: OpInfo

Defined in: [generate.ts:57](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/sdk/src/generate.ts#L57)

`@suluk/sdk` — generate a complete, intuitive TypeScript SDK from a v4 "Suluk" contract. ofetch-based,
entity-grouped, fully typed, auth wired, and the v4 superpowers (declared cost + access) surfaced as typed
metadata on each method. A library a developer downloads and uses straight away — not a bag of functions.

  import { generateSdk } from "@suluk/sdk";
  const tsSource = generateSdk(v4Document, { baseURL: "https://api.example.com" }); // a self-contained .ts file

## Properties

### bid?

> `optional` **bid?**: `string`

Defined in: [generate.ts:63](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/sdk/src/generate.ts#L63)

***

### bodyRaw?

> `optional` **bodyRaw?**: `unknown`

Defined in: [generate.ts:59](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/sdk/src/generate.ts#L59)

***

### bodyTs?

> `optional` **bodyTs?**: `string`

Defined in: [generate.ts:63](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/sdk/src/generate.ts#L63)

***

### cost

> **cost**: `number` \| `null`

Defined in: [generate.ts:60](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/sdk/src/generate.ts#L60)

***

### fields?

> `optional` **fields?**: [`FieldDescriptor`](../../examples/interfaces/FieldDescriptor.md)[]

Defined in: [generate.ts:62](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/sdk/src/generate.ts#L62)

***

### member

> **member**: `string`

Defined in: [generate.ts:58](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/sdk/src/generate.ts#L58)

***

### method

> **method**: `string`

Defined in: [generate.ts:58](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/sdk/src/generate.ts#L58)

***

### name

> **name**: `string`

Defined in: [generate.ts:58](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/sdk/src/generate.ts#L58)

***

### ns

> **ns**: `string`[]

Defined in: [generate.ts:58](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/sdk/src/generate.ts#L58)

***

### pathParams

> **pathParams**: `string`[]

Defined in: [generate.ts:59](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/sdk/src/generate.ts#L59)

***

### qid?

> `optional` **qid?**: `string`

Defined in: [generate.ts:63](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/sdk/src/generate.ts#L63)

***

### queryRaw?

> `optional` **queryRaw?**: `unknown`

Defined in: [generate.ts:59](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/sdk/src/generate.ts#L59)

***

### queryTs?

> `optional` **queryTs?**: `string`

Defined in: [generate.ts:63](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/sdk/src/generate.ts#L63)

***

### requires

> **requires**: `string`

Defined in: [generate.ts:60](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/sdk/src/generate.ts#L60)

***

### respType

> **respType**: `string`

Defined in: [generate.ts:59](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/sdk/src/generate.ts#L59)

***

### scope?

> `optional` **scope?**: `string`

Defined in: [generate.ts:60](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/sdk/src/generate.ts#L60)

***

### store?

> `optional` **store?**: [`SulukStore`](../../core/interfaces/SulukStore.md)

Defined in: [generate.ts:61](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/sdk/src/generate.ts#L61)

***

### summary?

> `optional` **summary?**: `string`

Defined in: [generate.ts:60](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/sdk/src/generate.ts#L60)

***

### uri

> **uri**: `string`

Defined in: [generate.ts:58](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/sdk/src/generate.ts#L58)
