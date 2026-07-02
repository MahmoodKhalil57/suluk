/**
 * MCP connections routes (Suluk registry: `mcp`) — Hono over the {@link McpConnections} Effect service. These are
 * SESSION-ONLY: only a signed-in user (`c.get("user")`) manages the per-connection knobs on the MCP OAuth grants they've
 * authorized — a key / MCP-bearer caller must never edit its own cap, so a keyed caller (`keyId` present) is denied.
 * Mounted by {@link mountMcp} UNDER `/api/mcp` and BEFORE `mcpApp`, so the full paths are:
 *   • GET  /api/mcp/connections          — the caller's connection knob-rows.
 *   • POST /api/mcp/connections/update    — upsert one connection's cap / rate-share / disabled (partial-safe).
 *   • POST /api/mcp/connections/revoke    — delete a connection's knob row.
 * Registering these BEFORE mcpApp's `/api/mcp` handler is what keeps them from being swallowed by the JSON-RPC endpoint.
 */
import { Hono, type Context } from "hono";
import { Effect } from "effect";
import { DbLive, type Bindings } from "../app";
import type { AppVars } from "@suluk/better-auth"; // the auth-set context vars — from the package, NOT a `../auth` sibling import
import { McpConnections, McpConnectionsLive, type McpConnectionPatch } from "../services/mcp";

type Env = { Bindings: Bindings; Variables: AppVars };

export function mcpConnectionsRoutes() {
  const r = new Hono<Env>();
  const run = <A>(env: Bindings, program: Effect.Effect<A, never, McpConnections>): Promise<A> =>
    program.pipe(Effect.provide(McpConnectionsLive), Effect.provide(DbLive(env)), Effect.runPromise);

  /** The signed-in owner, or a 401/403 Response. A keyed caller (an api-key / MCP bearer) is DENIED — these are
   *  session-only management ops (a connection must never widen its own cap). */
  const owner = (c: Context<Env>): { id: string } | Response => {
    if (c.get("keyId")) return c.json({ error: "Only a signed-in user can manage MCP connections." }, 403);
    const user = c.get("user");
    if (!user?.id) return c.json({ error: "Sign in to manage MCP connections." }, 401);
    return { id: user.id };
  };

  // GET /connections → the caller's connection knob-rows (cap / rate-share / disabled), newest first.
  r.get("/connections", async (c) => {
    const who = owner(c);
    if (who instanceof Response) return who;
    const connections = await run(c.env, Effect.flatMap(McpConnections, (s) => s.list(who.id)));
    return c.json({ connections });
  });

  // POST /connections/update → upsert one connection's knobs. Body: { clientId, creditCap?, rateSharePct?, disabled? }.
  r.post("/connections/update", async (c) => {
    const who = owner(c);
    if (who instanceof Response) return who;
    const body = (await c.req.json().catch(() => ({}))) as { clientId?: string } & McpConnectionPatch;
    if (!body.clientId) return c.json({ error: "clientId is required." }, 400);
    const patch: McpConnectionPatch = {};
    if (body.creditCap !== undefined) patch.creditCap = body.creditCap;
    if (body.rateSharePct !== undefined) patch.rateSharePct = body.rateSharePct;
    if (body.disabled !== undefined) patch.disabled = body.disabled;
    await run(c.env, Effect.flatMap(McpConnections, (s) => s.update(who.id, body.clientId!, patch)));
    return c.json({ ok: true });
  });

  // POST /connections/revoke → delete a connection's knob row. Body: { clientId }.
  r.post("/connections/revoke", async (c) => {
    const who = owner(c);
    if (who instanceof Response) return who;
    const body = (await c.req.json().catch(() => ({}))) as { clientId?: string };
    if (!body.clientId) return c.json({ error: "clientId is required." }, 400);
    await run(c.env, Effect.flatMap(McpConnections, (s) => s.revoke(who.id, body.clientId!)));
    return c.json({ ok: true });
  });

  return r;
}
