/**
 * Auth (Suluk registry: `auth`) — the Better Auth mount + an Effect-TS `CurrentUser` service, the FOUNDATION every other
 * module builds on (it owns the `user` table + the `apikey` table `keys` manages). `buildAuth` is the config (drizzle
 * adapter + openAPI/apiKey/passkey plugins), parametrized via env + `AuthOptions`; `mountAuthRoutes` mounts the handler on
 * Hono; `currentUserLayer` exposes the session user as an Effect service other services can require. The signup hook
 * (`onUserCreated`) is where you grant free credits — wire it to the `credits` module. Yours to edit.
 */
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI } from "better-auth/plugins";
import { apiKey } from "@better-auth/api-key";
import { passkey } from "@better-auth/passkey";
import { drizzle } from "drizzle-orm/d1";
import { Context, Effect, Layer } from "effect";
import type { Hono } from "hono";
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

/** Mount Better Auth's handler on your app (default `/api/auth/*`) — one auth instance per request's DB binding. */
export function mountAuthRoutes<T extends Hono<{ Bindings: AuthEnv }>>(app: T, opts?: AuthOptions): T {
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
