[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/credits](../README.md) / recordKey

# Function: recordKey()

> **recordKey**(`db`, `txnId`, `keyId`): `Promise`\<`void`\>

Defined in: [tooling/ts/packages/credits/src/credits.ts:44](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/credits/src/credits.ts#L44)

Attribute a debit row to the API KEY that spent it (per-key usage + limit join). Best-effort + idempotent (PK on
 txnId) — attribution is reporting, NOT the money path, so a failure here must never break the debit it rode in on.

## Parameters

### db

[`CreditsDB`](../type-aliases/CreditsDB.md)

### txnId

`string`

### keyId

`string` \| `null` \| `undefined`

## Returns

`Promise`\<`void`\>
