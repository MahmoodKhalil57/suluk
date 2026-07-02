/**
 * The `billing` provision FRAGMENT — the `billing_account` table on the shared app D1 (v1), plus the two MODULE-OWNED v2
 * tables `auto_topup` + `payment_alert` (the `0006_billing_v2` migration, mirroring `cost`'s owned-table pattern). Merged
 * into your `provision.config.ts` (same `ref: "db"` → one database, ordered migrations); the `STRIPE_SECRET_KEY` secret is
 * bound (not created) here.
 */
import type { InstanceSpec } from "@suluk/provision";

const BILLING_MIGRATION = `CREATE TABLE IF NOT EXISTS billing_account (userId TEXT PRIMARY KEY, stripeCustomerId TEXT, subscriptionId TEXT, updatedAt INTEGER NOT NULL);`;

// v2 — the app-owned auto-top-up config + payment-health flags (excluded from @suluk/billing; app POLICY).
const BILLING_V2_MIGRATION = `
CREATE TABLE IF NOT EXISTS auto_topup (userId TEXT PRIMARY KEY, enabled INTEGER NOT NULL DEFAULT 0, thresholdCredits INTEGER NOT NULL DEFAULT 100, topupCredits INTEGER NOT NULL DEFAULT 1000, lastTriggeredAt INTEGER, updatedAt INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS payment_alert (id TEXT PRIMARY KEY, userId TEXT NOT NULL, kind TEXT NOT NULL, detail TEXT, createdAt INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_payment_alert_user ON payment_alert (userId);
`.trim();

export const billingProvision: InstanceSpec[] = [
  {
    ref: "db",
    service: "cloudflare-d1",
    name: "app-db",
    params: { migrations: [
      { name: "0003_billing", sql: BILLING_MIGRATION },
      { name: "0006_billing_v2", sql: BILLING_V2_MIGRATION },
    ] },
    bind: { database_id: "CLOUDFLARE_D1_ID" },
    protected: true,
  },
];
