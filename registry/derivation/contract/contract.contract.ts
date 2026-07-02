/**
 * The CONTRACT (Suluk registry: `contract`) — the keystone. It declares the base API surface as `RouteContract`s
 * (via @suluk/hono's `contractDoc`) and DERIVES everything downstream waves consume from that single source:
 *
 *   • `apiDocument(principal?)` — the v4 OpenAPI document, projected PER PRINCIPAL: `emitV4` hides any operation whose
 *     required `scopes` the caller doesn't hold (the WHO axis), so an anonymous caller sees only the public surface.
 *   • `SCOPE_BY_OP` — op-name → its single required scope (the `x-suluk-access` facet), the map the scope gate
 *     (`enforceApiKeyScope`) and the MCP tool-gate read to enforce a keyed caller's grants on the wire.
 *   • `PUBLIC_OPS` — the set of ops that need NO scope (health, pricing catalogs, the signature-verified Stripe webhook).
 *
 * The operation surface is COMPOSED, not centrally authored: each module OWNS its ops in its own `<module>.contract.ts`
 * fragment (next to its routes), and the generator spreads them into `./contract.ops` (`ALL_OPS`). This file adds the
 * system op (health) + the DERIVATIONS. So adding/changing a module's routes touches only THAT module's fragment — the
 * doc, the scope gate, and the MCP surface re-project together and can never drift from the routes. The v4 document itself
 * is produced by @suluk/hono's `emitV4` (npm the derivation; own the wiring).
 */
import type { MiddlewareHandler } from "hono";
import { contractDoc, emitV4, type RouteContract, type DocumentedRoute } from "@suluk/hono";
import { toProblemDetails, PROBLEM_CONTENT_TYPE, type OpenAPIv4Document } from "@suluk/core";
import { ingestAuthOpenAPI, mergeAuth, authSecuritySchemes } from "@suluk/better-auth";
import { ALL_OPS } from "./contract.ops";

/** The SYSTEM ops the contract module owns directly (public liveness). Every FEATURE module's ops are COMPOSED in via
 * `./contract.ops` (`ALL_OPS`) — the generator spreads one `<module>.contract.ts` fragment per installed module, so a
 * module's routes and its declared ops live together and the central contract can never drift. */
const SYSTEM_OPS: readonly DocumentedRoute[] = [
  { method: "get", path: "/api/health", name: "health", summary: "Liveness check — returns ok + the service name. Public.", cost: { components: [], infra: { "worker.request": 1 }, settlement: { method: "rate-limited" } }, tags: ["System"], rateLimit: { windowMs: 60_000, maxRequests: 120, key: "ip" }, responses: [{ status: 200, description: "The service is up." }] },
];

/** THE base operation surface = the system ops + every installed module's composed fragment. */
export const CONTRACT = contractDoc([...SYSTEM_OPS, ...ALL_OPS]);

/** The op-name type — the by-name handle each derivation keys on (C009). */
export type OpName = Extract<(typeof CONTRACT)[number]["name"], string>;

/**
 * op-name → its single required scope (the `x-suluk-access` facet). DERIVED from the contract's `scopes` (first entry),
 * so it can never drift from the declared surface. This is the map `enforceApiKeyScope` and the MCP tool-gate read to
 * enforce a keyed caller's grants on the wire — the server is the only authz boundary (C022 inv.3); the facet describes it.
 */
export const SCOPE_BY_OP: Record<string, string> = Object.fromEntries(
  CONTRACT.flatMap((r) => (r.name && r.scopes && r.scopes.length > 0 ? [[r.name, r.scopes[0]] as const] : [])),
);

/**
 * The set of PUBLIC op-names — those that declare NO scope (health, the pricing catalogs, the signature-verified Stripe
 * webhook). DERIVED from the contract, so a newly-added scoped route is never accidentally treated as public. The scope
 * gate / MCP consult this to know which ops bypass the grant check.
 */
export const PUBLIC_OPS: Set<string> = new Set(
  CONTRACT.flatMap((r) => (r.name && (!r.scopes || r.scopes.length === 0) ? [r.name] : [])),
);

/**
 * Build the v4 OpenAPI document, projected for a principal (the WHO axis). Pass the caller's `{ scopes }` to hide any
 * operation whose required scopes they don't hold; omit it for the full public-plus-scoped document (the SDK / docs /
 * conformance project everything). The document is a PURE FUNCTION of the contract × the principal — @suluk/hono's
 * `emitV4` does the derivation (it also synthesizes the RFC-9457 error responses + the 401/403 for scoped ops).
 */
