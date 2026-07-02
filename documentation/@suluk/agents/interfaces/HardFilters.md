[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / HardFilters

# Interface: HardFilters

Defined in: [models/src/types.ts:76](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/models/src/types.ts#L76)

Hard requirements — these FILTER (can empty the set ⇒ fail-loud), never rank.

## Properties

### fidelityFloor?

> `optional` **fidelityFloor?**: [`Tier`](../../models/type-aliases/Tier.md)

Defined in: [models/src/types.ts:86](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/models/src/types.ts#L86)

***

### inputModalities?

> `optional` **inputModalities?**: `string`[]

Defined in: [models/src/types.ts:81](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/models/src/types.ts#L81)

***

### maxInputPrice?

> `optional` **maxInputPrice?**: `number`

Defined in: [models/src/types.ts:87](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/models/src/types.ts#L87)

***

### maxOutputPrice?

> `optional` **maxOutputPrice?**: `number`

Defined in: [models/src/types.ts:88](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/models/src/types.ts#L88)

***

### minOutputTokens?

> `optional` **minOutputTokens?**: `number`

Defined in: [models/src/types.ts:85](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/models/src/types.ts#L85)

***

### minWindowRequired?

> `optional` **minWindowRequired?**: `number`

Defined in: [models/src/types.ts:84](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/models/src/types.ts#L84)

the analyzer's per-agent minWindowRequired (context.ts) becomes the hard min-context gate.

***

### needsForcedToolChoice?

> `optional` **needsForcedToolChoice?**: `boolean`

Defined in: [models/src/types.ts:78](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/models/src/types.ts#L78)

***

### needsStructured?

> `optional` **needsStructured?**: `boolean`

Defined in: [models/src/types.ts:79](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/models/src/types.ts#L79)

***

### needsTools?

> `optional` **needsTools?**: `boolean`

Defined in: [models/src/types.ts:77](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/models/src/types.ts#L77)

***

### outputModalities?

> `optional` **outputModalities?**: `string`[]

Defined in: [models/src/types.ts:82](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/models/src/types.ts#L82)

***

### policy?

> `optional` **policy?**: `object`

Defined in: [models/src/types.ts:90](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/models/src/types.ts#L90)

C028 governance/allowlist — the TERMINAL, non-overridable MEET (a preference can NEVER widen these).

#### allowedLicenses?

> `optional` **allowedLicenses?**: `string`[]

#### allowedRegions?

> `optional` **allowedRegions?**: `string`[]

#### allowedRetention?

> `optional` **allowedRetention?**: [`DataRetention`](../../models/type-aliases/DataRetention.md)[]

#### modelAllowlist?

> `optional` **modelAllowlist?**: `string`[]

***

### strictSchema?

> `optional` **strictSchema?**: `boolean`

Defined in: [models/src/types.ts:80](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/models/src/types.ts#L80)
