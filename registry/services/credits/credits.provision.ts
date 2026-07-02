/**
 * The `credits` provision FRAGMENT (Suluk registry) — the OSB/@suluk/provision `InstanceSpec[]` this module needs: the
 * shared app D1 + the credit-ledger migration. A platform merges every module's fragment into one `provision.config.ts`,
 * then `@suluk/provision` `generate`/`migrate`/`apply` creates the real database (see C047/C051). The D1 `ref` is `"db"`
 * — shared across modules — so credits/keys/billing add their migrations to the SAME database, not separate ones.
 */
import type { InstanceSpec } from "@suluk/provision";

const CREDITS_MIGRATION = `
CREATE TABLE IF NOT EXISTS credit_transaction (id TEXT PRIMARY KEY, userId TEXT NOT NULL, delta INTEGER NOT NULL, reason TEXT NOT NULL, createdAt INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS credit_amount (txnId TEXT PRIMARY KEY REFERENCES credit_transaction(id), amountCents INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS credit_key (txnId TEXT PRIMARY KEY REFERENCES credit_transaction(id), keyId TEXT NOT NULL);
`.trim();

export const creditsProvision: InstanceSpec[] = [
  {
    ref: "db",
    service: "cloudflare-d1",
    name: "app-db",
    params: { migrations: [{ name: "0000_credits", sql: CREDITS_MIGRATION }] },
    bind: { database_id: "CLOUDFLARE_D1_ID" },
    protected: true, // a database — never prune/teardown without --force
  },
];
