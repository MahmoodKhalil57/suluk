[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / isBind

# Function: isBind()

> **isBind**(`v`): `v is BindRef`

Defined in: [dsl.ts:79](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/builder/src/dsl.ts#L79)

`@suluk/builder` — the tiered contract-narrowing DSL (components → blocks → sections → pages), bound to the
Suluk cycle. The mechanism is ported from ~/apps/multivendorbuilder's DSL and rebuilt with the Suluk
discipline (typed, tested, projected from live entities instead of hand-authored). The load-bearing idea is
the contract: a document's `params` is EXACTLY and ONLY what the tier above may set — the narrowing is the
safety surface, the same discipline as Suluk's per-viewer doc projection.

The Suluk twist: a SECTION is a full-stack vertical slice (data → contract → docs → state → ui) and a PAGE
composes sections — so buildApp emits the backend (routes + v4) AND the frontend (components + page TSX)
from one spec. Each slice can also be packaged as a shadcn REGISTRY ITEM (toShadcnRegistry) bundling its
frontend + backend files into one installable unit. CANDIDATE tooling — NOT official OAS.

## Parameters

### v

`unknown`

## Returns

`v is BindRef`
