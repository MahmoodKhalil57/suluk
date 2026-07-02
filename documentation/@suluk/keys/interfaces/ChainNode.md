[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/keys](../README.md) / ChainNode

# Interface: ChainNode

Defined in: [packages/keys/src/chain.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/keys/src/chain.ts#L14)

One node of a caller's chain — itself or an ancestor — with its OWN (pre-chain) grant + caps + its materialized path.

## Properties

### disabled?

> `optional` **disabled?**: `boolean`

Defined in: [packages/keys/src/chain.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/keys/src/chain.ts#L25)

an ancestor soft-disabled (enabled=false) — drives the auth-time revocation cascade.

***

### keyId

> **keyId**: `string`

Defined in: [packages/keys/src/chain.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/keys/src/chain.ts#L15)

***

### ownCreditLimit

> **ownCreditLimit**: `number` \| `null`

Defined in: [packages/keys/src/chain.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/keys/src/chain.ts#L20)

***

### ownExpiresAt

> **ownExpiresAt**: `number` \| `null`

Defined in: [packages/keys/src/chain.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/keys/src/chain.ts#L23)

epoch ms — the node's own expiry; null = never.

***

### ownRateSharePct

> **ownRateSharePct**: `number` \| `null`

Defined in: [packages/keys/src/chain.ts:21](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/keys/src/chain.ts#L21)

***

### path

> **path**: `string`

Defined in: [packages/keys/src/chain.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/keys/src/chain.ts#L17)

the node's own materialized path (a prefix of the caller's) — used to sum its subtree spend.

***

### scopes

> **scopes**: `string`[]

Defined in: [packages/keys/src/chain.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/keys/src/chain.ts#L19)

the node's OWN granted tool scopes (an unrestricted account-root never appears as a node).
