/**
 * The base app (Suluk registry: `app`) — a Hono app + the Effect-TS runtime seam every feature service builds on. Feature
 * modules (`credits`, `keys`, `billing`, …) are Effect SERVICES (a `Context.Tag` + a `Layer` that wraps the `@suluk/*`
 * logic); their routes provide the module's layer + `DbLive(env)` and run the program. This file is delivered into YOUR
 * repo by `shadcn add` and is yours to edit. Cloudflare Workers target (D1 binding).
 */
import { Hono } from "hono";
import { Context, Layer } from "effect";
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";

export interface Bindings {
  DB: D1Database;
}

/** The database as an Effect service — every feature service depends on it; the app provides it per-request from the
 *  D1 binding, so services never reach for a global. */
export class Db extends Context.Tag("Db")<Db, DrizzleD1Database>() {}

/** Build the `Db` layer for one request from the Worker bindings. */
export const DbLive = (env: Bindings): Layer.Layer<Db> => Layer.succeed(Db, drizzle(env.DB));

/** Create the base app. Mount a feature module's router: `app.route("/credits", creditsRoutes())`. */
export function createApp() {
  const app = new Hono<{ Bindings: Bindings }>();

  app.get("/health", (c) => c.json({ ok: true }));

  app.onError((err, c) => {
    console.error("[app] unhandled", err);
    return c.json({ error: err instanceof Error ? err.message : "internal error" }, 500);
  });

  return app;
}

export type App = ReturnType<typeof createApp>;
