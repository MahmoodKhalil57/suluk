/**
 * Billing routes (Suluk registry: `billing`) — Hono over the {@link Billing} Effect service. Provides `StripeCfg` from
 * env (`STRIPE_SECRET_KEY`). Mount: `app.route("/billing", billingRoutes())`. The crediting webhook stays in your app.
 */
import { Hono } from "hono";
import { Effect, Layer } from "effect";
import { DbLive, type Bindings } from "../app";
import { Billing, BillingLive, StripeCfg } from "../services/billing";

type Env = { Bindings: Bindings & { STRIPE_SECRET_KEY: string; STRIPE_FETCH?: typeof fetch } };

export function billingRoutes() {
  const r = new Hono<Env>();

  const run = <A>(env: Env["Bindings"], program: Effect.Effect<A, never, Billing>): Promise<A> =>
    program.pipe(
      Effect.provide(BillingLive),
      Effect.provide(Layer.succeed(StripeCfg, { secretKey: env.STRIPE_SECRET_KEY, fetch: env.STRIPE_FETCH })),
      Effect.provide(DbLive(env)),
      Effect.runPromise,
    );

  // POST /billing/customer { userId, email } → ensure a Stripe customer.
  r.post("/customer", async (c) => {
    const { userId, email } = await c.req.json<{ userId: string; email?: string }>();
    return c.json({ customerId: await run(c.env, Effect.flatMap(Billing, (s) => s.ensureCustomer(userId, email))) });
  });

  // POST /billing/payment-session { userId, amountCents, credits } → a client secret for the Payment Element.
  r.post("/payment-session", async (c) => {
    const { userId, amountCents, credits } = await c.req.json<{ userId: string; amountCents: number; credits: number }>();
    return c.json(await run(c.env, Effect.flatMap(Billing, (s) => s.paymentSession(userId, amountCents, credits))));
  });

  // POST /billing/setup-session { userId } → a client secret to vault a card ("add card").
  r.post("/setup-session", async (c) => {
    const { userId } = await c.req.json<{ userId: string }>();
    return c.json(await run(c.env, Effect.flatMap(Billing, (s) => s.setupSession(userId))));
  });

  // GET /billing/cards/:userId → the saved cards.
  r.get("/cards/:userId", async (c) => c.json({ cards: await run(c.env, Effect.flatMap(Billing, (s) => s.cards(c.req.param("userId")))) }));

  // POST /billing/portal { userId, returnUrl } → the Stripe billing-portal URL.
  r.post("/portal", async (c) => {
    const { userId, returnUrl } = await c.req.json<{ userId: string; returnUrl: string }>();
    const portal = await run(c.env, Effect.flatMap(Billing, (s) => s.portal(userId, returnUrl)));
    return portal ? c.json(portal) : c.json({ error: "no billing account" }, 404);
  });

  return r;
}
