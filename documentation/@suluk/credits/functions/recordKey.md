[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/credits](../README.md) / recordKey

# Function: recordKey()

> **recordKey**(`db`, `txnId`, `keyId`): `Promise`\<`void`\>

Defined in: [tooling/ts/packages/credits/src/credits.ts:44](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/credits/src/credits.ts#L44)

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
