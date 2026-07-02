[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/credits](../README.md) / debitIfCovers

# Function: debitIfCovers()

> **debitIfCovers**(`db`, `userId`, `amount`, `reason`, `keyId?`): `Promise`\<`boolean`\>

Defined in: [tooling/ts/packages/credits/src/credits.ts:60](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/credits/src/credits.ts#L60)

ATOMIC metered debit — append `-amount` ONLY IF the balance still covers it, in ONE conditional INSERT (atomic on both
bun:sqlite and D1), then best-effort attribute it. Returns true when debited, false when the balance raced below the
cost. Closes the read-then-write window where K concurrent charges each read the same balance, all pass `cost <=
balance`, and all append — driving the ledger NEGATIVE. The self-guard rejects a non-positive/non-integer `amount`
(a negative would compute delta=+amount and trivially pass the WHERE, MINTING credits).

## Parameters

### db

[`CreditsDB`](../type-aliases/CreditsDB.md)

### userId

`string`

### amount

`number`

### reason

`string`

### keyId?

`string` \| `null`

## Returns

`Promise`\<`boolean`\>
