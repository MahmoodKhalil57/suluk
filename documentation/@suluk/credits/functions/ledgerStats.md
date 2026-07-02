[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/credits](../README.md) / ledgerStats

# Function: ledgerStats()

> **ledgerStats**(`db`): `Promise`\<[`LedgerStats`](../interfaces/LedgerStats.md)\>

Defined in: [tooling/ts/packages/credits/src/credits.ts:182](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/credits/src/credits.ts#L182)

Aggregate ledger stats (granted vs spent, outstanding) — the generic part of an admin dashboard. The user COUNT is the
 app's (it owns the user table); compose it on top.

## Parameters

### db

[`CreditsDB`](../type-aliases/CreditsDB.md)

## Returns

`Promise`\<[`LedgerStats`](../interfaces/LedgerStats.md)\>
