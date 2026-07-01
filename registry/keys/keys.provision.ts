/**
 * The `keys` provision FRAGMENT — the `key_lineage` table on the shared app D1. (The `apikey` table is created by Better
 * Auth's apikey plugin migrations in `auth`, not here.) Merged into your `provision.config.ts`.
 */
import type { InstanceSpec } from "@suluk/provision";

const KEYS_MIGRATION = `CREATE TABLE IF NOT EXISTS key_lineage (keyId TEXT PRIMARY KEY, parentKeyId TEXT, userId TEXT NOT NULL, path TEXT NOT NULL, depth INTEGER NOT NULL);`;

export const keysProvision: InstanceSpec[] = [
  {
    ref: "db",
    service: "cloudflare-d1",
    name: "app-db",
    params: { migrations: [{ name: "0001_keys", sql: KEYS_MIGRATION }] },
    bind: { database_id: "CLOUDFLARE_D1_ID" },
    protected: true,
  },
];
