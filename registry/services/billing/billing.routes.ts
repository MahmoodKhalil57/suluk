/**
 * Billing routes (Suluk registry: `billing`) — Hono over the {@link Billing} Effect service. Provides `StripeCfg` from env
 * (`STRIPE_SECRET_KEY`). Mount: `app.route("/api/billing", billingRoutes())` — the paths below are the sub-paths, so the
 * full surface is `/api/billing/*` (toolfactory parity). The crediting WEBHOOK stays in your app.
 *
 * SERVER-AUTHORITATIVE money: the client picks a pack/plan ID, never a price; amounts + credits are derived from
 * `../pricing` inside the service. The caller's userId is the AUTHENTICATED principal the auth `identity` middleware set on
 * the context (`c.get("user")`) — NEVER a body/query/header field, so a caller can only ever move THEIR OWN money.
 */
import { Hono } from "hono";
import { Context, Effect, Layer } from "effect";
import { DbLive, type Bindings } from "../app";
import { Billing, BillingLive, StripeCfg } from "../services/billing";

type Env = { Bindings: Bindings & { STRIPE_SECRET_KEY: string; STRIPE_PUBLISHABLE_KEY?: string; STRIPE_FETCH?: typeof fetch } };

/** The AUTHENTICATED caller's userId — the principal the auth `identity` middleware stashed as `c.get("user")`. Read off
 *  the variables bag (the app's Variables aren't declared as AppVars here, so cast the read). Never a client-supplied field. */
const caller = (c: { var: { user?: { id?: string } } }): string | null => c.var.user?.id ?? null;

