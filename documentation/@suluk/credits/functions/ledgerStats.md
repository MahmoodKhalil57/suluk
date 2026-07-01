[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/credits](../README.md) / ledgerStats

# Function: ledgerStats()

> **ledgerStats**(`db`): `Promise`\<[`LedgerStats`](../interfaces/LedgerStats.md)\>

Defined in: [tooling/ts/packages/credits/src/credits.ts:182](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/credits/src/credits.ts#L182)

Aggregate ledger stats (granted vs spent, outstanding) — the generic part of an admin dashboard. The user COUNT is the
 app's (it owns the user table); compose it on top.

## Parameters

### db

[`CreditsDB`](../type-aliases/CreditsDB.md)

## Returns

`Promise`\<[`LedgerStats`](../interfaces/LedgerStats.md)\>
