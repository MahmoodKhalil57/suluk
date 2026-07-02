/**
 * The `erasure` provision FRAGMENT (Suluk registry) — the `erasure_receipt` GDPR audit table on the shared app `db`.
 * Merged into your `provision.config.ts`. The cascade DELETEs rows in the OTHER modules' tables (credits/keys/billing/
 * cost/logs) at runtime; those migrations belong to their own fragments — this fragment adds only the audit trail.
 */
import type { InstanceSpec } from "@suluk/provision";

const ERASURE_MIGRATION = `CREATE TABLE IF NOT EXISTS erasure_receipt (id TEXT PRIMARY KEY, userId TEXT NOT NULL, posture TEXT, steps TEXT, erasedAt INTEGER NOT NULL);`;

export const erasureProvision: InstanceSpec[] = [
  {
    ref: "db",
    service: "cloudflare-d1",
    name: "app-db",
    params: { migrations: [{ name: "0004_erasure", sql: ERASURE_MIGRATION }] },
    bind: { database_id: "CLOUDFLARE_D1_ID" },
    protected: true,
  },
];
