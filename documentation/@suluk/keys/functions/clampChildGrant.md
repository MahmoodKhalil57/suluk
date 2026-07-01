[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/keys](../README.md) / clampChildGrant

# Function: clampChildGrant()

> **clampChildGrant**(`parent`, `requested`): [`EffectiveCaps`](../interfaces/EffectiveCaps.md)

Defined in: [packages/keys/src/chain.ts:107](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/keys/src/chain.ts#L107)

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
