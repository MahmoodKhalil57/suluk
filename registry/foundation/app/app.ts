/**
 * The base app (Suluk registry: `app`) — a Hono app + the Effect-TS `Db` service every feature module builds on. Modules are
 * Effect SERVICES (a `Context.Tag` + a `Layer` wrapping `@suluk/*` logic); their routes provide the module's layer + `DbLive(env)`
 * and run the program. This file is delivered into YOUR repo by `shadcn add` and is yours to edit. Cloudflare Workers (D1) target.
 *
 * The drizzle `.zod()` SCHEMA SEAM — inline column + table refinement, the master `table.zodSchema`, `tableZod`/`tableZodSchemas`,
 * the `wireDto` timestamp codec, `msRange` date bounds, `nanoid`, and the auto-`$ref` DB provenance — lives in `@suluk/drizzle`.
 * It is imported here (which installs the `.zod()`/`.zodSchema` augmentation as a side effect) and re-exported, so a schema file
 * gets the whole seam from `../app` with no local machinery to maintain.
 */
import { Hono } from "hono";
import { cors } from "hono/cors";
import { Context, Layer } from "effect";
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";

// The drizzle `.zod()` seam — the single published source (`@suluk/drizzle`). Re-exporting installs the column/table `.zod()` +
// `.zodSchema` augmentation (a side effect) AND hands a schema file `wireDto`/`msRange`/`nanoid`/`tableZod`/`tableZodSchemas`.
export { tableZod, tableZodSchemas, wireDto, msRange, nanoid } from "@suluk/drizzle";

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
