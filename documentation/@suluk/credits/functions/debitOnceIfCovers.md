[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/credits](../README.md) / debitOnceIfCovers

# Function: debitOnceIfCovers()

> **debitOnceIfCovers**(`db`, `userId`, `amount`, `reason`, `idemKey`): `Promise`\<[`DebitOutcome`](../type-aliases/DebitOutcome.md)\>

Defined in: [tooling/ts/packages/credits/src/credits.ts:102](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/credits/src/credits.ts#L102)

Idempotent atomic debit: debit `amount` ONLY if the balance covers it AND this exact logical operation (identified by
`idemKey`) hasn't already been debited. The row id is DERIVED from the key (`${reason}:${idemKey}`), so a retry/duplicate
collides on the primary key and is IGNORED — it can never mint a second debit. The money-OUT double-spend guard a
per-call random nonce lacks for PARTIAL refunds. One statement (INSERT OR IGNORE … WHERE SUM(delta) >= amount), atomic
on both engines. Returns `debited` (fresh — `nonce` anchors the downstream Stripe idempotency key), `replayed` (already
debited — caller MUST NOT move money again), or `insufficient` (balance no longer covers it).

## Parameters

### db

[`CreditsDB`](../type-aliases/CreditsDB.md)

### userId

`string`

### amount

`number`

### reason

`string`

### idemKey

`string`

## Returns

`Promise`\<[`DebitOutcome`](../type-aliases/DebitOutcome.md)\>
