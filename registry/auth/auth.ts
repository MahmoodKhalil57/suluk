/**
 * Auth (Suluk registry: `auth`) — the Better Auth mount + an Effect-TS `CurrentUser` service, the FOUNDATION every other
 * module builds on (it owns the `user` table + the `apikey` table `keys` manages). `buildAuth` is the config (drizzle
 * adapter + openAPI/apiKey/passkey plugins), parametrized via env + `AuthOptions`; `mountAuthRoutes` mounts the handler on
 * Hono; `currentUserLayer` exposes the session user as an Effect service other services can require. The signup hook
 * (`onUserCreated`) is where you grant free credits — wire it to the `credits` module. Yours to edit.
 */
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI, mcp } from "better-auth/plugins";
import { apiKey } from "@better-auth/api-key";
import { passkey } from "@better-auth/passkey";
import { drizzle } from "drizzle-orm/d1";
import { Context, Effect, Layer } from "effect";
import type { Hono, MiddlewareHandler } from "hono";
import { principalFromSession, verifyApiKey, type ApiKeyVerifierLike, type SessionLike } from "@suluk/better-auth";
import * as schema from "./db/auth";

export interface AuthEnv {
  DB: D1Database;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
}

export interface AuthOptions {
  baseURL?: string;
  trustedOrigins?: string[];
  passkey?: { rpID: string; rpName: string; origin?: string | string[] };
  /** run after a user is created (e.g. grant signup credits via @suluk/credits) — the auth ↔ credits seam. */
  onUserCreated?: (userId: string) => Promise<void>;
  /**
   * Turn the API-as-MCP server (`/api/mcp`) into an OAuth 2.1 authorization server (Better Auth's `mcp()` plugin composes
   * oidc-provider: the oauthApplication/oauthAccessToken/oauthConsent tables + `/.well-known/*` + `/api/auth/mcp/{authorize,
   * token,get-session}` + `/api/auth/oauth2/consent`). The GRANTED scopes should be your API's scope set — so an MCP
   * connection is gated + attributed by the SAME `enforceApiKeyScope` machinery as an api key (one surface). `loginPage`/
   * `consentPage` are your web pages (mid-OAuth sign-in + scope-selection). Omit to run without MCP OAuth.
   */
  mcp?: { loginPage: string; consentPage: string; resource: string; scopes: string[] };
}

function buildAuth(env: AuthEnv, opts: AuthOptions = {}) {
  const db = drizzle(env.DB);
  return betterAuth({
    database: drizzleAdapter(db, { provider: "sqlite", schema }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: opts.baseURL ?? env.BETTER_AUTH_URL,
    trustedOrigins: opts.trustedOrigins,
    ...(env.GOOGLE_CLIENT_ID ? { socialProviders: { google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET ?? "" } } } : {}),
    ...(opts.onUserCreated ? { databaseHooks: { user: { create: { after: async (u: { id: string }) => { await opts.onUserCreated!(u.id); } } } } } : {}),
    plugins: [
      openAPI(),
      apiKey({ enableMetadata: true }),
      ...(opts.passkey ? [passkey({ rpID: opts.passkey.rpID, rpName: opts.passkey.rpName, origin: opts.passkey.origin })] : []),
      ...(opts.mcp
        ? [
            mcp({
              loginPage: opts.mcp.loginPage,
              resource: opts.mcp.resource,
              // loginPage is also required on oidcConfig by the type (mcp overrides it with the top-level one); keep equal.
              oidcConfig: { loginPage: opts.mcp.loginPage, consentPage: opts.mcp.consentPage, scopes: opts.mcp.scopes, requirePKCE: true },
            }),
          ]
        : []),
    ],
  });
}

// One auth instance per DB binding (Workers reuse the isolate across requests).
const cache = new WeakMap<D1Database, ReturnType<typeof buildAuth>>();
export function createAuth(env: AuthEnv, opts?: AuthOptions) {
  const hit = cache.get(env.DB);
  if (hit) return hit;
  const auth = buildAuth(env, opts);
  cache.set(env.DB, auth);
  return auth;
}

/**
 * Request-scoped identity, set by {@link identity} (session) or {@link apiKeyAuth} (an `x-api-key`). `user` is the resolved
 * principal (rate-limit + routes read `c.get("user")`); `scopes` are its granted scopes; `keyId`/`keyName` are set ONLY for
 * a KEYED caller — their presence is how the scope gate tells a key call from a session call. Extend with `keyChain` etc.
 */
export type AppVars = { user?: { id: string; email?: string }; scopes?: string[]; keyId?: string; keyName?: string };
export type AppCtx = { Bindings: AuthEnv; Variables: AppVars };

/**
 * Resolve the Better Auth session ONCE per `/api/*` request and stash the principal on the context (so routes read
 * `c.get("user")` instead of re-running getSession). Skips `/api/auth/*` (those establish the session) and anonymous
 * (no cookie). A failed lookup degrades to anonymous — it never 500s. `roleScopes` (via {@link AuthOptions}? — pass your
 * map) turns a user's role into scopes (e.g. `{ admin: ["admin"] }`); without it, session callers carry no scopes (they
 * pass the key-scope gate regardless — only KEYED callers are scope-restricted).
 */
export function identity(roleScopes?: Record<string, string[]>): MiddlewareHandler<AppCtx> {
  return async (c, next) => {
    const path = new URL(c.req.url).pathname;
    if (!path.startsWith("/api/auth") && c.req.header("cookie")) {
      try {
        const s = await createAuth(c.env).api.getSession({ headers: c.req.raw.headers });
        if (s?.user?.id) {
          c.set("user", { id: s.user.id, email: s.user.email ?? undefined });
          c.set("scopes", principalFromSession(s as unknown as SessionLike, roleScopes ? { roleScopes } : {}).scopes);
        }
      } catch {
        /* anonymous */
      }
    }
    return next();
  };
}

