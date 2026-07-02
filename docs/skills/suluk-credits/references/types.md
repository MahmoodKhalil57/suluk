# Types & Enums

## credits

### `CreditsDB`
The injected DB handle. Prod is drizzle/d1; tests bridge drizzle/bun-sqlite to this type (a runtime-identity narrow).
```ts
DrizzleD1Database
```

### `DebitOutcome`
The outcome of an idempotent debit attempt (see debitOnceIfCovers).

### `LedgerEntry`
One ledger row as a panel shows it (`createdAt` epoch-ms). `amountCents` is the SIGNED cash that moved (+ in, − out),
 or null for credits-only rows (usage debits, free grants).
**Properties:**
- `id: string`
- `delta: number`
- `reason: string`
- `createdAt: number`
- `amountCents: number | null`

### `LedgerStats`
`@suluk/credits` — a metered credit ledger (C046, extracted verbatim). The package OWNS the schema (`credit_transaction`
+ the `credit_amount`/`credit_key` sidecars); the app injects a Drizzle handle (D1 in prod, bun:sqlite in tests). The
money-correctness core: the ATOMIC `debitIfCovers` (a conditional INSERT that can't drive the ledger negative under
concurrency) + the idempotent `debitOnceIfCovers` (the partial-refund double-spend guard) + per-key spend + the
activity-log query. App-specific payment-alert kinds + the user-table count stay in the app.
**Properties:**
- `creditsIssued: number`
- `creditsSpent: number`
- `balanceOutstanding: number`
