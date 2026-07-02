[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/models](../README.md) / ModelRecord

# Interface: ModelRecord

Defined in: [types.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/models/src/types.ts#L23)

## Properties

### caps

> **caps**: `object`

Defined in: [types.ts:44](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/models/src/types.ts#L44)

capabilities are DECLARED-not-verified (provider self-report; we do not self-test).

#### forcedToolChoice

> **forcedToolChoice**: [`Cell`](Cell.md)\<`boolean`\>

#### inputModalities

> **inputModalities**: [`Cell`](Cell.md)\<`string`[]\>

#### jsonSchemaStrict

> **jsonSchemaStrict**: [`Cell`](Cell.md)\<`boolean`\>

#### outputModalities

> **outputModalities**: [`Cell`](Cell.md)\<`string`[]\>

#### parallelToolCalls

> **parallelToolCalls**: [`Cell`](Cell.md)\<`boolean`\>

#### structuredOutput

> **structuredOutput**: [`Cell`](Cell.md)\<`boolean`\>

#### toolCalling

> **toolCalling**: [`Cell`](Cell.md)\<`boolean`\>

***

### context

> **context**: `object`

Defined in: [types.ts:35](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/models/src/types.ts#L35)

#### longCtxFidelity

> **longCtxFidelity**: [`Cell`](Cell.md)\<[`Tier`](../type-aliases/Tier.md)\>

RULER/needle — does the big window actually hold quality? sparse public data ⇒ mostly unknown; NEVER inferred from size.

#### maxOutput

> **maxOutput**: [`Cell`](Cell.md)\<`number`\>

#### maxWindow

> **maxWindow**: [`Cell`](Cell.md)\<`number`\>

***

### cost

> **cost**: `object`

Defined in: [types.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/models/src/types.ts#L29)

#### cachedInputPerMtok

> **cachedInputPerMtok**: [`Cell`](Cell.md)\<`number`\>

#### inputPerMtok

> **inputPerMtok**: [`Cell`](Cell.md)\<`number`\>

#### outputPerMtok

> **outputPerMtok**: [`Cell`](Cell.md)\<`number`\>

#### perRequest

> **perRequest**: [`Cell`](Cell.md)\<`boolean`\>

***

### family

> **family**: `string`

Defined in: [types.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/models/src/types.ts#L27)

***

### gov

> **gov**: `object`

Defined in: [types.ts:63](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/models/src/types.ts#L63)

#### dataRetention

> **dataRetention**: [`Cell`](Cell.md)\<[`DataRetention`](../type-aliases/DataRetention.md)\>

#### license

> **license**: [`Cell`](Cell.md)\<`string`\>

#### region

> **region**: [`Cell`](Cell.md)\<`string`\>

***

### id

> **id**: `string`

Defined in: [types.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/models/src/types.ts#L25)

the OpenRouter id the selector compiles against (stable wire id).

***

### intel

> **intel**: `object`

Defined in: [types.ts:54](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/models/src/types.ts#L54)

"intelligence" split into 6 orthogonal-ish, source-separated dimensions (ranked by relevance to tool-using agents).

#### agenticToolUse

> **agenticToolUse**: [`Cell`](Cell.md)\<[`Tier`](../type-aliases/Tier.md)\>

#### coding

> **coding**: [`Cell`](Cell.md)\<[`Tier`](../type-aliases/Tier.md)\>

#### humanPreference

> **humanPreference**: [`Cell`](Cell.md)\<[`Tier`](../type-aliases/Tier.md)\>

#### instructionFollowing

> **instructionFollowing**: [`Cell`](Cell.md)\<[`Tier`](../type-aliases/Tier.md)\>

#### knowledge

> **knowledge**: [`Cell`](Cell.md)\<[`Tier`](../type-aliases/Tier.md)\>

#### longCtxComprehension

> **longCtxComprehension**: [`Cell`](Cell.md)\<[`Tier`](../type-aliases/Tier.md)\>

#### reasoning

> **reasoning**: [`Cell`](Cell.md)\<[`Tier`](../type-aliases/Tier.md)\>

***

### ops

> **ops**: `object`

Defined in: [types.ts:64](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/models/src/types.ts#L64)

#### popularityRank

> **popularityRank**: [`Cell`](Cell.md)\<`number`\>

#### priceVolatile

> **priceVolatile**: [`Cell`](Cell.md)\<`boolean`\>

#### providerFanOut

> **providerFanOut**: [`Cell`](Cell.md)\<`number`\>

#### releaseDate

> **releaseDate**: [`Cell`](Cell.md)\<`string`\>

***

### provider

> **provider**: `string`

Defined in: [types.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/models/src/types.ts#L26)

***

### speed

> **speed**: `object`

Defined in: [types.ts:42](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/models/src/types.ts#L42)

Artificial-Analysis single-vendor, provider/route/load-dependent — their measurement, not a guarantee.

#### throughput

> **throughput**: [`Cell`](Cell.md)\<[`Tier`](../type-aliases/Tier.md)\>

#### ttft

> **ttft**: [`Cell`](Cell.md)\<[`Tier`](../type-aliases/Tier.md)\>

***

### status

> **status**: `"active"` \| `"deprecated"` \| `"sunset"` \| `"preview"`

Defined in: [types.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/models/src/types.ts#L28)
