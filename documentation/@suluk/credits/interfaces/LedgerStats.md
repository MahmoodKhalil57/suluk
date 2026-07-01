[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/credits](../README.md) / LedgerStats

# Interface: LedgerStats

Defined in: [tooling/ts/packages/credits/src/credits.ts:174](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/credits/src/credits.ts#L174)

`@suluk/credits` — a metered credit ledger (C046, extracted verbatim). The package OWNS the schema (`credit_transaction`
+ the `credit_amount`/`credit_key` sidecars); the app injects a Drizzle handle (D1 in prod, bun:sqlite in tests). The
money-correctness core: the ATOMIC `debitIfCovers` (a conditional INSERT that can't drive the ledger negative under
concurrency) + the idempotent `debitOnceIfCovers` (the partial-refund double-spend guard) + per-key spend + the
activity-log query. App-specific payment-alert kinds + the user-table count stay in the app.

## Properties

### balanceOutstanding

> **balanceOutstanding**: `number`

Defined in: [tooling/ts/packages/credits/src/credits.ts:177](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/credits/src/credits.ts#L177)

***

### creditsIssued

> **creditsIssued**: `number`

Defined in: [tooling/ts/packages/credits/src/credits.ts:175](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/credits/src/credits.ts#L175)

***

### creditsSpent

> **creditsSpent**: `number`

Defined in: [tooling/ts/packages/credits/src/credits.ts:176](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/credits/src/credits.ts#L176)
