[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/models](../README.md) / Preferences

# Interface: Preferences

Defined in: [types.ts:96](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/models/src/types.ts#L96)

Preference — RANKS the survivors. A named profile is the 90% case; the escape hatch is ≤4 small int weights.

## Properties

### prefer?

> `optional` **prefer?**: `object`

Defined in: [types.ts:98](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/models/src/types.ts#L98)

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

> `optional` **profile?**: [`Profile`](../type-aliases/Profile.md)

Defined in: [types.ts:97](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/models/src/types.ts#L97)

***

### taskShape?

> `optional` **taskShape?**: `"agentic"` \| `"coding"` \| `"reasoning"`

Defined in: [types.ts:100](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/models/src/types.ts#L100)

routes the single "intelligence" knob to the ONE relevant INTEL sub-tier.
