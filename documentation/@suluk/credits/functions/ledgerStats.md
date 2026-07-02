[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/credits](../README.md) / ledgerStats

# Function: ledgerStats()

> **ledgerStats**(`db`): `Promise`\<[`LedgerStats`](../interfaces/LedgerStats.md)\>

Defined in: [tooling/ts/packages/credits/src/credits.ts:182](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/credits/src/credits.ts#L182)

Aggregate ledger stats (granted vs spent, outstanding) — the generic part of an admin dashboard. The user COUNT is the
 app's (it owns the user table); compose it on top.

## Parameters

### db

[`CreditsDB`](../type-aliases/CreditsDB.md)

## Returns

`Promise`\<[`LedgerStats`](../interfaces/LedgerStats.md)\>
