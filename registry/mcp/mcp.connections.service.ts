/**
 * The MCP Connections service (Suluk registry: `mcp`) — an Effect-TS service over the OWNED `mcp_connection` table: the
 * user-facing management of the per-connection knobs on the MCP OAuth grants they've authorized. This is the sidecar HALF;
 * Better Auth's `mcp()` plugin owns issuance (the oauthAccessToken/oauthConsent rows) — narrowing/revoking the live TOKEN
 * itself is the plugin's concern. Here we own only the per-(userId,clientId) knobs:
 *   • list(userId)                  — the user's connection knob-rows (cap / rate-share / disabled), newest first.
 *   • update(userId, clientId, …)   — upsert a connection's knobs; a PARTIAL patch never wipes an omitted knob (so a
 *                                     share-only edit can't silently clear a previously-set PAID cap → uncapped spend).
 *   • revoke(userId, clientId)      — delete the knob row (the parallel to revoking the OAuth grant in `auth`).
 * A connection's attributed-spend id is `mcpConnectionKeyId(userId, clientId)` (from `auth`) — reuse it wherever the
 * connection's usage is keyed. Depends on `Db` (`app`). Compose: `Layer.provide(McpConnectionsLive, DbLive(env))`.
 */
import { Context, Effect, Layer } from "effect";
import { and, desc, eq } from "drizzle-orm";
import { mcpConnection } from "../db/mcp";
import { mcpConnectionKeyId } from "../auth";
import { Db } from "../app";

/** A connection's knob-row as returned to the owner. */
export interface McpConnectionView {
  clientId: string;
  /** the attributed-spend id (`mcp:<userId>:<clientId>`) — the key a connection's usage is charged under. */
  keyId: string;
  creditCap: number | null;
  rateSharePct: number | null;
  disabled: boolean;
  createdAt: number;
}

/** A partial patch of a connection's knobs. An OMITTED field is left untouched; a field explicitly `null` clears it. */
export interface McpConnectionPatch {
  creditCap?: number | null;
  rateSharePct?: number | null;
  disabled?: boolean;
}

export class McpConnections extends Context.Tag("McpConnections")<
  McpConnections,
  {
    /** the calling user's connection knob-rows, newest first. */
    readonly list: (userId: string) => Effect.Effect<McpConnectionView[]>;
    /** upsert a connection's knobs (partial-safe: an omitted knob is preserved, not recomputed to null). */
    readonly update: (userId: string, clientId: string, patch: McpConnectionPatch) => Effect.Effect<void>;
    /** delete the connection's knob row (the owner's cap/share/kill-switch for this OAuth app). */
    readonly revoke: (userId: string, clientId: string) => Effect.Effect<void>;
  }
>() {}

type Row = typeof mcpConnection.$inferSelect;
function toView(userId: string, r: Row): McpConnectionView {
  return {
    clientId: r.clientId,
    keyId: mcpConnectionKeyId(userId, r.clientId),
    creditCap: r.creditCap ?? null,
    rateSharePct: r.rateSharePct ?? null,
    disabled: !!r.disabled,
    createdAt: r.createdAt,
  };
}

export const McpConnectionsLive = Layer.effect(
  McpConnections,
  Effect.gen(function* () {
    const db = yield* Db;

    return {
      list: (userId) =>
        Effect.promise(async () => {
          const rows = await db
            .select()
            .from(mcpConnection)
            .where(eq(mcpConnection.userId, userId))
            .orderBy(desc(mcpConnection.createdAt));
          return rows.map((r) => toView(userId, r));
        }),

      update: (userId, clientId, patch) =>
        Effect.promise(async () => {
          // Write ONLY the knob(s) actually present on the patch — a partial update (e.g. share-only) must NOT recompute
          // the omitted field to null and silently wipe a previously-set PAID cap. On a fresh INSERT the absent columns
          // default to null / 0 (the schema columns are nullable / defaulted). A field explicitly sent as null clears it.
          const set: { creditCap?: number | null; rateSharePct?: number | null; disabled?: number } = {};
          if (patch.creditCap !== undefined) set.creditCap = patch.creditCap;
          if (patch.rateSharePct !== undefined) set.rateSharePct = patch.rateSharePct;
          if (patch.disabled !== undefined) set.disabled = patch.disabled ? 1 : 0;
          await db
            .insert(mcpConnection)
            .values({
              userId,
              clientId,
              creditCap: patch.creditCap ?? null,
              rateSharePct: patch.rateSharePct ?? null,
              disabled: patch.disabled ? 1 : 0,
              createdAt: Date.now(),
            })
            .onConflictDoUpdate({ target: [mcpConnection.userId, mcpConnection.clientId], set });
        }),

      revoke: (userId, clientId) =>
        Effect.promise(async () => {
          await db
            .delete(mcpConnection)
            .where(and(eq(mcpConnection.userId, userId), eq(mcpConnection.clientId, clientId)));
        }),
    };
  }),
);
