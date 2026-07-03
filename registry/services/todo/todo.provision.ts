/**
 * The `todo` provision FRAGMENT — the `todo` table on the shared app D1 (+ the owner index). Merged into your
 * `provision.config.ts` (same `ref:"db"` instance as the other modules; `mergeProvision` unions the migrations).
 */
import type { InstanceSpec } from "@suluk/provision";

const TODO_MIGRATION = `
CREATE TABLE IF NOT EXISTS todo (id TEXT PRIMARY KEY, userId TEXT NOT NULL, title TEXT NOT NULL, completed INTEGER NOT NULL DEFAULT 0, createdAt INTEGER NOT NULL, updatedAt INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS todo_userId_idx ON todo(userId);
`.trim();

export const todoProvision: InstanceSpec[] = [
  {
    ref: "db",
    service: "cloudflare-d1",
    name: "app-db",
    params: { migrations: [{ name: "0008_todo", sql: TODO_MIGRATION }] },
    bind: { database_id: "CLOUDFLARE_D1_ID" },
    protected: true,
  },
];
