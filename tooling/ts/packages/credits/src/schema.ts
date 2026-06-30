/**
 * The credit-ledger schema (C046) — owned by @suluk/credits, applied by the app's migrations. The ledger is the single
 * writer of truth: an append-only `credit_transaction` (signed `delta`), a `credit_amount` sidecar for the cash that
 * moved (cosmetic), and a `credit_key` sidecar attributing a debit to the API key that spent it (for per-key headroom).
 *
 * `userId` is a plain column (the app owns the `user` table + any FK / cascade); the two sidecars FK the transaction id.
 * Extracted verbatim from the source schema.
 */
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const creditTransaction = sqliteTable("credit_transaction", {
  id: text("id").primaryKey(),
  /** the principal / user id (the app owns the user table; add the FK in your migration if you want the cascade). */
  userId: text("userId").notNull(),
  /** + on grant/top-up/subscription, − on debit. */
  delta: integer("delta").notNull(),
  /** the ledger reason, e.g. "signup_grant" | "topup" | "transcribe" — free text (the app's taxonomy). */
  reason: text("reason").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});

export const creditAmount = sqliteTable("credit_amount", {
  txnId: text("txnId").primaryKey().references(() => creditTransaction.id, { onDelete: "cascade" }),
  /** the SIGNED cash that moved with this row (+ paid in, − refunded out), in cents. */
  amountCents: integer("amountCents").notNull(),
});

export const creditKey = sqliteTable("credit_key", {
  txnId: text("txnId").primaryKey().references(() => creditTransaction.id, { onDelete: "cascade" }),
  /** the API key / connection id that spent this debit (an apikey.id, or e.g. `mcp:<userId>:<clientId>`). */
  keyId: text("keyId").notNull(),
});
