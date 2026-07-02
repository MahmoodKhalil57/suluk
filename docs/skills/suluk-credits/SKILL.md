---
description: "A metered CREDIT LEDGER: append-only transactions, balance, the ATOMIC debit-if-covers (a single conditional INSERT that can never drive the ledger negative under concurrency), the idempotent debit (INSERT OR IGNORE — the money-OUT double-spend guard for partial refunds), per-key spend attribution, the recent-transactions + activity-log query, and aggregate stats. The package OWNS the credit tables; the app injects a Drizzle handle (D1 in prod, bun:sqlite in tests). The money-correctness core, extracted verbatim from a real app (C046). CANDIDATE tooling."
name: suluk-credits
---

# @suluk/credits

A metered CREDIT LEDGER: append-only transactions, balance, the ATOMIC debit-if-covers (a single conditional INSERT that can never drive the ledger negative under concurrency), the idempotent debit (INSERT OR IGNORE — the money-OUT double-spend guard for partial refunds), per-key spend attribution, the recent-transactions + activity-log query, and aggregate stats. The package OWNS the credit tables; the app injects a Drizzle handle (D1 in prod, bun:sqlite in tests). The money-correctness core, extracted verbatim from a real app (C046). CANDIDATE tooling.

## Quick Start

```ts
import {
  getBalance, grantOnce, debitIfCovers, debitOnceIfCovers,
  listTransactions, InsufficientCreditsError, creditTransaction,
} from "@suluk/credits";

// Grant 100 credits, idempotently — a replayed event is a no-op (returns false).
await grantOnce(db, "user_42", 100, "signup:user_42", "signup-grant");

// Atomic spend: debits only if the balance covers it; never goes negative under concurrency.
const ok = await debitIfCovers(db, "user_42", 5, "ask", /* keyId */ "key_abc");
if (!ok) throw new InsufficientCreditsError(await getBalance(db, "user_42"), 5);

// Idempotent spend (partial refund / at-least-once webhook): safe to retry at the same key.
const res = await debitOnceIfCovers(db, "user_42", 3, "refund", "evt_123");
res.outcome; // "debited" | "replayed" | "insufficient"

console.log(await getBalance(db, "user_42"));   // current balance (Σ deltas)
console.table(await listTransactions(db, "user_42")); // recent activity log
```

The package **owns the schema** — wire it into your migrations:

```ts
import { creditTransaction, creditAmount, creditKey } from "@suluk/credits";
// include these tables in your drizzle-kit migration; `userId` is a plain column
// (the app owns the `user` table — add the FK + onDelete cascade in your migration).
```

## Quick Reference

**credits:** `getBalance` (Current balance = sum of all ledger deltas for the user), `record` (Append one ledger row (the single writer); returns the new row id), `recordKey` (Attribute a debit row to the API KEY that spent it (per-key usage + limit join)), `debitIfCovers` (ATOMIC metered debit — append `-amount` ONLY IF the balance still covers it, in ONE conditional INSERT (atomic on both
bun:sqlite and D1), then best-effort attribute it), `keySpend` (Total credits a key has spent — SUM(abs(delta)) over its attributed DEBITS (delta < 0)), `nonceFor` (The DETERMINISTIC ledger row id an idempotent operation maps to — exported so a caller can pre-check existence at the
 SAME id debitOnceIfCovers will use, without re-deriving the format and risking drift), `debitOnceIfCovers` (Idempotent atomic debit: debit `amount` ONLY if the balance covers it AND this exact logical operation (identified by
`idemKey`) hasn't already been debited), `debitOnceAttributed` (Idempotent debit + per-key ATTRIBUTION — the money primitive a per-item bulk charge needs (debitOnceIfCovers
itself does NOT attribute)), `ledgerRow` (The signed credit `delta` + recorded `amountCents` for ONE ledger row id, or null if absent), `recordAmount` (Annotate a ledger row with the CASH that moved (signed)), `listTransactions` (The user's recent ledger rows (grants + debits) with the cash that moved, newest first — the "recent transactions" +
 the activity log), `ledgerStats` (Aggregate ledger stats (granted vs spent, outstanding) — the generic part of an admin dashboard), `grantOnce` (Idempotent money-IN grant — credit `amount` exactly once, keyed on the ledger row id `idemKey` (a STABLE per-payment
anchor: `pi:<id>` / `inv:<id>` / `cs:<id>`), so a webhook redelivery or dashboard "Resend" can NEVER double-credit), `addCredits` (Grant/top-up credits), `debitCredits` (Debit credits if the balance covers it; throws InsufficientCreditsError otherwise), `InsufficientCreditsError` (`@suluk/credits` — a metered credit ledger (C046, extracted verbatim)), `CreditsDB` (The injected DB handle), `DebitOutcome` (The outcome of an idempotent debit attempt (see debitOnceIfCovers)), `LedgerEntry` (One ledger row as a panel shows it (`createdAt` epoch-ms)), `LedgerStats` (`@suluk/credits` — a metered credit ledger (C046, extracted verbatim))
**schema:** `creditTransaction`, `creditAmount`, `creditKey`

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When using a class → read `references/classes.md` for properties, methods, and inheritance
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)