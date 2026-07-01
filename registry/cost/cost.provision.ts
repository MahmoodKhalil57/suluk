/**
 * The `cost` provision FRAGMENT (Suluk registry) — the two D1 tables the cost runtime persists into, on the shared app
 * `db`: `cost_event` (the raw ledger) + `cost_dedup` (at-least-once dedup keys). Merged into your `provision.config.ts`
 * alongside credits/keys/billing (same `ref: "db"` → one database, ordered migrations).
 */
import type { InstanceSpec } from "@suluk/provision";

const COST_MIGRATION = `
CREATE TABLE IF NOT EXISTS cost_event (id TEXT PRIMARY KEY, userId TEXT, operation TEXT NOT NULL, action TEXT, trigger TEXT, totalMicroUsd INTEGER NOT NULL, reconciled INTEGER DEFAULT 0, breakdown TEXT, createdAt INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS cost_dedup (dedupeKey TEXT PRIMARY KEY, operation TEXT, createdAt INTEGER NOT NULL);
`.trim();

export const costProvision: InstanceSpec[] = [
  {
    ref: "db",
    service: "cloudflare-d1",
    name: "app-db",
    params: { migrations: [{ name: "0003_cost", sql: COST_MIGRATION }] },
    bind: { database_id: "CLOUDFLARE_D1_ID" },
    protected: true,
  },
];
