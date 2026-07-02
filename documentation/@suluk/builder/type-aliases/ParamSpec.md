[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / ParamSpec

# Type Alias: ParamSpec

> **ParamSpec** = \{ `default?`: `string`; `options`: `string`[]; `required?`: `boolean`; `type`: `"enum"`; \} \| \{ `default?`: `string`; `required?`: `boolean`; `type`: `"text"`; \} \| \{ `default?`: `number`; `required?`: `boolean`; `type`: `"number"`; \} \| \{ `default?`: `boolean`; `required?`: `boolean`; `type`: `"boolean"`; \} \| \{ `controls`: [`ListControl`](ListControl.md)[]; `default?`: `string`[]; `options`: `string`[]; `type`: `"list"`; \}

Defined in: [dsl.ts:33](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/builder/src/dsl.ts#L33)

`@suluk/builder` — the tiered contract-narrowing DSL (components → blocks → sections → pages), bound to the
Suluk cycle. The mechanism is ported from ~/apps/multivendorbuilder's DSL and rebuilt with the Suluk
discipline (typed, tested, projected from live entities instead of hand-authored). The load-bearing idea is
the contract: a document's `params` is EXACTLY and ONLY what the tier above may set — the narrowing is the
safety surface, the same discipline as Suluk's per-viewer doc projection.

The Suluk twist: a SECTION is a full-stack vertical slice (data → contract → docs → state → ui) and a PAGE
composes sections — so buildApp emits the backend (routes + v4) AND the frontend (components + page TSX)
from one spec. Each slice can also be packaged as a shadcn REGISTRY ITEM (toShadcnRegistry) bundling its
frontend + backend files into one installable unit. CANDIDATE tooling — NOT official OAS.

## Union Members

### Type Literal

\{ `default?`: `string`; `options`: `string`[]; `required?`: `boolean`; `type`: `"enum"`; \}

***

### Type Literal

\{ `default?`: `string`; `required?`: `boolean`; `type`: `"text"`; \}

***

### Type Literal

\{ `default?`: `number`; `required?`: `boolean`; `type`: `"number"`; \}

***

### Type Literal

\{ `default?`: `boolean`; `required?`: `boolean`; `type`: `"boolean"`; \}

***

### Type Literal

\{ `controls`: [`ListControl`](ListControl.md)[]; `default?`: `string`[]; `options`: `string`[]; `type`: `"list"`; \}

#### controls

> **controls**: [`ListControl`](ListControl.md)[]

Which manipulations the consumer is allowed (the narrowing on a list).

#### default?

> `optional` **default?**: `string`[]

Default ordered selection.

#### options

> **options**: `string`[]

Catalog keys the consumer may pick from.

#### type

> **type**: `"list"`
