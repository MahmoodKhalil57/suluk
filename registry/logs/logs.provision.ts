/**
 * The `logs` provision FRAGMENT — the `activity_log` table on the shared app D1. Merged into your `provision.config.ts`.
 */
import type { InstanceSpec } from "@suluk/provision";

const LOGS_MIGRATION = `CREATE TABLE IF NOT EXISTS activity_log (id TEXT PRIMARY KEY, userId TEXT, action TEXT NOT NULL, detail TEXT, createdAt INTEGER NOT NULL);`;

export const logsProvision: InstanceSpec[] = [
  {
    ref: "db",
    service: "cloudflare-d1",
    name: "app-db",
    params: { migrations: [{ name: "0002_logs", sql: LOGS_MIGRATION }] },
    bind: { database_id: "CLOUDFLARE_D1_ID" },
    protected: true,
  },
];