export function apiDocument(principal?: { scopes: string[] }): OpenAPIv4Document {
  const { document } = emitV4(CONTRACT, {
    info: {
      title: "Suluk API",
      version: "0.1.0",
      description: "The derived v4 contract surface (credits, keys, billing, cost, logs, email, webhooks).",
    },
    securityScheme: "apiKey", // scopes → security requirements referencing this scheme
    securitySchemes: { apiKey: { type: "apiKey", in: "header", name: "x-api-key" } }, // declare it so the refs resolve
    ...(principal ? { principal } : {}), // the WHO axis — project the doc to what this caller may see
    synthesizeErrors: true,
  });
  return document;
}

/** true when the Better Auth `api` can emit its own OpenAPI (the `openAPI()` plugin is enabled in `buildAuth`). */
function hasOpenApiGenerator(x: unknown): x is { generateOpenAPISchema: () => Promise<Record<string, unknown>> } {
  return typeof (x as { generateOpenAPISchema?: unknown } | null)?.generateOpenAPISchema === "function";
}

/**
 * The FULL v4 document INCLUDING Better Auth's own surface (sign-in/up/out, get-session, social sign-in, …) — so
 * BETTER-AUTH CLIENTS can discover + call the auth API from the same `/api/openapi.json`, exactly like toolfactory does.
 * It ingests the `openAPI()`-generated OAS 3.0 (`auth.api.generateOpenAPISchema()`) → v4 (@suluk/better-auth's
 * `ingestAuthOpenAPI`) → merges it into {@link apiDocument} (`mergeAuth`). ASYNC: the auth schema comes from a LIVE,
 * per-request auth instance (Workers build it via `createAuth(c.env)`). Best-effort — if the generator is absent or throws
 * it falls back to the base doc (never throws), so `/api/openapi.json` always serves at least the app surface. The APP wins
 * a path collision (a barebones auth op never clobbers a typed contract op); Better Auth only emits enabled routes.
 */
export async function apiDocumentWithAuth(authApi: unknown, principal?: { scopes: string[] }): Promise<OpenAPIv4Document> {
  const base = apiDocument(principal);
  if (!hasOpenApiGenerator(authApi)) return base;
  try {
    const authV4 = ingestAuthOpenAPI(await authApi.generateOpenAPISchema(), { basePath: "/api/auth" });
    const authOnly = { ...authV4, paths: Object.fromEntries(Object.entries(authV4.paths).filter(([p]) => !(p in base.paths))) };
    const { securitySchemes } = authSecuritySchemes({ session: true }); // declare the session-cookie scheme the auth ops reference
    return mergeAuth(base, authOnly, { securitySchemes });
  } catch (err) {
    // fall back to the base doc, but NOT silently — a bare swallow would serve an auth-LESS doc with zero signal.
    console.warn("apiDocumentWithAuth: Better Auth OpenAPI ingest failed — serving the base doc (auth surface ABSENT)", err);
    return base;
  }
}

/**
 * Resolve the required scope a request maps to. TWO tiers, so a keyed caller can NEVER reach an unlisted sub-path ungated:
 *   1. EXACT op — the longest static-path-prefix + method match among declared ops (a `GET /api/credits/balance/x` resolves
 *      to the `getCredits` op at `/api/credits`; a declared-public op like `/api/billing/packs` returns scope `undefined`).
 *   2. MODULE fallback — if no op matched, gate by the /api/<module> namespace: use the module's WRITE scope for a write
 *      method, else its READ scope (derived from any declared op in that module). This closes the hole where a module
 *      (e.g. billing) exposes many sub-paths but declares only a few ops — an undeclared `POST /api/billing/refund` is still
 *      gated `billing:write`. Returns `undefined` only for a genuinely non-contract module (no gate).
 * The METHOD disambiguates read vs write throughout (GET/HEAD → read, else write).
 */
/**
 * TIER-1 route match — the exact declared op a request resolves to: the longest static-path-prefix + same-method match
 * among the CONTRACT (a `GET /api/credits/balance/x` → the `getCredits` op at `/api/credits`). The single matcher both
 * `scopeForRequest` (the scope gate) and `validateRequest` (the body gate) read, so they can never disagree on WHICH op
 * a wire request maps to. Returns the whole {@link RouteContract} (name + scopes + request), or `undefined` if none match.
 */
export function matchRoute(method: string, path: string): RouteContract | undefined {
  const m = method.toUpperCase();
  let best: RouteContract | undefined;
  let bestLen = -1;
  for (const r of CONTRACT) {
    if (r.method.toUpperCase() !== m) continue;
    const base = r.path.split("/:")[0]; // the static prefix before any :param
    if ((path === base || path === r.path || path.startsWith(base + "/")) && base.length > bestLen) {
      best = r;
      bestLen = base.length;
    }
  }
  return best;
}

