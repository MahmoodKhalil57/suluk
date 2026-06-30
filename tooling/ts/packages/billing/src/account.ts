/**
 * The billing-account store (C046, v2) — the app's user ↔ Stripe link: the customer id + the active subscription id,
 * owned by @suluk/billing and applied by the app's migrations. `userId` is the PK as a PLAIN column (the app owns the
 * `user` table; add the FK + cascade in your migration), exactly like @suluk/credits owns its ledger with a plain
 * `userId`. The app injects a Drizzle handle (`DrizzleD1Database` in prod; bun:sqlite bridged to it in tests). Extracted
 * verbatim from the source.
 */
import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/** The injected DB handle. Prod is drizzle/d1; tests bridge drizzle/bun-sqlite to this type (a runtime-identity narrow). */
export type BillingDB = DrizzleD1Database;

export const billingAccount = sqliteTable("billing_account", {
  /** the user id — PK; a plain column (the app owns the user table; add the FK + onDelete cascade in your migration). */
  userId: text("userId").primaryKey(),
  /** the Stripe customer id (set on the first top-up/subscribe; reused so a saved card is never orphaned). */
  stripeCustomerId: text("stripeCustomerId"),
  /** the ACTIVE subscription id, or null when the user has none (cleared by customer.subscription.deleted). */
  subscriptionId: text("subscriptionId"),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

/** The user's Stripe customer id, or null when they have no billing account yet. */
export async function billingCustomerId(db: BillingDB, userId: string): Promise<string | null> {
  const rows = await db.select().from(billingAccount).where(eq(billingAccount.userId, userId)).limit(1);
  return rows[0]?.stripeCustomerId ?? null;
}

/** The user's recorded Stripe subscription id, or null when they have no subscription. */
export async function billingSubscriptionId(db: BillingDB, userId: string): Promise<string | null> {
  const rows = await db.select().from(billingAccount).where(eq(billingAccount.userId, userId)).limit(1);
  return rows[0]?.subscriptionId ?? null;
}

/** Persist the user's Stripe customer id WITHOUT touching subscriptionId — so a one-time top-up never clears a
 *  subscriber's `subscriptionId` (unlike {@link upsertBillingAccount}, which sets it). Idempotent on the userId PK. */
export async function linkBillingCustomer(db: BillingDB, userId: string, customerId: string): Promise<void> {
  await db
    .insert(billingAccount)
    .values({ userId, stripeCustomerId: customerId, subscriptionId: null, updatedAt: new Date() })
    .onConflictDoUpdate({ target: billingAccount.userId, set: { stripeCustomerId: customerId, updatedAt: new Date() } })
    .run();
}

/** Persist customer + subscription together (the subscribe path sets both). Idempotent on the userId PK. */
export async function upsertBillingAccount(db: BillingDB, userId: string, customerId: string, subscriptionId: string | null): Promise<void> {
  await db
    .insert(billingAccount)
    .values({ userId, stripeCustomerId: customerId, subscriptionId, updatedAt: new Date() })
    .onConflictDoUpdate({ target: billingAccount.userId, set: { stripeCustomerId: customerId, subscriptionId, updatedAt: new Date() } })
    .run();
}

/** Clear the recorded subscription (on customer.subscription.deleted) — leaves the customer id (+ its saved card) intact. */
export async function clearSubscription(db: BillingDB, userId: string): Promise<void> {
  await db.update(billingAccount).set({ subscriptionId: null, updatedAt: new Date() }).where(eq(billingAccount.userId, userId)).run();
}
