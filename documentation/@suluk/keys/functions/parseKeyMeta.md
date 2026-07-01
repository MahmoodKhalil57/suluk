[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/keys](../README.md) / parseKeyMeta

# Function: parseKeyMeta()

> **parseKeyMeta**(`metadata`): `object`

Defined in: [packages/keys/src/scopes.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/keys/src/scopes.ts#L25)

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