export function scopeForRequest(method: string, path: string): { op: string; scope?: string } | undefined {
  const m = method.toUpperCase();
  const wantWrite = m !== "GET" && m !== "HEAD";
  // tier 1 — exact op (longest static-prefix, same method)
  const best = matchRoute(method, path);
  if (best?.name) return { op: best.name, scope: best.scopes?.[0] };

  // tier 2 — module fallback: gate an undeclared sub-path by its /api/<module> namespace scope (read vs write).
  const modulePrefix = `/api/${path.split("/")[2] ?? ""}`;
  if (modulePrefix === "/api/") return undefined;
  let readScope: string | undefined;
  let writeScope: string | undefined;
  let known = false;
  for (const r of CONTRACT) {
    if (r.path !== modulePrefix && !r.path.startsWith(modulePrefix + "/")) continue;
    known = true;
    const s = r.scopes?.[0];
    if (!s) continue;
    if (r.method.toUpperCase() === "GET") readScope ??= s;
    else writeScope ??= s;
  }
  if (!known) return undefined; // not a contract module → no gate
  const scope = wantWrite ? (writeScope ?? readScope) : (readScope ?? writeScope);
  return { op: modulePrefix, scope };
}

/**
 * SCOPE-GATE for KEYED callers (an `x-api-key` / MCP caller — a `keyId` is on the context). A key holds a SUBSET of its
 * owner's access, so a scoped op requires the key to hold that op's scope (from the contract's `x-suluk-access` facet).
 * SESSION callers (no `keyId`) pass straight through — a signed-in user is unrestricted here (their own auth gates apply).
 * Runs AFTER `apiKeyAuth` (which set `keyId` + `scopes`). The server is the ONLY authz boundary; the facet describes it.
 */
export const enforceApiKeyScope: MiddlewareHandler = async (c, next) => {
  const keyId = c.get("keyId") as string | undefined;
  if (!keyId) return next(); // session / anonymous → unrestricted at this gate
  const path = new URL(c.req.url).pathname;
  const match = scopeForRequest(c.req.method, path);
  if (!match || !match.scope) return next(); // non-contract path or a public op → allow
  const scopes = (c.get("scopes") as string[] | undefined) ?? [];
  if (!scopes.includes(match.scope)) {
    return c.json(toProblemDetails({ tag: "ForbiddenError", detail: `This API key is missing the "${match.scope}" scope.` }), 403, {
      "content-type": PROBLEM_CONTENT_TYPE,
    });
  }
  return next();
};

/** The methods that carry a body — the only ones `validateRequest` inspects (GET/HEAD/DELETE/OPTIONS skip). */
const BODY_METHODS = new Set(["POST", "PUT", "PATCH"]);

/**
 * CONTRACT-DERIVED request-body validation. Resolves the op the SAME way the scope gate does ({@link matchRoute} —
 * longest static-prefix + method), and, IF that op declares a `request.json` schema AND the method carries a body,
 * parses `c.req.json()` with it. On a schema failure it synthesizes an RFC-9457 400 (`ValidationError`) with the flattened
 * Zod issues in `errors`; on success it stashes the parsed body at `c.set("validatedBody", …)` (handlers may re-read the
 * body themselves — this doesn't consume the stream for them, it only ADDS the pre-parsed value). Any op WITHOUT a
 * declared `request.json` (or any GET/HEAD) passes straight through, so the gate only ever tightens declared ops — it
 * never blocks an undeclared surface. Mount AFTER `enforceApiKeyScope` (a missing scope 403 precedes a bad-body 400).
 */
export const validateRequest: MiddlewareHandler = async (c, next) => {
  if (!BODY_METHODS.has(c.req.method.toUpperCase())) return next(); // no body to validate
  const path = new URL(c.req.url).pathname;
  const route = matchRoute(c.req.method, path);
  const schema = route?.request?.json;
  if (!schema) return next(); // no declared body schema for this op → nothing to validate

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json(toProblemDetails({ tag: "ValidationError", detail: "The request body is not valid JSON." }), 400, {
      "content-type": PROBLEM_CONTENT_TYPE,
    });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      toProblemDetails({
        tag: "ValidationError",
        detail: "The request body does not satisfy the operation's contract.",
        errors: parsed.error.flatten().fieldErrors as Record<string, unknown>,
      }),
      400,
      { "content-type": PROBLEM_CONTENT_TYPE },
    );
  }

  // stash the parsed body for any handler that wants it (handlers re-read c.req.json() as before). `validatedBody` isn't a
  // declared Variable on this app's context (the registry keeps the contract mount decoupled from AppVars), so cast the set.
  (c as { set: (k: string, v: unknown) => void }).set("validatedBody", parsed.data);
  return next();
};
