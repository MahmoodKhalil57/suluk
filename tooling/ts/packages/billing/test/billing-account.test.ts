import { test, expect, describe, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import {
  billingCustomerId, billingSubscriptionId, linkBillingCustomer, upsertBillingAccount, clearSubscription, type BillingDB,
} from "../src/index";

/** C046 v2 — the billing-account store, witnessed against a REAL bun:sqlite. The package owns the schema; we apply it
 *  here and bridge bun:sqlite → BillingDB (a runtime-identity narrow, as the source app does in tests). */
function freshDb(): BillingDB {
  const sqlite = new Database(":memory:");
  sqlite.run(`CREATE TABLE billing_account (userId TEXT PRIMARY KEY, stripeCustomerId TEXT, subscriptionId TEXT, updatedAt INTEGER NOT NULL)`);
  return drizzle(sqlite) as unknown as BillingDB;
}

let db: BillingDB;
const U = "user_1";
beforeEach(() => {
  db = freshDb();
});

describe("the billing-account store", () => {
  test("empty by default", async () => {
    expect(await billingCustomerId(db, U)).toBeNull();
    expect(await billingSubscriptionId(db, U)).toBeNull();
  });

  test("linkBillingCustomer sets the customer id (idempotent on userId)", async () => {
    await linkBillingCustomer(db, U, "cus_1");
    expect(await billingCustomerId(db, U)).toBe("cus_1");
    await linkBillingCustomer(db, U, "cus_2"); // re-link → updates, doesn't duplicate
    expect(await billingCustomerId(db, U)).toBe("cus_2");
  });

  test("a top-up link NEVER clears a subscriber's subscriptionId", async () => {
    await upsertBillingAccount(db, U, "cus_1", "sub_1"); // subscribe sets both
    expect(await billingSubscriptionId(db, U)).toBe("sub_1");
    await linkBillingCustomer(db, U, "cus_1"); // a later one-time top-up
    expect(await billingSubscriptionId(db, U)).toBe("sub_1"); // still subscribed — the load-bearing guard
    expect(await billingCustomerId(db, U)).toBe("cus_1");
  });

  test("upsertBillingAccount sets both; clearSubscription drops only the subscription", async () => {
    await upsertBillingAccount(db, U, "cus_1", "sub_1");
    await clearSubscription(db, U); // customer.subscription.deleted
    expect(await billingSubscriptionId(db, U)).toBeNull();
    expect(await billingCustomerId(db, U)).toBe("cus_1"); // the saved card stays reachable
  });
});
