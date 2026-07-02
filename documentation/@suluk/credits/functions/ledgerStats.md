[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/credits](../README.md) / ledgerStats

# Function: ledgerStats()

> **ledgerStats**(`db`): `Promise`\<[`LedgerStats`](../interfaces/LedgerStats.md)\>

Defined in: [tooling/ts/packages/credits/src/credits.ts:182](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/credits/src/credits.ts#L182)

Aggregate ledger stats (granted vs spent, outstanding) — the generic part of an admin dashboard. The user COUNT is the
 app's (it owns the user table); compose it on top.

## Parameters

### db

[`CreditsDB`](../type-aliases/CreditsDB.md)

## Returns

`Promise`\<[`LedgerStats`](../interfaces/LedgerStats.md)\>
