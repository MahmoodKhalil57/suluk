/**
 * exec.ts — turn an `McpOp` + arguments back into an HTTP request and return the parsed result. Two executors:
 *  - {@link originExec}: fetch the worker's OWN public origin (fine in dev / Node / Bun, or when the store is a
 *    separate backend). On Cloudflare Workers a self-fetch to the public hostname loops through the edge and 522s.
 *  - {@link appExec}: dispatch straight through the SAME app's `fetch` (no network hop) — the correct choice when the
 *    MCP server is mounted on the same Hono app as the store routes (the saasuluk Worker case).
 * Both are SSRF-safe: the origin is fixed to the worker's own host and argument values are only ever
 * `encodeURIComponent`'d into the path template or set via `searchParams`, so a caller influences VALUES, never the
 * scheme/host/route. Both forward the caller's session so an authenticated agent acts as itself.
 */
import type { Context } from "hono";
import type { McpOp } from "./tools";

/** Build the same-origin Request for an operation call. `origin` is trusted; `args` values are caller-supplied. */
export function buildRequest(op: McpOp, args: Record<string, unknown>, origin: string, headers: Record<string, string> = {}): Request {
  let path = op.path;
  for (const p of op.pathParams) {
    const v = args[p];
    path = path.replace(new RegExp(`\\{${p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\}`, "g"), encodeURIComponent(String(v ?? "")));
  }
  const url = new URL(path, origin);
  for (const q of op.queryParams) {
    const v = args[q];
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(q, String(v));
  }
  const init: RequestInit = { method: op.method, headers: { accept: "application/json", ...headers } };
  if (!op.readOnly && op.hasBody) {
    (init.headers as Record<string, string>)["content-type"] = "application/json";
    init.body = JSON.stringify(args.body ?? {});
  }
  return new Request(url, init);
}

/** The caller's auth, forwarded to the same origin so an authenticated agent's calls run as itself. */
function forwarded(c: Context): Record<string, string> {
  const h: Record<string, string> = {};
  const cookie = c.req.header("cookie"); if (cookie) h.cookie = cookie;
  const auth = c.req.header("authorization"); if (auth) h.authorization = auth;
  return h;
}

async function readResult(res: Response, op: McpOp): Promise<unknown> {
  const body = await res.text();
  if (!res.ok) throw new Error(`${op.name} → HTTP ${res.status}${body ? `: ${body.slice(0, 300)}` : ""}`);
  if (!body) return null;
  try { return JSON.parse(body); } catch { return body; }
}

/** Default executor — fetch the worker's own public origin. Read-only catalog ops need no auth; mutations (only
 *  exposed under `include:"all"`) ride the forwarded session. NOTE: on Cloudflare Workers prefer {@link appExec}. */
export async function originExec(c: Context, op: McpOp, args: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(buildRequest(op, args, new URL(c.req.url).origin, forwarded(c)));
  return readResult(res, op);
}

export interface FetchApp { fetch(req: Request, env?: unknown, ctx?: unknown): Response | Promise<Response> }

/** In-process executor for when the MCP server is mounted on the SAME app as the store routes. Dispatches the tool's
 *  request straight through `app.fetch` — same routing, same auth + access middleware, NO network hop (so no edge
 *  self-loop / 522 on Cloudflare). Pass the host Hono app; it is read lazily at call time, so mounting MCP on that
 *  same app first is fine. The tool's request (e.g. `GET /product`) never matches the MCP route, so it can't recurse. */
export function appExec(app: FetchApp): (c: Context, op: McpOp, args: Record<string, unknown>) => Promise<unknown> {
  return async (c, op, args) => {
    let ctx: unknown; try { ctx = c.executionCtx; } catch { ctx = undefined; }
    const res = await app.fetch(buildRequest(op, args, new URL(c.req.url).origin, forwarded(c)), c.env, ctx);
    return readResult(res, op);
  };
}
