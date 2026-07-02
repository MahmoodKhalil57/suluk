[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/models](../README.md) / ResolvedProfile

# Interface: ResolvedProfile

Defined in: [profiles.ts:9](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/models/src/profiles.ts#L9)

## Properties

### impliedFilters

> **impliedFilters**: `Partial`\<[`HardFilters`](HardFilters.md)\>

Defined in: [profiles.ts:13](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/models/src/profiles.ts#L13)

filters the profile auto-wires (an author choosing "tool-reliable" implicitly requires tool-calling).

***

### prefer

> **prefer**: `object`

Defined in: [profiles.ts:10](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/models/src/profiles.ts#L10)

#### context

> **context**: `0` \| `1` \| `2` \| `3`

#### cost

> **cost**: `0` \| `1` \| `2` \| `3`

#### intelligence

> **intelligence**: `0` \| `1` \| `2` \| `3`

#### speed

> **speed**: `0` \| `1` \| `2` \| `3`

***

### taskShape?

> `optional` **taskShape?**: `"agentic"` \| `"coding"` \| `"reasoning"`

Defined in: [profiles.ts:11](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/models/src/profiles.ts#L11)
