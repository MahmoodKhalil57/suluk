[**Suluk**](../../README.md)

***

[Suluk](../../packages.md) / @suluk/credits

<p align="center">
  <a href="https://github.com/MahmoodKhalil57/suluk">
    <img src="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/wordmark.png" alt="Suluk" width="360" />
  </a>
</p>

<h1 align="center">@suluk/credits</h1>

<p align="center"><b>A metered credit ledger whose money-correctness core can't go negative under concurrency or double-spend a partial refund — the app just injects a Drizzle handle.</b></p>

<p align="center">
  <em>Part of <a href="https://github.com/MahmoodKhalil57/suluk">Suluk</a> — one typed OpenAPI v4 contract projecting into every full-stack layer.</em>
</p>

---

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```sh
bun add @suluk/credits
```

## What it does

An append-only credit ledger, extracted verbatim from a real app (C046). The package **owns** the
tables (`credit_transaction` plus the `credit_amount` / `credit_key` sidecars) and exports the
Drizzle schema; the app injects the DB handle — `DrizzleD1Database` in production, `bun:sqlite`
bridged to it in tests. Balance is the sum of every row's `delta` (`+` on grant/top-up, `−` on
debit), so there is exactly one writer and the ledger is auditable end-to-end.

The point is the two atomic primitives:

- **`debitIfCovers`** — a single conditional `INSERT` that can **never drive the ledger negative**
  under concurrency (no read-then-write race). Returns `false` instead of overdrawing.
- **`debitOnceIfCovers`** — `INSERT OR IGNORE` at a deterministic id: the **money-OUT double-spend
  guard** for partial refunds and at-least-once webhooks. Returns `{ outcome: "debited" | "replayed"
  | "insufficient" }`.

Grants use the same discipline: `grantOnce(db, userId, amount, idemKey)` is idempotent on the
idempotency key, so a redelivered signup / top-up event never grants twice.

## Usage

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

## What's inside

| Export | What it does |
| --- | --- |
| `getBalance(db, userId)` | Current balance = Σ of the user's ledger deltas. |
| `record` / `addCredits` / `debitCredits` | The single-writer append + the non-atomic grant/debit conveniences (return the new balance). |
| `debitIfCovers(db, userId, amount, reason, keyId?)` | **Atomic** debit-if-covers — a conditional INSERT that can't go negative. |
| `grantOnce(db, userId, amount, idemKey, reason?, …)` | Idempotent grant (dedupes on the idempotency key). |
| `debitOnceIfCovers` / `debitOnceAttributed` | Idempotent debit → `DebitOutcome` — the partial-refund double-spend guard. |
| `nonceFor(reason, idemKey)` | The deterministic row id an idempotent op maps to (pre-check without drift). |
| `recordKey` / `keySpend(db, keyId)` | Attribute a debit to the API key that spent it; per-key spend total. |
| `listTransactions` / `ledgerRow` / `ledgerStats` | The activity-log query, one row, and aggregate stats. |
| `recordAmount` | The cosmetic `$` annotation sidecar on a row. |
| `creditTransaction` / `creditAmount` / `creditKey` | The Drizzle schema the package owns. |
| `InsufficientCreditsError` | Thrown by the app when a debit isn't covered. |

Types `CreditsDB`, `DebitOutcome`, `LedgerEntry`, and `LedgerStats` are exported alongside.

## Boundary

This package owns the **money-correctness core** and nothing above it. It stores the ledger (in a DB
you inject) but imposes no pricing, plans, or limits — those are the app's policy. Per-key spend
attribution is best-effort *reporting* that rides alongside a debit and must never break it.

It pairs with [`@suluk/keys`](../keys/README.md) (the delegation-chain algebra joins this ledger for pooled
subtree headroom) and [`@suluk/billing`](../billing/README.md) (whose webhook dispatch composes `grantOnce`
here to credit a paid invoice). It depends only on `@suluk/drizzle` + `drizzle-orm`.

## License

Apache-2.0

## Classes

- [InsufficientCreditsError](classes/InsufficientCreditsError.md)

## Interfaces

- [LedgerEntry](interfaces/LedgerEntry.md)
- [LedgerStats](interfaces/LedgerStats.md)

## Type Aliases

- [CreditsDB](type-aliases/CreditsDB.md)
- [DebitOutcome](type-aliases/DebitOutcome.md)

## Variables

- [creditAmount](variables/creditAmount.md)
- [creditKey](variables/creditKey.md)
- [creditTransaction](variables/creditTransaction.md)

## Functions

- [addCredits](functions/addCredits.md)
- [debitCredits](functions/debitCredits.md)
- [debitIfCovers](functions/debitIfCovers.md)
- [debitOnceAttributed](functions/debitOnceAttributed.md)
- [debitOnceIfCovers](functions/debitOnceIfCovers.md)
- [getBalance](functions/getBalance.md)
- [grantOnce](functions/grantOnce.md)
- [keySpend](functions/keySpend.md)
- [ledgerRow](functions/ledgerRow.md)
- [ledgerStats](functions/ledgerStats.md)
- [listTransactions](functions/listTransactions.md)
- [nonceFor](functions/nonceFor.md)
- [record](functions/record.md)
- [recordAmount](functions/recordAmount.md)
- [recordKey](functions/recordKey.md)
