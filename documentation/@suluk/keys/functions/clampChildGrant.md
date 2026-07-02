[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/keys](../README.md) / clampChildGrant

# Function: clampChildGrant()

> **clampChildGrant**(`parent`, `requested`): [`EffectiveCaps`](../interfaces/EffectiveCaps.md)

Defined in: [packages/keys/src/chain.ts:107](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/keys/src/chain.ts#L107)

Clamp a requested CHILD grant to the parent's EFFECTIVE grant — a child can never out-scope or out-spend an ancestor.
 scopes ⊆ parent's; each cap/expiry = min(requested ?? ∞, parent ?? ∞) (null only when BOTH are unbounded). Pure.

## Parameters

### parent

[`EffectiveCaps`](../interfaces/EffectiveCaps.md)

### requested

#### creditLimit?

`number` \| `null`

#### expiresAt?

`number` \| `null`

#### rateLimitSharePct?

`number` \| `null`

#### scopes

`string`[]

## Returns

[`EffectiveCaps`](../interfaces/EffectiveCaps.md)
