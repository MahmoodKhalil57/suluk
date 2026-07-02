/**
 * Credit-ledger routes (Suluk registry: `credits`) — Hono over the {@link Credits} Effect service. Each handler builds an
 * Effect program, provides `CreditsLive` + `DbLive(env)` (the module's layer + the request DB), and runs it. Mount it:
 * `app.route("/credits", creditsRoutes())`. Yours to edit; the ledger logic stays in `@suluk/credits`.
 */
import { Hono } from "hono";
import { Effect } from "effect";
import { DbLive, type Bindings } from "../app";
import { Credits, CreditsLive } from "../services/credits";

type Env = { Bindings: Bindings };

export function creditsRoutes() {
  const r = new Hono<Env>();

  /** Run a Credits program against the request's DB. */
  const run = <A>(env: Bindings, program: Effect.Effect<A, never, Credits>): Promise<A> =>
    program.pipe(Effect.provide(CreditsLive), Effect.provide(DbLive(env)), Effect.runPromise);

  r.get("/balance/:userId", async (c) => {
    const balance = await run(c.env, Effect.flatMap(Credits, (s) => s.balance(c.req.param("userId"))));
    return c.json({ balance });
  });

  r.get("/transactions/:userId", async (c) => {
    const transactions = await run(c.env, Effect.flatMap(Credits, (s) => s.transactions(c.req.param("userId"))));
    return c.json({ transactions });
  });

  // POST /credits/debit { userId, amount, reason } — atomic metered debit; 402 when the balance can't cover it.
  r.post("/debit", async (c) => {
    const { userId, amount, reason } = await c.req.json<{ userId: string; amount: number; reason?: string }>();
    const ok = await run(c.env, Effect.flatMap(Credits, (s) => s.debit(userId, amount, reason ?? "usage")));
    return c.json({ ok }, ok ? 200 : 402);
  });

  // POST /credits/grant { userId, amount, idemKey, reason } — idempotent money-IN (safe to retry; keyed on idemKey).
  r.post("/grant", async (c) => {
    const { userId, amount, idemKey, reason } = await c.req.json<{ userId: string; amount: number; idemKey: string; reason?: string }>();
    const granted = await run(c.env, Effect.flatMap(Credits, (s) => s.grant(userId, amount, idemKey, reason)));
    return c.json({ granted });
  });

  return r;
}
