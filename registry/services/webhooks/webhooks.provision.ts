/**
 * The `webhooks` provision FRAGMENT (Suluk registry) — the one D1 table the inbound-webhook runtime needs on the shared
 * app `db`: `webhook_event` (the at-least-once dedup ledger — one row per PROCESSED Stripe event id, so a redelivery is a
 * no-op). Merged into your `provision.config.ts` alongside auth/credits/keys/billing/cost (same `ref: "db"` → one
 * database, ordered migrations).
 */
import type { InstanceSpec } from "@suluk/provision";

const WEBHOOKS_MIGRATION = `
CREATE TABLE IF NOT EXISTS webhook_event (id TEXT PRIMARY KEY, type TEXT NOT NULL, processedAt INTEGER NOT NULL);
`.trim();

export const webhooksProvision: InstanceSpec[] = [
  {
    ref: "db",
    service: "cloudflare-d1",
    name: "app-db",
    params: { migrations: [{ name: "0005_webhooks", sql: WEBHOOKS_MIGRATION }] },
    bind: { database_id: "CLOUDFLARE_D1_ID" },
    protected: true,
  },
];
