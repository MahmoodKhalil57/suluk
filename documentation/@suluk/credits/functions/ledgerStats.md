[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/credits](../README.md) / ledgerStats

# Function: ledgerStats()

> **ledgerStats**(`db`): `Promise`\<[`LedgerStats`](../interfaces/LedgerStats.md)\>

Defined in: [tooling/ts/packages/credits/src/credits.ts:182](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/credits/src/credits.ts#L182)

Aggregate ledger stats (granted vs spent, outstanding) — the generic part of an admin dashboard. The user COUNT is the
 app's (it owns the user table); compose it on top.

## Parameters

### db

[`CreditsDB`](../type-aliases/CreditsDB.md)

## Returns

`Promise`\<[`LedgerStats`](../interfaces/LedgerStats.md)\>
