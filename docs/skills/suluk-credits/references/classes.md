# Classes

## credits

### `InsufficientCreditsError`
`@suluk/credits` — a metered credit ledger (C046, extracted verbatim). The package OWNS the schema (`credit_transaction`
+ the `credit_amount`/`credit_key` sidecars); the app injects a Drizzle handle (D1 in prod, bun:sqlite in tests). The
money-correctness core: the ATOMIC `debitIfCovers` (a conditional INSERT that can't drive the ledger negative under
concurrency) + the idempotent `debitOnceIfCovers` (the partial-refund double-spend guard) + per-key spend + the
activity-log query. App-specific payment-alert kinds + the user-table count stay in the app.
*extends `Error`*
```ts
constructor(balance: number, needed: number): InsufficientCreditsError
```
**Properties:**
- `stackTraceLimit: number` — The maximum number of stack frames to capture.
- `prepareStackTrace: (err: Error, stackTraces: CallSite[]) => any` (optional) — Optional override for formatting stack traces
- `balance: number`
- `needed: number`
- `name: string`
- `message: string`
- `stack: string` (optional)
- `cause: unknown` (optional) — The cause of the error.
**Methods:**
- `isError(value: unknown): value is Error` — Check if a value is an instance of Error
- `captureStackTrace(targetObject: object, constructorOpt?: Function): void` — Create .stack property on a target object