export function billingRoutes() {
  const r = new Hono<Env>();

  const run = <A>(env: Env["Bindings"], program: Effect.Effect<A, never, Billing>): Promise<A> =>
    program.pipe(
      Effect.provide(BillingLive),
      Effect.provide(Layer.succeed(StripeCfg, { secretKey: env.STRIPE_SECRET_KEY, fetch: env.STRIPE_FETCH })),
      Effect.provide(DbLive(env)),
      Effect.runPromise,
    );
  /** Run one Billing method against the request's DB + Stripe config. `s` is the resolved service. */
  const call = <A>(c: { env: Env["Bindings"] }, f: (s: Context.Tag.Service<Billing>) => Effect.Effect<A>): Promise<A> =>
    run(c.env, Effect.flatMap(Billing, f));

  // ── pricing (public) ──
  r.get("/packs", async (c) => c.json({ packs: await call(c, (s) => s.packs()) }));
  r.get("/plans", async (c) => c.json({ plans: await call(c, (s) => s.plans()) }));
  r.get("/payment-config", (c) => c.json({ publishableKey: c.env.STRIPE_PUBLISHABLE_KEY ?? "" }));

  // ── top-up: hosted Checkout ──
  // POST /checkout { packId, successUrl, cancelUrl } → a hosted top-up session URL.
  r.post("/checkout", async (c) => {
    const userId = caller(c);
    if (!userId) return c.json({ error: "unauthenticated" }, 401);
    const { packId, successUrl, cancelUrl } = await c.req.json<{ packId: string; successUrl: string; cancelUrl: string }>();
    return c.json(await call(c, (s) => s.checkout(userId, packId, successUrl, cancelUrl)));
  });

  // ── top-up: on-site PaymentIntent (one-click when onDefaultCard) ──
  // POST /payment-intent { packId, onDefaultCard? } → { clientSecret } (null when one-click has no default card).
  r.post("/payment-intent", async (c) => {
    const userId = caller(c);
    if (!userId) return c.json({ error: "unauthenticated" }, 401);
    const { packId, onDefaultCard } = await c.req.json<{ packId: string; onDefaultCard?: boolean }>();
    return c.json(await call(c, (s) => s.paymentIntent(userId, packId, onDefaultCard ?? false)));
  });

  // ── subscriptions ──
  // POST /subscribe { planId, hosted?, successUrl?, cancelUrl? } → one-click { clientSecret, subscriptionId } or hosted { url }.
  r.post("/subscribe", async (c) => {
    const userId = caller(c);
    if (!userId) return c.json({ error: "unauthenticated" }, 401);
    const { planId, hosted, successUrl, cancelUrl } = await c.req.json<{ planId: string; hosted?: boolean; successUrl?: string; cancelUrl?: string }>();
    const out = await call(c, (s) => s.subscribe(userId, planId, hosted ?? false, successUrl ?? "", cancelUrl ?? ""));
    return "error" in out ? c.json(out, 400) : c.json(out);
  });

  // GET /subscription → live status for the caller's subscription, or null.
  r.get("/subscription", async (c) => {
    const userId = caller(c);
    if (!userId) return c.json({ error: "unauthenticated" }, 401);
    return c.json({ subscription: await call(c, (s) => s.subscriptionStatus(userId)) });
  });

  // POST /subscription { cancel? } → schedule cancel at period end (cancel defaults true) / resume.
  r.post("/subscription", async (c) => {
    const userId = caller(c);
    if (!userId) return c.json({ error: "unauthenticated" }, 401);
    const { cancel } = await c.req.json<{ cancel?: boolean }>().catch(() => ({ cancel: true }));
    const out = await call(c, (s) => s.cancelSubscription(userId, cancel ?? true));
    return c.json(out, out.ok ? 200 : 404);
  });

  // POST /subscription-plan { planId } → change plan in place (upgrade prorated, downgrade deferred).
  r.post("/subscription-plan", async (c) => {
    const userId = caller(c);
    if (!userId) return c.json({ error: "unauthenticated" }, 401);
    const { planId } = await c.req.json<{ planId: string }>();
    const out = await call(c, (s) => s.changePlan(userId, planId));
    return "error" in out ? c.json(out, 400) : c.json(out);
  });

  // ── quotes ──
  // GET /purchase-quote?amountCents=… → { credits, taxCents, totalCents } for a custom top-up.
  r.get("/purchase-quote", async (c) => {
    const userId = caller(c);
    if (!userId) return c.json({ error: "unauthenticated" }, 401);
    const amountCents = Number(c.req.query("amountCents") ?? 0);
    if (!Number.isFinite(amountCents) || amountCents <= 0) return c.json({ error: "invalid amount" }, 400);
    const ip = c.req.header("cf-connecting-ip") ?? null;
    return c.json(await call(c, (s) => s.purchaseQuote(userId, amountCents, ip)));
  });

  // GET /refund-quote?credits=… → { credits, netCents } the buyback returns.
  r.get("/refund-quote", async (c) => {
    const credits = Number(c.req.query("credits") ?? 0);
    if (!Number.isInteger(credits) || credits <= 0) return c.json({ error: "invalid credits" }, 400);
    return c.json(await call(c, (s) => s.refundQuote(credits)));
  });

  // ── refund (module-owned: debit credits, then Stripe refund) ──
  // POST /refund { credits } → { refundedCents }.
  r.post("/refund", async (c) => {
    const userId = caller(c);
    if (!userId) return c.json({ error: "unauthenticated" }, 401);
    const { credits } = await c.req.json<{ credits: number }>();
    const out = await call(c, (s) => s.refund(userId, credits));
    return "error" in out ? c.json(out, 400) : c.json(out);
  });

  // ── cards / methods ──
  // GET /cards/:userId → the saved cards (kept for back-compat).
  r.get("/cards/:userId", async (c) => c.json({ cards: await call(c, (s) => s.cards(c.req.param("userId"))) }));
  // GET /methods → the caller's saved cards.
  r.get("/methods", async (c) => {
    const userId = caller(c);
    if (!userId) return c.json({ error: "unauthenticated" }, 401);
    return c.json({ methods: await call(c, (s) => s.cards(userId)) });
  });
  // POST /methods/default { pmId } → set the invoice default (+ move an active subscription to it).
  r.post("/methods/default", async (c) => {
    const userId = caller(c);
    if (!userId) return c.json({ error: "unauthenticated" }, 401);
    const { pmId } = await c.req.json<{ pmId: string }>();
    const out = await call(c, (s) => s.setDefaultMethod(userId, pmId));
    return "error" in out ? c.json(out, 400) : c.json(out);
  });
  // POST /methods/delete { pmId } → detach a saved card (guarded to the caller).
  r.post("/methods/delete", async (c) => {
    const userId = caller(c);
    if (!userId) return c.json({ error: "unauthenticated" }, 401);
    const { pmId } = await c.req.json<{ pmId: string }>();
    const out = await call(c, (s) => s.deleteMethod(userId, pmId));
    return "error" in out ? c.json(out, 400) : c.json(out);
  });

  // ── portal (v1) ──
  // POST /portal { userId, returnUrl } → the Stripe billing-portal URL.
  r.post("/portal", async (c) => {
    const { userId, returnUrl } = await c.req.json<{ userId: string; returnUrl: string }>();
    const portal = await call(c, (s) => s.portal(userId, returnUrl));
    return portal ? c.json(portal) : c.json({ error: "no billing account" }, 404);
  });

  // ── customer + sessions (v1) ──
  // POST /customer { userId, email } → ensure a Stripe customer.
  r.post("/customer", async (c) => {
    const { userId, email } = await c.req.json<{ userId: string; email?: string }>();
    return c.json({ customerId: await call(c, (s) => s.ensureCustomer(userId, email)) });
  });
  // POST /payment-session { userId, amountCents, credits } → a client secret for the Payment Element.
  r.post("/payment-session", async (c) => {
    const { userId, amountCents, credits } = await c.req.json<{ userId: string; amountCents: number; credits: number }>();
    return c.json(await call(c, (s) => s.paymentSession(userId, amountCents, credits)));
  });
  // POST /setup-session { userId } → a client secret to vault a card ("add card").
  r.post("/setup-session", async (c) => {
    const { userId } = await c.req.json<{ userId: string }>();
    return c.json(await call(c, (s) => s.setupSession(userId)));
  });

  // ── auto-topup (owned table) ──
  // GET /auto-topup → the caller's config (defaults when unset).
  r.get("/auto-topup", async (c) => {
    const userId = caller(c);
    if (!userId) return c.json({ error: "unauthenticated" }, 401);
    return c.json(await call(c, (s) => s.getAutoTopup(userId)));
  });
  // POST /auto-topup { enabled, thresholdCredits, topupCredits } → upsert.
  r.post("/auto-topup", async (c) => {
    const userId = caller(c);
    if (!userId) return c.json({ error: "unauthenticated" }, 401);
    const { enabled, thresholdCredits, topupCredits } = await c.req.json<{ enabled: boolean; thresholdCredits: number; topupCredits: number }>();
    const out = await call(c, (s) => s.saveAutoTopup(userId, { enabled, thresholdCredits, topupCredits }));
    return "error" in out ? c.json(out, 400) : c.json(out);
  });

  // ── payment-health (owned table) ──
  // GET /payment-health → the caller's standing payment alerts.
  r.get("/payment-health", async (c) => {
    const userId = caller(c);
    if (!userId) return c.json({ error: "unauthenticated" }, 401);
    return c.json({ alerts: await call(c, (s) => s.paymentHealth(userId)) });
  });

  return r;
}
