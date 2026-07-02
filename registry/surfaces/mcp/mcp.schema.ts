/**
 * The MCP schema (Suluk registry: `mcp`) — a STORAGE-owned module. `@suluk/mcp` is the pure MCP JSON-RPC protocol + the
 * per-caller tool projection; the OAuth issuance (authorize/token/consent + the oauthApplication/oauthAccessToken/
 * oauthConsent tables) is owned by Better Auth's `mcp()` plugin (see `auth`). What NEITHER owns is the per-CONNECTION
 * sidecar: a user's own knobs on each OAuth connection they've authorized (a spend cap + a rate-limit share + a kill
 * switch). So THIS module owns one D1 table — `mcp_connection` — keyed by (userId, clientId) (a connection is a user ×
 * the OAuth app they granted; the shared clientId alone is NOT the identity — reuse `mcpConnectionKeyId(userId,clientId)`
 * for the attributed spend id). The list/edit/revoke logic lives in the service; this is just where the rows live.
 */
import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";

/** One user's knobs on one OAuth connection they authorized. Composite PK (userId, clientId) — a connection is per-user,
 *  never the bare (shared) clientId. All knob columns are nullable (absent ⇒ no cap / full share / enabled). */
export const mcpConnection = sqliteTable(
  "mcp_connection",
  {
    /** the connection OWNER (the user who authorized the OAuth app). */
    userId: text("userId").notNull(),
    /** the OAuth client (the DCR-registered app) this connection is for — shared across users, hence part of the key. */
    clientId: text("clientId").notNull(),
    /** the per-connection PAID credit cap (µ$ / credits), null ⇒ no cap (uncapped within the owner's own balance). */
    creditCap: integer("creditCap"),
    /** the connection's % share of the owner's free-tier rate allowance, null/100 ⇒ full share. */
    rateSharePct: integer("rateSharePct"),
    /** 1 ⇒ the owner has kill-switched this connection (its bearer is soft-denied even while the token is still live). */
    disabled: integer("disabled").default(0),
    /** when the owner first set a knob on this connection (epoch ms). */
    createdAt: integer("createdAt").notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.clientId] })],
);
