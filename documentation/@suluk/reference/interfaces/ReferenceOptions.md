[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/reference](../README.md) / ReferenceOptions

# Interface: ReferenceOptions

Defined in: [reference/src/index.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/reference/src/index.ts#L27)

## Properties

### conformanceUrl?

> `optional` **conformanceUrl?**: `string`

Defined in: [reference/src/index.ts:44](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/reference/src/index.ts#L44)

a URL serving a generated conformance suite (@suluk/testgen) → a "Download conformance tests" affordance.

***

### costLedgerUrl?

> `optional` **costLedgerUrl?**: `string`

Defined in: [reference/src/index.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/reference/src/index.ts#L32)

a same-origin URL returning the cost ledger (with opStats) → live declared-vs-actual cost drift.

***

### pageTitle?

> `optional` **pageTitle?**: `string`

Defined in: [reference/src/index.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/reference/src/index.ts#L28)

***

### plugins?

> `optional` **plugins?**: [`ReferencePlugin`](ReferencePlugin.md)[]

Defined in: [reference/src/index.ts:45](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/reference/src/index.ts#L45)

***

### sdkUrl?

> `optional` **sdkUrl?**: `string`

Defined in: [reference/src/index.ts:42](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/reference/src/index.ts#L42)

a URL serving a generated TypeScript SDK (@suluk/sdk) → a prominent "Download SDK" affordance.

***

### tagline?

> `optional` **tagline?**: `string`

Defined in: [reference/src/index.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/reference/src/index.ts#L29)

***

### tryIt?

> `optional` **tryIt?**: `boolean`

Defined in: [reference/src/index.ts:34](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/reference/src/index.ts#L34)

enable the in-page try-it executor (same-origin fetch). Default true.

***

### viewers?

> `optional` **viewers?**: [`Viewer`](Viewer.md)[]

Defined in: [reference/src/index.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/reference/src/index.ts#L30)

***

### whoamiUrl?

> `optional` **whoamiUrl?**: `string`

Defined in: [reference/src/index.ts:40](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/reference/src/index.ts#L40)

a same-origin URL returning `{ viewer: "<id>" }` for the CURRENT session → the renderer auto-selects that
viewer's lens (the council-ratified L2 "live per-user view") and re-checks on focus. The full canonical document
is ALWAYS the source + always escapable via "Everything" — the projection is a client-side legible subset.
