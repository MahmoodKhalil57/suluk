/**
 * The billing schema (Suluk registry: `billing`). `billingAccount` (the user ↔ Stripe customer + active subscription link)
 * is re-exported from `@suluk/billing`, which OWNS that table. The two v2 tables below are MODULE-OWNED (like `cost` owns
 * `cost_event`/`cost_dedup`): `auto_topup` (the app's off-session auto-recharge config — package-external app POLICY) and
 * `payment_alert` (standing payment-health flags surfaced in the billing UI). Your drizzle config + migrations import all
 * three from here; the billing-account definition stays upstream so a schema change ships as a package update.
 */
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export { billingAccount } from "@suluk/billing";

/** The user's off-session auto-recharge config — MODULE-OWNED (auto-topup is app POLICY, excluded from @suluk/billing).
 *  `lastTriggeredAt` is the CAS anchor the trigger flips so two concurrent debits can't double-charge (see the routes). */
export const autoTopup = sqliteTable("auto_topup", {
  /** the user id — PK; a plain column (the app owns the user table; add the FK + onDelete cascade in your migration). */
  userId: text("userId").primaryKey(),
  /** 1 ⇒ auto-recharge is on. Stored as an INTEGER flag (0/1) so it's a plain D1 column. */
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(false),
  /** recharge when the post-debit balance drops BELOW this many credits. */
  thresholdCredits: integer("thresholdCredits").notNull().default(100),
  /** the USD amount (cents) to charge the saved default card on each recharge. */
  topupCredits: integer("topupCredits").notNull().default(1000),
  /** the last time an auto-recharge FIRED — the cooldown/CAS anchor (null = never). */
  lastTriggeredAt: integer("lastTriggeredAt", { mode: "timestamp" }),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

/** A standing payment-health flag surfaced in the billing UI (a declined renewal / auto-top-up / 3DS-needed) — MODULE-OWNED
 *  (alert kinds are app POLICY). Append-only; the app clears a user's alerts on a successful charge. */
export const paymentAlert = sqliteTable("payment_alert", {
  id: text("id").primaryKey(),
  /** the affected user (a plain column; add the FK in your migration). */
  userId: text("userId").notNull(),
  /** the alert kind, e.g. `subscription_past_due` | `autotopup_failed` | `auth_required`. */
  kind: text("kind").notNull(),
  /** a human-readable detail line shown to the user. */
  detail: text("detail"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});
