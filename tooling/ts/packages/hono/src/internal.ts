/**
 * INTERNAL ROUTES — an ops/admin surface (e.g. a raw email-send) that is DOCUMENTED + TESTABLE but NEVER reachable over the
 * wire. A `RouteContract` marked `internal: true` is grouped under "Internal" in the docs (emitV4 tags it + stamps
 * `x-suluk-internal`), but `enforceInternal` 404s it in dev AND live — so it can't be accidentally hosted. Tests invoke it
 * in-process via {@link internalFetch}, which tags the request with a PER-PROCESS nonce the guard checks. The nonce never
 * enters the document or the wire, so ONLY in-process code (a test sharing the same module instance) can reach the route.
 */
import { PROBLEM_CONTENT_TYPE } from "@suluk/core";
import type { MiddlewareHandler } from "hono";

/** The header the clean test path sets; carries the per-process nonce. Never appears in the document or a served response. */
export const INTERNAL_HEADER = "x-suluk-internal-call";

// per-process, unguessable, NEVER exposed. A test shares the same @suluk/hono module instance as the app it invokes, so it
// reads the SAME nonce; an external caller (a different process / the wire) cannot. Regenerated each process (fresh secret).
const NONCE: string = globalThis.crypto?.randomUUID?.() ?? `${Math.random()}.${Math.random()}`.replace(/0\./g, "");

const notFound = { type: "about:blank", title: "Not Found", status: 404 } as const;

/**
 * A middleware that 404s an INTERNAL op unless the request came through {@link internalFetch}. `isInternal(method, path)`
 * resolves whether the request targets an internal op — wire it to the contract's `matchRoute(...)?.internal === true`.
 * Mount it on `/api/*` before the routes. Returns a real RFC-9457 404 so an internal route is indistinguishable from a
 * missing one (no oracle that it exists).
 */
export function enforceInternal(isInternal: (method: string, path: string) => boolean): MiddlewareHandler {
  return async (c, next) => {
    const path = new URL(c.req.url).pathname;
    if (isInternal(c.req.method, path) && c.req.header(INTERNAL_HEADER) !== NONCE) {
      return c.json(notFound, 404, { "content-type": PROBLEM_CONTENT_TYPE });
    }
    return next();
  };
}

/**
 * The CLEAN way to invoke an INTERNAL route from a TEST — a normal `app.fetch`, but tagged with the per-process internal
 * nonce so `enforceInternal` lets it through. In-process only (the nonce is never on the wire), so dev/live stay closed.
 *
 *   const res = await internalFetch(app, new Request("http://x/api/email/send", { method: "POST", body }), env, ctx);
 */
export function internalFetch(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- interop: accept any Hono/fetch app whose env/ctx types vary.
  app: { fetch: (req: Request, env?: any, ctx?: any) => Response | Promise<Response> },
  request: Request | string,
  env?: unknown,
  ctx?: unknown,
): Response | Promise<Response> {
  const src = typeof request === "string" ? new Request(request) : request;
  const headers = new Headers(src.headers);
  headers.set(INTERNAL_HEADER, NONCE);
  return app.fetch(new Request(src, { headers }), env, ctx);
}
