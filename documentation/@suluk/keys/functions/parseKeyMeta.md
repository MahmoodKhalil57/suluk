[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/keys](../README.md) / parseKeyMeta

# Function: parseKeyMeta()

> **parseKeyMeta**(`metadata`): `object`

Defined in: [packages/keys/src/scopes.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/keys/src/scopes.ts#L25)

metadata JSON → the per-key controls (each null when absent/invalid): the PAID credit cap + the rate-limit share %.
 Defensive — a bad value reads as "no override"; the share is clamped to [1,100] to mirror the auth-time clamp.

## Parameters

### metadata

`string` \| `null`

## Returns

`object`

### creditLimit

> **creditLimit**: `number` \| `null`

### rateLimitSharePct

> **rateLimitSharePct**: `number` \| `null`
