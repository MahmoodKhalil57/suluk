[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / Preferences

# Interface: Preferences

Defined in: [models/src/types.ts:96](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/models/src/types.ts#L96)

Preference — RANKS the survivors. A named profile is the 90% case; the escape hatch is ≤4 small int weights.

## Properties

### prefer?

> `optional` **prefer?**: `object`

Defined in: [models/src/types.ts:98](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/models/src/types.ts#L98)

#### context?

> `optional` **context?**: `0` \| `1` \| `2` \| `3`

#### cost?

> `optional` **cost?**: `0` \| `1` \| `2` \| `3`

#### intelligence?

> `optional` **intelligence?**: `0` \| `1` \| `2` \| `3`

#### speed?

> `optional` **speed?**: `0` \| `1` \| `2` \| `3`

***

### profile?

> `optional` **profile?**: [`Profile`](../../models/type-aliases/Profile.md)

Defined in: [models/src/types.ts:97](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/models/src/types.ts#L97)

***

### taskShape?

> `optional` **taskShape?**: `"agentic"` \| `"coding"` \| `"reasoning"`

Defined in: [models/src/types.ts:100](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/models/src/types.ts#L100)

routes the single "intelligence" knob to the ONE relevant INTEL sub-tier.
