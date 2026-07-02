[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / DslNode

# Interface: DslNode

Defined in: [dsl.ts:57](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/builder/src/dsl.ts#L57)

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

### children?

> `optional` **children?**: [`DslChild`](../type-aliases/DslChild.md) \| [`DslChild`](../type-aliases/DslChild.md)[]

Defined in: [dsl.ts:64](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/builder/src/dsl.ts#L64)

***

### props?

> `optional` **props?**: `Record`\<`string`, `unknown`\>

Defined in: [dsl.ts:63](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/builder/src/dsl.ts#L63)

Inputs for the referenced doc, or props for a component. A value may be a {$bind} into the current doc.

***

### type

> **type**: `string`

Defined in: [dsl.ts:59](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/builder/src/dsl.ts#L59)

A component (leaf) name, or a block/section doc name.

***

### variant?

> `optional` **variant?**: `string`

Defined in: [dsl.ts:61](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/builder/src/dsl.ts#L61)

Pick a named preset (variant) on the referenced document.
