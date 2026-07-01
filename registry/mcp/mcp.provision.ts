/**
 * The `mcp` provision FRAGMENT (Suluk registry) — the one D1 table the MCP connections sidecar persists into, on the
 * shared app `db`: `mcp_connection` (a user's per-connection knobs — cap / rate-share / kill-switch — on each MCP OAuth
 * grant they authorized). The OAuth tables themselves (oauthApplication/oauthAccessToken/oauthConsent) are provisioned by
 * `auth`'s Better Auth `mcp()` plugin — this fragment owns ONLY the sidecar. Merged into your `provision.config.ts`
 * alongside auth/credits/keys/billing/cost (same `ref: "db"` → one database, ordered migrations).
 */
import type { InstanceSpec } from "@suluk/provision";

const MCP_MIGRATION = `
CREATE TABLE IF NOT EXISTS mcp_connection (userId TEXT NOT NULL, clientId TEXT NOT NULL, creditCap INTEGER, rateSharePct INTEGER, disabled INTEGER DEFAULT 0, createdAt INTEGER NOT NULL, PRIMARY KEY (userId, clientId));
`.trim();

export const mcpProvision: InstanceSpec[] = [
  {
    ref: "db",
    service: "cloudflare-d1",
    name: "app-db",
    params: { migrations: [{ name: "0007_mcp", sql: MCP_MIGRATION }] },
    bind: { database_id: "CLOUDFLARE_D1_ID" },
    protected: true,
  },
];
