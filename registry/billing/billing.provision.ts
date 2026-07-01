/**
 * The `billing` provision FRAGMENT — the `billing_account` table on the shared app D1, and the env the Stripe surface
 * needs. Merged into your `provision.config.ts`; the `STRIPE_SECRET_KEY` secret is bound (not created) here.
 */
import type { InstanceSpec } from "@suluk/provision";

const BILLING_MIGRATION = `CREATE TABLE IF NOT EXISTS billing_account (userId TEXT PRIMARY KEY, stripeCustomerId TEXT, subscriptionId TEXT, updatedAt INTEGER NOT NULL);`;

export const billingProvision: InstanceSpec[] = [
  {
    ref: "db",
    service: "cloudflare-d1",
    name: "app-db",
    params: { migrations: [{ name: "0003_billing", sql: BILLING_MIGRATION }] },
    bind: { database_id: "CLOUDFLARE_D1_ID" },
    protected: true,
  },
];
