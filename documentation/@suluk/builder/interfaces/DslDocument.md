[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / DslDocument

# Interface: DslDocument

Defined in: [dsl.ts:67](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/builder/src/dsl.ts#L67)

`@suluk/builder` — the tiered contract-narrowing DSL (components → blocks → sections → pages), bound to the
Suluk cycle. The mechanism is ported from ~/apps/multivendorbuilder's DSL and rebuilt with the Suluk
discipline (typed, tested, projected from live entities instead of hand-authored). The load-bearing idea is
the contract: a document's `params` is EXACTLY and ONLY what the tier above may set — the narrowing is the
safety surface, the same discipline as Suluk's per-viewer doc projection.

The Suluk twist: a SECTION is a full-stack vertical slice (data → contract → docs → state → ui) and a PAGE
composes sections — so buildApp emits the backend (routes + v4) AND the frontend (components + page TSX)
from one spec. Each slice can also be packaged as a shadcn REGISTRY ITEM (toShadcnRegistry) bundling its
frontend + backend files into one installable unit. CANDIDATE tooling — NOT official OAS.

## Properties

### catalog?

> `optional` **catalog?**: `Record`\<`string`, [`DslNode`](DslNode.md)\>

Defined in: [dsl.ts:75](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/builder/src/dsl.ts#L75)

Named, fully-configured child instances a `list` param picks from.

***

### name

> **name**: `string`

Defined in: [dsl.ts:68](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/builder/src/dsl.ts#L68)

***

### params?

> `optional` **params?**: `Record`\<`string`, [`ParamSpec`](../type-aliases/ParamSpec.md)\>

Defined in: [dsl.ts:71](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/builder/src/dsl.ts#L71)

The upward contract: ALL (and only) what the tier above may set.

***

### root

> **root**: [`DslNode`](DslNode.md)

Defined in: [dsl.ts:76](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/builder/src/dsl.ts#L76)

***

### tier

> **tier**: [`Tier`](../type-aliases/Tier.md)

Defined in: [dsl.ts:69](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/builder/src/dsl.ts#L69)

***

### variants?

> `optional` **variants?**: `Record`\<`string`, `Record`\<`string`, `unknown`\>\>

Defined in: [dsl.ts:73](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/builder/src/dsl.ts#L73)

Named presets binding this document's own params.