/**
 * Programmatic auth via an `x-api-key` header (the api-key plugin) — when there is NO session, verify the key and stash its
 * OWNER + scopes + key id on the SAME slots a session sets, so a key caller reaches the metered API exactly like a user.
 * The verification (`verifyApiKey`) + permission→scope mapping stay in `@suluk/better-auth`; this is the wiring.
 */
export const apiKeyAuth: MiddlewareHandler<AppCtx> = async (c, next) => {
  const key = c.req.header("x-api-key");
  if (key && !c.get("user")) {
    const res = await verifyApiKey(createAuth(c.env).api as unknown as ApiKeyVerifierLike, key);
    // VerifyApiKeyResult is a flat interface (not a discriminated union), so guard the fields explicitly.
    if (res.ok && res.key?.userId && res.principal) {
      c.set("user", { id: res.key.userId });
      c.set("scopes", res.principal.scopes);
      if (res.key.id) c.set("keyId", res.key.id);
      if (res.key.name) c.set("keyName", res.key.name);
    }
  }
  return next();
};

/** The scoped-caller id for an MCP connection — `mcp:<userId>:<clientId>`, NOT the bare clientId (which is shared across
 *  every user who authorized the same OAuth app), so per-connection attribution + caps are correctly per-(user,connection). */
export const mcpConnectionKeyId = (userId: string, clientId: string): string => `mcp:${userId}:${clientId}`;

/** Reach the mcp plugin's `getMcpSession` (added at runtime by `mcp()`, not on the inferred api type) — via a type guard. */
interface McpSessionApi {
  getMcpSession(args: { headers: Headers }): Promise<unknown>;
}
const hasGetMcpSession = (api: unknown): api is McpSessionApi =>
  typeof api === "object" && api !== null && "getMcpSession" in api && typeof (api as McpSessionApi).getMcpSession === "function";

/**
 * The THIRD caller kind — an MCP OAuth bearer. When there is no session/api-key and the request carries
 * `Authorization: Bearer <oauth-token>`, resolve it through the mcp plugin's `getMcpSession` (the OAuthAccessToken's owner +
 * granted scopes) and stash the owner + scopes on the SAME slots an api key sets — so the connection is gated + attributed
 * by the EXACT same machinery (`enforceApiKeyScope`). The connection's id flows through `keyId` as `mcp:<userId>:<clientId>`.
 * Only enabled behavior when `opts.mcp` was passed to `buildAuth` (else `getMcpSession` is absent → a no-op).
 */
export const mcpBearerAuth: MiddlewareHandler<AppCtx> = async (c, next) => {
  const authz = c.req.header("authorization");
  if (c.get("user") || !authz || !authz.toLowerCase().startsWith("bearer ")) return next();
  if (new URL(c.req.url).pathname.startsWith("/api/auth")) return next(); // the OAuth endpoints establish the token
  try {
    const api = createAuth(c.env).api;
    if (hasGetMcpSession(api)) {
      const t = (await api.getMcpSession({ headers: c.req.raw.headers })) as { userId?: unknown; clientId?: unknown; scopes?: unknown } | null;
      if (t && typeof t.userId === "string" && typeof t.clientId === "string" && typeof t.scopes === "string") {
        c.set("user", { id: t.userId });
        c.set("scopes", t.scopes.split(" ").filter(Boolean));
        c.set("keyId", mcpConnectionKeyId(t.userId, t.clientId));
      }
    }
  } catch {
    /* no valid bearer → anonymous */
  }
  return next();
};

/**
 * Mount Better Auth on your app: the caller-resolution middleware (`identity` session · `apiKeyAuth` · `mcpBearerAuth`) on
 * `/api/*` FIRST, then the `/api/auth/*` handler. One auth instance per request's DB binding. Pass `roleScopes` to grant
 * scopes by role; pass `opts.mcp` (see AuthOptions) to enable the OAuth server + the bearer path.
 */
export function mountAuthRoutes<T extends Hono<{ Bindings: AuthEnv }>>(app: T, opts?: AuthOptions & { roleScopes?: Record<string, string[]> }): T {
  // cast to the untyped MiddlewareHandler so these attach to an app whose Variables aren't declared as AppVars.
  app.use("/api/*", identity(opts?.roleScopes) as MiddlewareHandler);
  app.use("/api/*", apiKeyAuth as MiddlewareHandler);
  app.use("/api/*", mcpBearerAuth as MiddlewareHandler);
  app.on(["GET", "POST"], "/api/auth/*", (c) => createAuth(c.env, opts).handler(c.req.raw));
  return app;
}

// ── the current session user as an Effect service ──
export interface SessionUser {
  id: string;
  email: string;
  name?: string;
}
export class CurrentUser extends Context.Tag("CurrentUser")<CurrentUser, SessionUser | null>() {}

/** Resolve the session user from the request headers. */
export const getCurrentUser = (env: AuthEnv, headers: Headers, opts?: AuthOptions): Promise<SessionUser | null> =>
  createAuth(env, opts)
    .api.getSession({ headers })
    .then((s) => (s?.user ? { id: s.user.id, email: s.user.email, name: s.user.name ?? undefined } : null));

/** A `CurrentUser` layer for one request — provide it alongside your feature service layers. */
export const currentUserLayer = (env: AuthEnv, headers: Headers, opts?: AuthOptions): Layer.Layer<CurrentUser> =>
  Layer.effect(CurrentUser, Effect.promise(() => getCurrentUser(env, headers, opts)));
