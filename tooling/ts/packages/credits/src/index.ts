/**
 * @suluk/credits — a metered credit ledger (C046, extracted verbatim). The package OWNS the schema (`credit_transaction`
 * + the `credit_amount`/`credit_key` sidecars); the app injects a Drizzle handle (D1 in prod, bun:sqlite in tests). The
 * money-correctness core: the ATOMIC `debitIfCovers` (a conditional INSERT that can't drive the ledger negative under
 * concurrency) + the idempotent `debitOnceIfCovers` (the partial-refund double-spend guard) + per-key spend + the
 * activity-log query. App-specific payment-alert kinds + the user-table count stay in the app.
 */
export {
  type CreditsDB,
  InsufficientCreditsError,
  getBalance, record, recordKey,
  debitIfCovers, keySpend,
  nonceFor, debitOnceIfCovers, debitOnceAttributed, type DebitOutcome,
  ledgerRow, recordAmount, listTransactions, type LedgerEntry,
  ledgerStats, type LedgerStats,
  grantOnce, addCredits, debitCredits,
} from "./credits";
export { creditTransaction, creditAmount, creditKey } from "./schema";
