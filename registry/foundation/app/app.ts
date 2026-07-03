/**
 * The base app (Suluk registry: `app`) — a Hono app + the Effect-TS runtime seam every feature service builds on. Feature
 * modules (`credits`, `keys`, `billing`, …) are Effect SERVICES (a `Context.Tag` + a `Layer` that wraps the `@suluk/*`
 * logic); their routes provide the module's layer + `DbLive(env)` and run the program. This file is delivered into YOUR
 * repo by `shadcn add` and is yours to edit. Cloudflare Workers target (D1 binding).
 */
import { Hono } from "hono";
import { cors } from "hono/cors";
import { Context, Layer } from "effect";
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import type { Table } from "drizzle-orm";
import { createSelectSchema, createInsertSchema, createUpdateSchema, type BuildRefine, type NoUnknownKeys } from "drizzle-zod";

export interface Bindings {
  DB: D1Database;
  /** comma-separated allowlist of browser origins the API echoes on CORS (credentials:true, never "*"). Should match
   *  the `trustedOrigins` you pass to `mountAuthRoutes` — one source of truth. */
  TRUSTED_ORIGINS?: string;
}

/** The app-owned trusted-origin allowlist (from `TRUSTED_ORIGINS`). Keep it in sync with auth's `trustedOrigins`. */
export function trustedOrigins(env: Pick<Bindings, "TRUSTED_ORIGINS">): string[] {
  return (env.TRUSTED_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
}
const isTrusted = (origin: string, allow: string[]): boolean => allow.includes(origin);

/** The database as an Effect service — every feature service depends on it; the app provides it per-request from the
 *  D1 binding, so services never reach for a global. */
export class Db extends Context.Tag("Db")<Db, DrizzleD1Database>() {}

/** Build the `Db` layer for one request from the Worker bindings. */
export const DbLive = (env: Bindings): Layer.Layer<Db> => Layer.succeed(Db, drizzle(env.DB));

/**
 * Derive a table's three drizzle-zod schemas in ONE call — so a module defines its table ONCE and reads its
 * `select` (a full row), `insert` (writable columns, defaults optional) and `update` (all optional) schemas + (via
 * `z.infer`) their TS types from here, instead of rewriting `createSelectSchema(table)` / `createInsertSchema(table)` /
 * `createUpdateSchema(table)` in every schema file. The optional `refine` annotates the SELECT schema (per-field
 * `.describe()` + `.meta({examples})`), so those labels bubble up into the wire response body / Scalar. Generic over the
 * table, so every field keeps its precise type — `z.infer<typeof tableSchemas(t).select>` is the exact row shape.
 *
 *   const { select, insert, update } = tableSchemas(todo, { title: (s) => s.describe("The todo text.") });
 *   type Row = z.infer<typeof select>;   // { id: string; title: string; completed: boolean; ... }
 */
export function tableSchemas<T extends Table, R extends BuildRefine<T["_"]["columns"], undefined> = BuildRefine<T["_"]["columns"], undefined>>(
  table: T,
  refine?: NoUnknownKeys<R, T["$inferSelect"]>,
) {
  return {
    select: createSelectSchema(table, refine),
    insert: createInsertSchema(table),
    update: createUpdateSchema(table),
  };
}

/** Create the base app. Mount a feature module's router: `app.route("/credits", creditsRoutes())`. */
export function createApp() {
  const app = new Hono<{ Bindings: Bindings }>();

  // CORS on the API surface: echo a TRUSTED browser origin (credentials:true), never "*". Runs before any mount.
  app.use("/api/*", cors({ origin: (origin, c) => (isTrusted(origin, trustedOrigins(c.env)) ? origin : null), credentials: true }));

  app.get("/health", (c) => c.json({ ok: true }));
  app.get("/api/health", (c) => c.json({ ok: true, service: "suluk-api" }));

  app.onError((err, c) => {
    console.error("[app] unhandled", err);
    return c.json({ error: err instanceof Error ? err.message : "internal error" }, 500);
  });

  return app;
}

export type App = ReturnType<typeof createApp>;
