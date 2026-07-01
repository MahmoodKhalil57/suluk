/**
 * The credit-ledger schema (Suluk registry: `credits`) — re-exported from `@suluk/credits`, which OWNS the table
 * definitions (the append-only `credit_transaction` + the `credit_amount`/`credit_key` sidecars). Your drizzle config +
 * migrations import from here; the definitions stay upstream so a schema change ships as a package update, not a manual
 * edit. `userId` is a plain column — add the FK to your `user` table in your migration if you want the cascade.
 */
export { creditTransaction, creditAmount, creditKey } from "@suluk/credits";
