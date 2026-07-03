/**
 * Billing routes (Suluk registry: `billing`) — Hono over the {@link Billing} Effect service. Each route is defined with
 * `@suluk/effect`'s `effectRoute`: the handler is an Effect whose ERROR CHANNEL bubbles up into the contract as DETAILED,
 * typed responses (401 UnauthorizedError / 400 ValidationError / 404 NotFoundError / …) instead of a generic
 * ProblemDetails or an ad-hoc `{ error }` body. Each route's `contract` is spread into `./billing.contract` so the
 * doc/Scalar/SDK show those exact error shapes.
 *
 * Mount: `app.route("/api/billing", billingRoutes())` — the paths below are the sub-paths, so the full surface is
 * `/api/billing/*` (toolfactory parity). The crediting WEBHOOK stays in your app.
 *
 * SERVER-AUTHORITATIVE money: the client picks a pack/plan ID, never a price; amounts + credits are derived from
 * `../pricing` inside the service. The caller's userId is the AUTHENTICATED principal the auth `identity` middleware set on
 * the context (`c.get("user")`) — NEVER a body/query/header field, so a caller can only ever move THEIR OWN money.
 */
import { Hono } from "hono";
import { Effect, Layer } from "effect";
import { z } from "zod";
import { effectRoute, UnauthorizedError, ValidationError, NotFoundError } from "@suluk/effect";
import { DbLive, type Bindings } from "../app";
import { Billing, BillingLive, StripeCfg } from "../services/billing";
import { PackSchema, PlanSchema, PaymentMethodSchema } from "./billing.schemas";

type Env = { Bindings: Bindings & { STRIPE_SECRET_KEY: string; STRIPE_PUBLISHABLE_KEY?: string; STRIPE_FETCH?: typeof fetch } };
type Bind = Env["Bindings"];

/** The AUTHENTICATED caller's userId — the principal the auth `identity` middleware stashed as `c.get("user")`. Read off
 *  the variables bag (the app's Variables aren't declared as AppVars here, so cast the read). Never a client-supplied field. */
const caller = (c: { var: { user?: { id?: string } } }): string | null => c.var.user?.id ?? null;

/** Fully-provide a Billing program against the request's DB + Stripe config — the SAME layer stack the old `run` used,
 *  so the Effect's remaining requirements are discharged (`R = never`) before it reaches the effectRoute handler. */
const provide = <A, E>(env: Bind, program: Effect.Effect<A, E, Billing>): Effect.Effect<A, E, never> =>
  program.pipe(
    Effect.provide(BillingLive),
    Effect.provide(Layer.succeed(StripeCfg, { secretKey: env.STRIPE_SECRET_KEY, fetch: env.STRIPE_FETCH })),
    Effect.provide(DbLive(env)),
  );

// ── response body schemas (the CURRENT success shapes, reused from the contract) ──
const PacksBody = z.object({ packs: z.array(PackSchema) });
const PlansBody = z.object({ plans: z.array(PlanSchema) });
const PaymentConfigBody = z.object({ publishableKey: z.string() });
const CheckoutBody = z.object({ url: z.string() });
const PaymentIntentBody = z.object({ clientSecret: z.string().nullable() });
const SubscribeBody = z.union([
  z.object({ clientSecret: z.string(), subscriptionId: z.string() }), // one-click
  z.object({ url: z.string() }), // hosted
]);
const SubscriptionBody = z.object({
  subscription: z
    .object({ planId: z.string().nullable(), status: z.string(), currentPeriodEnd: z.number().int(), cancelAtPeriodEnd: z.boolean() })
    .nullable(),
});
const OkBody = z.object({ ok: z.boolean() });
const ChangePlanBody = z.object({ kind: z.enum(["upgrade", "downgrade"]), clientSecret: z.string().nullable(), currentPeriodEnd: z.number().int() });
const PurchaseQuoteBody = z.object({ credits: z.number().int(), taxCents: z.number().int(), totalCents: z.number().int() });
const RefundQuoteBody = z.object({ credits: z.number().int(), netCents: z.number().int() });
const RefundBody = z.object({ refundedCents: z.number().int() });
const CardsBody = z.object({ cards: z.array(PaymentMethodSchema) });
const MethodsBody = z.object({ methods: z.array(PaymentMethodSchema) });
const CustomerBody = z.object({ customerId: z.string() });
const ClientSecretBody = z.object({ clientSecret: z.string() });
const AutoTopupBody = z.object({ enabled: z.boolean(), thresholdCredits: z.number().int(), topupCredits: z.number().int() });
const PaymentHealthBody = z.object({ alerts: z.array(z.object({ kind: z.string(), message: z.string() })) });

// ── request body/query schemas ──
const CheckoutReq = z.object({ packId: z.string().min(1), successUrl: z.string().url().max(2048), cancelUrl: z.string().url().max(2048) });
const PaymentIntentReq = z.object({ packId: z.string().min(1), onDefaultCard: z.boolean().optional() });
const SubscribeReq = z.object({ planId: z.string().min(1), hosted: z.boolean().optional(), successUrl: z.string().url().max(2048).optional(), cancelUrl: z.string().url().max(2048).optional() });
const CancelSubscriptionReq = z.object({ cancel: z.boolean().optional() });
const ChangePlanReq = z.object({ planId: z.string().min(1) });
const PurchaseQuoteReq = z.object({ amountCents: z.coerce.number().int().positive() });
const RefundQuoteReq = z.object({ credits: z.coerce.number().int().positive() });
const RefundReq = z.object({ credits: z.number().int().positive() });
const PmIdReq = z.object({ pmId: z.string().min(1) });
const PortalReq = z.object({ userId: z.string().min(1), returnUrl: z.string().url().max(2048) });
const CustomerReq = z.object({ userId: z.string().min(1), email: z.string().email().optional() });
const PaymentSessionReq = z.object({ userId: z.string().min(1), amountCents: z.number().int().positive(), credits: z.number().int().positive() });
const SetupSessionReq = z.object({ userId: z.string().min(1) });
const AutoTopupReq = z.object({ enabled: z.boolean(), thresholdCredits: z.number().int(), topupCredits: z.number().int() });

// Standard cost blocks (preserved from the current contract).
const COST_READ_LIGHT = { components: [], infra: { "worker.request": 1 }, settlement: { method: "rate-limited" as const } };
const COST_READ_1 = { components: [], infra: { "worker.request": 1, "d1.read": 1 }, settlement: { method: "rate-limited" as const } };
const COST_READ_20 = { components: [], infra: { "worker.request": 1, "d1.read": 20 }, settlement: { method: "rate-limited" as const } };
const COST_WRITE = { components: [], infra: { "worker.request": 1, "d1.write": 1, "d1.read": 1 }, settlement: { method: "rate-limited" as const } };
const COST_CHARGE = { components: [], infra: { "worker.request": 1, "d1.write": 1, "d1.read": 1, "stripe.charge": 1 }, settlement: { method: "rate-limited" as const } };

// ══════════════════════════════════════════════════════════════════════════════════════════
// pricing (public reads) — no auth, no typed error paths.
// ══════════════════════════════════════════════════════════════════════════════════════════

export const getPacksRoute = effectRoute({
  method: "get", path: "/api/billing/packs", name: "getPacks",
  summary: "Available credit packs (server-authoritative pricing). Public — the frontend reads it pre-sign-in.",
  tags: ["Billing"], cost: COST_READ_20,
  rateLimit: { windowMs: 60_000, maxRequests: 60, key: "ip" }, // PUBLIC pricing catalog (read pre-sign-in) → IP-keyed abuse cap
  ok: { status: 200, schema: PacksBody },
  errors: [],
  run: (c) => Effect.gen(function* () {
    const s = yield* Billing;
    return { packs: yield* s.packs() };
  }).pipe((p) => provide(c.env, p)),
});

export const getPlansRoute = effectRoute({
  method: "get", path: "/api/billing/plans", name: "getPlans",
  summary: "Available subscription plans (server-authoritative pricing). Public — the frontend reads it pre-sign-in.",
  tags: ["Billing"], cost: COST_READ_20,
  rateLimit: { windowMs: 60_000, maxRequests: 60, key: "ip" }, // PUBLIC pricing catalog (read pre-sign-in) → IP-keyed abuse cap
  ok: { status: 200, schema: PlansBody },
  errors: [],
  run: (c) => Effect.gen(function* () {
    const s = yield* Billing;
    return { plans: yield* s.plans() };
  }).pipe((p) => provide(c.env, p)),
});

export const getPaymentConfigRoute = effectRoute({
  method: "get", path: "/api/billing/payment-config", name: "getPaymentConfig",
  summary: "The publishable payment config (publishable key + enabled methods) for the client SDK.",
  tags: ["Billing"], scopes: ["billing:read"], cost: COST_READ_LIGHT,
  rateLimit: { windowMs: 60_000, maxRequests: 60, key: "ip" }, // non-secret publishable key → IP-keyed abuse cap
  ok: { status: 200, schema: PaymentConfigBody },
  errors: [],
  run: (c) => Effect.succeed({ publishableKey: (c.env as Bind).STRIPE_PUBLISHABLE_KEY ?? "" }),
});

// ══════════════════════════════════════════════════════════════════════════════════════════
// top-up: hosted Checkout + on-site PaymentIntent
// ══════════════════════════════════════════════════════════════════════════════════════════

// POST /checkout — an ACTION returning a hosted session URL → 200 (not a 201 creation).
export const checkoutRoute = effectRoute({
  method: "post", path: "/api/billing/checkout", name: "checkout",
  summary: "Start a Stripe checkout / payment session for a credit top-up; returns the client secret or hosted URL.",
  tags: ["Billing"], scopes: ["billing:write"], cost: COST_CHARGE,
  rateLimit: { windowMs: 60_000, maxRequests: 20, key: "principal" },
  request: { json: CheckoutReq },
  ok: { status: 200, schema: CheckoutBody },
  errors: [UnauthorizedError],
  run: (c) => Effect.gen(function* () {
    const userId = caller(c);
    if (!userId) return yield* new UnauthorizedError({ reason: "authentication required" });
    const { packId, successUrl, cancelUrl } = yield* Effect.promise(() => c.req.json<{ packId: string; successUrl: string; cancelUrl: string }>());
    const s = yield* Billing;
    return yield* s.checkout(userId, packId, successUrl, cancelUrl);
  }).pipe((p) => provide(c.env, p)),
});

// POST /payment-intent — on-site top-up; one-click when onDefaultCard → { clientSecret } (null when no default card).
export const createPaymentIntentRoute = effectRoute({
  method: "post", path: "/api/billing/payment-intent", name: "createPaymentIntent",
  summary: "Create a payment intent for a client-confirmed top-up; returns the client secret.",
  tags: ["Billing"], scopes: ["billing:write"], cost: COST_CHARGE,
  rateLimit: { windowMs: 60_000, maxRequests: 20, key: "principal" },
  request: { json: PaymentIntentReq },
  ok: { status: 200, schema: PaymentIntentBody }, // null when one-click has no default card
  errors: [UnauthorizedError],
  run: (c) => Effect.gen(function* () {
    const userId = caller(c);
    if (!userId) return yield* new UnauthorizedError({ reason: "authentication required" });
    const { packId, onDefaultCard } = yield* Effect.promise(() => c.req.json<{ packId: string; onDefaultCard?: boolean }>());
    const s = yield* Billing;
    return yield* s.paymentIntent(userId, packId, onDefaultCard ?? false);
  }).pipe((p) => provide(c.env, p)),
});

// ══════════════════════════════════════════════════════════════════════════════════════════
// subscriptions
// ══════════════════════════════════════════════════════════════════════════════════════════

// POST /subscribe — an ACTION returning a session/url → 200. The service's `{ error }` failures become a typed 400.
export const subscribeRoute = effectRoute({
  method: "post", path: "/api/billing/subscribe", name: "subscribe",
  summary: "Start a subscription for a plan — one-click (client secret + subscription id) or hosted (checkout URL).",
  tags: ["Billing"], scopes: ["billing:write"], cost: COST_CHARGE,
  rateLimit: { windowMs: 60_000, maxRequests: 20, key: "principal" },
  request: { json: SubscribeReq },
  ok: { status: 200, schema: SubscribeBody },
  errors: [UnauthorizedError, ValidationError],
  run: (c) => Effect.gen(function* () {
    const userId = caller(c);
    if (!userId) return yield* new UnauthorizedError({ reason: "authentication required" });
    const { planId, hosted, successUrl, cancelUrl } = yield* Effect.promise(() => c.req.json<{ planId: string; hosted?: boolean; successUrl?: string; cancelUrl?: string }>());
    const s = yield* Billing;
    const out = yield* s.subscribe(userId, planId, hosted ?? false, successUrl ?? "", cancelUrl ?? "");
    if ("error" in out) return yield* new ValidationError({ issues: [out.error] });
    return out as z.infer<typeof SubscribeBody>;
  }).pipe((p) => provide(c.env, p)),
});

// GET /subscription — live status for the caller's subscription, or null.
export const getSubscriptionRoute = effectRoute({
  method: "get", path: "/api/billing/subscription", name: "getSubscription",
  summary: "The caller's current subscription (plan, status, period end, cancel-at-period-end).",
  tags: ["Billing"], scopes: ["billing:read"], cost: COST_READ_1,
  rateLimit: { windowMs: 60_000, maxRequests: 60, key: "principal" },
  ok: { status: 200, schema: SubscriptionBody },
  errors: [UnauthorizedError],
  run: (c) => Effect.gen(function* () {
    const userId = caller(c);
    if (!userId) return yield* new UnauthorizedError({ reason: "authentication required" });
    const s = yield* Billing;
    const subscription = yield* s.subscriptionStatus(userId);
    return { subscription };
  }).pipe((p) => provide(c.env, p)),
});

// POST /subscription — schedule cancel/resume. A missing subscription (`!out.ok`) → typed 404.
export const cancelSubscriptionRoute = effectRoute({
  method: "post", path: "/api/billing/subscription", name: "cancelSubscription",
  summary: "Cancel (or schedule cancellation of) the caller's subscription.",
  tags: ["Billing"], scopes: ["billing:write"], cost: COST_WRITE,
  rateLimit: { windowMs: 60_000, maxRequests: 20, key: "principal" },
  request: { json: CancelSubscriptionReq }, // defaults true when body absent/unparseable
  ok: { status: 200, schema: OkBody },
  errors: [UnauthorizedError, NotFoundError],
  run: (c) => Effect.gen(function* () {
    const userId = caller(c);
    if (!userId) return yield* new UnauthorizedError({ reason: "authentication required" });
    const body = yield* Effect.promise(() => c.req.json<{ cancel?: boolean }>().catch(() => ({ cancel: true })));
    const s = yield* Billing;
    const out = yield* s.cancelSubscription(userId, body.cancel ?? true);
    if (!out.ok) return yield* new NotFoundError({ resource: "subscription" });
    return out;
  }).pipe((p) => provide(c.env, p)),
});

// POST /subscription-plan — change plan. The service's `{ error }` failures become a typed 400.
export const changeSubscriptionPlanRoute = effectRoute({
  method: "post", path: "/api/billing/subscription-plan", name: "changeSubscriptionPlan",
  summary: "Switch the caller's subscription to a different plan (prorated).",
  tags: ["Billing"], scopes: ["billing:write"], cost: COST_CHARGE,
  rateLimit: { windowMs: 60_000, maxRequests: 20, key: "principal" },
  request: { json: ChangePlanReq },
  ok: { status: 200, schema: ChangePlanBody },
  errors: [UnauthorizedError, ValidationError],
  run: (c) => Effect.gen(function* () {
    const userId = caller(c);
    if (!userId) return yield* new UnauthorizedError({ reason: "authentication required" });
    const { planId } = yield* Effect.promise(() => c.req.json<{ planId: string }>());
    const s = yield* Billing;
    const out = yield* s.changePlan(userId, planId);
    if ("error" in out) return yield* new ValidationError({ issues: [out.error] });
    return out;
  }).pipe((p) => provide(c.env, p)),
});

// ══════════════════════════════════════════════════════════════════════════════════════════
// quotes
// ══════════════════════════════════════════════════════════════════════════════════════════

// GET /purchase-quote?amountCents=… → { credits, taxCents, totalCents }. Bad amount → typed 400.
export const getPurchaseQuoteRoute = effectRoute({
  method: "get", path: "/api/billing/purchase-quote", name: "getPurchaseQuote",
  summary: "A server-authoritative quote (tax + total) for a credit-pack purchase before checkout.",
  tags: ["Billing"], scopes: ["billing:read"], cost: COST_READ_LIGHT,
  rateLimit: { windowMs: 60_000, maxRequests: 30, key: "principal" },
  request: { query: PurchaseQuoteReq },
  ok: { status: 200, schema: PurchaseQuoteBody },
  errors: [UnauthorizedError, ValidationError],
  run: (c) => Effect.gen(function* () {
    const userId = caller(c);
    if (!userId) return yield* new UnauthorizedError({ reason: "authentication required" });
    const amountCents = Number(c.req.query("amountCents") ?? 0);
    if (!Number.isFinite(amountCents) || amountCents <= 0) return yield* new ValidationError({ issues: ["amountCents must be a positive integer"] });
    const ip = c.req.header("cf-connecting-ip") ?? null;
    const s = yield* Billing;
    const quote = yield* s.purchaseQuote(userId, amountCents, ip);
    return { credits: quote.credits, taxCents: quote.taxCents, totalCents: quote.totalCents };
  }).pipe((p) => provide(c.env, p)),
});

// GET /refund-quote?credits=… → { credits, netCents }. Bad credits → typed 400. No auth (matches current code).
export const getRefundQuoteRoute = effectRoute({
  method: "get", path: "/api/billing/refund-quote", name: "getRefundQuote",
  summary: "How much of a purchase is refundable (credits already spent are deducted).",
  tags: ["Billing"], scopes: ["billing:read"], cost: COST_READ_LIGHT,
  rateLimit: { windowMs: 60_000, maxRequests: 30, key: "principal" },
  request: { query: RefundQuoteReq },
  ok: { status: 200, schema: RefundQuoteBody },
  errors: [ValidationError],
  run: (c) => Effect.gen(function* () {
    const credits = Number(c.req.query("credits") ?? 0);
    if (!Number.isInteger(credits) || credits <= 0) return yield* new ValidationError({ issues: ["credits must be a positive integer"] });
    const s = yield* Billing;
    return yield* s.refundQuote(credits);
  }).pipe((p) => provide(c.env, p)),
});

// ══════════════════════════════════════════════════════════════════════════════════════════
// refund (module-owned)
// ══════════════════════════════════════════════════════════════════════════════════════════

// POST /refund { credits } → { refundedCents }. Service `{ error }` failures: "no billing account" → 404, else 400.
export const refundRoute = effectRoute({
  method: "post", path: "/api/billing/refund", name: "refund",
  summary: "Refund a purchase — DEBITS the granted credits before moving cash (partial-capped; re-credits any shortfall).",
  tags: ["Billing"], scopes: ["billing:write"], cost: COST_CHARGE,
  rateLimit: { windowMs: 60_000, maxRequests: 10, key: "principal" },
  request: { json: RefundReq },
  ok: { status: 200, schema: RefundBody },
  errors: [UnauthorizedError, ValidationError, NotFoundError],
  run: (c) => Effect.gen(function* () {
    const userId = caller(c);
    if (!userId) return yield* new UnauthorizedError({ reason: "authentication required" });
    const { credits } = yield* Effect.promise(() => c.req.json<{ credits: number }>());
    const s = yield* Billing;
    const out = yield* s.refund(userId, credits);
    if ("error" in out) {
      if (out.error === "no billing account") return yield* new NotFoundError({ resource: "billing account" });
      return yield* new ValidationError({ issues: [out.error] });
    }
    return out;
  }).pipe((p) => provide(c.env, p)),
});

// ══════════════════════════════════════════════════════════════════════════════════════════
// cards / methods
// ══════════════════════════════════════════════════════════════════════════════════════════

// GET /cards/:userId → the saved cards (back-compat; no auth guard in the current code).
export const listCardsRoute = effectRoute({
  method: "get", path: "/api/billing/cards/:userId", name: "listCards",
  summary: "A user's saved cards (each with its billing address); empty until they have a Stripe customer.",
  tags: ["Billing"], scopes: ["billing:read"], cost: COST_READ_20,
  rateLimit: { windowMs: 60_000, maxRequests: 60, key: "principal" },
  ok: { status: 200, schema: CardsBody },
  errors: [],
  run: (c) => Effect.gen(function* () {
    const s = yield* Billing;
    return { cards: yield* s.cards(c.req.param("userId")!) }; // :userId is a required path param — always present
  }).pipe((p) => provide(c.env, p)),
});

// GET /methods → the caller's saved cards.
export const listMethodsRoute = effectRoute({
  method: "get", path: "/api/billing/methods", name: "listMethods",
  summary: "The caller's saved payment methods (cards), the default flagged.",
  tags: ["Billing"], scopes: ["billing:read"], cost: COST_READ_20,
  rateLimit: { windowMs: 60_000, maxRequests: 60, key: "principal" },
  ok: { status: 200, schema: MethodsBody },
  errors: [UnauthorizedError],
  run: (c) => Effect.gen(function* () {
    const userId = caller(c);
    if (!userId) return yield* new UnauthorizedError({ reason: "authentication required" });
    const s = yield* Billing;
    return { methods: yield* s.cards(userId) };
  }).pipe((p) => provide(c.env, p)),
});

// POST /methods/default { pmId } → set the invoice default. "no billing account"/"card not found" → typed 404, else 400.
export const setDefaultMethodRoute = effectRoute({
  method: "post", path: "/api/billing/methods/default", name: "setDefaultMethod",
  summary: "Set a saved card as the default for off-session charges.",
  tags: ["Billing"], scopes: ["billing:write"], cost: COST_WRITE,
  rateLimit: { windowMs: 60_000, maxRequests: 30, key: "principal" },
  request: { json: PmIdReq },
  ok: { status: 200, schema: OkBody },
  errors: [UnauthorizedError, ValidationError, NotFoundError],
  run: (c) => Effect.gen(function* () {
    const userId = caller(c);
    if (!userId) return yield* new UnauthorizedError({ reason: "authentication required" });
    const { pmId } = yield* Effect.promise(() => c.req.json<{ pmId: string }>());
    const s = yield* Billing;
    const out = yield* s.setDefaultMethod(userId, pmId);
    if ("error" in out) {
      if (out.error === "no billing account") return yield* new NotFoundError({ resource: "billing account" });
      if (out.error === "card not found") return yield* new NotFoundError({ resource: "card" });
      return yield* new ValidationError({ issues: [out.error] });
    }
    return out;
  }).pipe((p) => provide(c.env, p)),
});

// POST /methods/delete { pmId } → detach a saved card. "no billing account"/"card not found" → typed 404, else 400.
export const deleteMethodRoute = effectRoute({
  method: "post", path: "/api/billing/methods/delete", name: "deleteMethod",
  summary: "Detach a saved card from the caller's Stripe customer.",
  tags: ["Billing"], scopes: ["billing:write"],
  cost: { components: [], infra: { "worker.request": 1, "d1.write": 1 }, settlement: { method: "rate-limited" } },
  rateLimit: { windowMs: 60_000, maxRequests: 30, key: "principal" },
  request: { json: PmIdReq },
  ok: { status: 200, schema: OkBody },
  errors: [UnauthorizedError, ValidationError, NotFoundError],
  run: (c) => Effect.gen(function* () {
    const userId = caller(c);
    if (!userId) return yield* new UnauthorizedError({ reason: "authentication required" });
    const { pmId } = yield* Effect.promise(() => c.req.json<{ pmId: string }>());
    const s = yield* Billing;
    const out = yield* s.deleteMethod(userId, pmId);
    if ("error" in out) {
      if (out.error === "no billing account") return yield* new NotFoundError({ resource: "billing account" });
      if (out.error === "card not found") return yield* new NotFoundError({ resource: "card" });
      return yield* new ValidationError({ issues: [out.error] });
    }
    return out;
  }).pipe((p) => provide(c.env, p)),
});

// ══════════════════════════════════════════════════════════════════════════════════════════
// portal (v1)
// ══════════════════════════════════════════════════════════════════════════════════════════

// POST /portal { userId, returnUrl } → the Stripe billing-portal URL. A null (no customer) → typed 404.
export const billingPortalRoute = effectRoute({
  method: "post", path: "/api/billing/portal", name: "billingPortal",
  summary: "Open the Stripe billing portal to manage/cancel a subscription. Returns the portal URL.",
  tags: ["Billing"], scopes: ["billing:write"], cost: COST_READ_LIGHT,
  rateLimit: { windowMs: 60_000, maxRequests: 20, key: "principal" },
  request: { json: PortalReq },
  ok: { status: 200, schema: CheckoutBody },
  errors: [NotFoundError],
  run: (c) => Effect.gen(function* () {
    const { userId, returnUrl } = yield* Effect.promise(() => c.req.json<{ userId: string; returnUrl: string }>());
    const s = yield* Billing;
    const portal = yield* s.portal(userId, returnUrl);
    if (!portal) return yield* new NotFoundError({ resource: "billing account" });
    return portal;
  }).pipe((p) => provide(c.env, p)),
});

// ══════════════════════════════════════════════════════════════════════════════════════════
// customer + sessions (v1)
// ══════════════════════════════════════════════════════════════════════════════════════════

// POST /customer { userId, email } → ensure a Stripe customer.
export const ensureCustomerRoute = effectRoute({
  method: "post", path: "/api/billing/customer", name: "ensureCustomer",
  summary: "Ensure the caller has a Stripe customer (idempotent) — used before saving a card.",
  tags: ["Billing"], scopes: ["billing:write"], cost: COST_WRITE,
  rateLimit: { windowMs: 60_000, maxRequests: 30, key: "principal" },
  request: { json: CustomerReq },
  ok: { status: 200, schema: CustomerBody },
  errors: [],
  run: (c) => Effect.gen(function* () {
    const { userId, email } = yield* Effect.promise(() => c.req.json<{ userId: string; email?: string }>());
    const s = yield* Billing;
    return { customerId: yield* s.ensureCustomer(userId, email) };
  }).pipe((p) => provide(c.env, p)),
});

// POST /payment-session { userId, amountCents, credits } → a client secret for the Payment Element.
export const createPaymentSessionRoute = effectRoute({
  method: "post", path: "/api/billing/payment-session", name: "createPaymentSession",
  summary: "Create a client payment session (Element auto-PM or one-click on the default card).",
  tags: ["Billing"], scopes: ["billing:write"], cost: COST_CHARGE,
  rateLimit: { windowMs: 60_000, maxRequests: 20, key: "principal" },
  request: { json: PaymentSessionReq },
  ok: { status: 200, schema: ClientSecretBody },
  errors: [],
  run: (c) => Effect.gen(function* () {
    const { userId, amountCents, credits } = yield* Effect.promise(() => c.req.json<{ userId: string; amountCents: number; credits: number }>());
    const s = yield* Billing;
    return yield* s.paymentSession(userId, amountCents, credits);
  }).pipe((p) => provide(c.env, p)),
});

// POST /setup-session { userId } → a client secret to vault a card ("add card").
export const createSetupSessionRoute = effectRoute({
  method: "post", path: "/api/billing/setup-session", name: "createSetupSession",
  summary: "Create a setup session to save a card off-session (no charge).",
  tags: ["Billing"], scopes: ["billing:write"], cost: COST_WRITE,
  rateLimit: { windowMs: 60_000, maxRequests: 20, key: "principal" },
  request: { json: SetupSessionReq },
  ok: { status: 200, schema: ClientSecretBody },
  errors: [],
  run: (c) => Effect.gen(function* () {
    const { userId } = yield* Effect.promise(() => c.req.json<{ userId: string }>());
    const s = yield* Billing;
    return yield* s.setupSession(userId);
  }).pipe((p) => provide(c.env, p)),
});

// ══════════════════════════════════════════════════════════════════════════════════════════
// auto-topup (owned table)
// ══════════════════════════════════════════════════════════════════════════════════════════

// GET /auto-topup → the caller's config (defaults when unset).
export const getAutoTopupRoute = effectRoute({
  method: "get", path: "/api/billing/auto-topup", name: "getAutoTopup",
  summary: "The caller's auto-recharge config (threshold + pack, or disabled).",
  tags: ["Billing"], scopes: ["billing:read"], cost: COST_READ_1,
  rateLimit: { windowMs: 60_000, maxRequests: 30, key: "principal" },
  ok: { status: 200, schema: AutoTopupBody },
  errors: [UnauthorizedError],
  run: (c) => Effect.gen(function* () {
    const userId = caller(c);
    if (!userId) return yield* new UnauthorizedError({ reason: "authentication required" });
    const s = yield* Billing;
    return yield* s.getAutoTopup(userId);
  }).pipe((p) => provide(c.env, p)),
});

// POST /auto-topup { enabled, thresholdCredits, topupCredits } → upsert. Service `{ error }` → typed 400.
export const setAutoTopupRoute = effectRoute({
  method: "post", path: "/api/billing/auto-topup", name: "setAutoTopup",
  summary: "Enable/update/disable auto-recharge (top up when the balance falls below a threshold).",
  tags: ["Billing"], scopes: ["billing:write"], cost: COST_WRITE,
  rateLimit: { windowMs: 60_000, maxRequests: 30, key: "principal" },
  request: { json: AutoTopupReq },
  ok: { status: 200, schema: OkBody },
  errors: [UnauthorizedError, ValidationError],
  run: (c) => Effect.gen(function* () {
    const userId = caller(c);
    if (!userId) return yield* new UnauthorizedError({ reason: "authentication required" });
    const { enabled, thresholdCredits, topupCredits } = yield* Effect.promise(() => c.req.json<{ enabled: boolean; thresholdCredits: number; topupCredits: number }>());
    const s = yield* Billing;
    const out = yield* s.saveAutoTopup(userId, { enabled, thresholdCredits, topupCredits });
    if ("error" in out) return yield* new ValidationError({ issues: [out.error] });
    return out;
  }).pipe((p) => provide(c.env, p)),
});

// ══════════════════════════════════════════════════════════════════════════════════════════
// payment-health (owned table)
// ══════════════════════════════════════════════════════════════════════════════════════════

// GET /payment-health → the caller's standing payment alerts.
export const getPaymentHealthRoute = effectRoute({
  method: "get", path: "/api/billing/payment-health", name: "getPaymentHealth",
  summary: "Standing payment-health flags for the caller (failed charges, expiring cards, dunning).",
  tags: ["Billing"], scopes: ["billing:read"], cost: COST_READ_1,
  rateLimit: { windowMs: 60_000, maxRequests: 60, key: "principal" },
  ok: { status: 200, schema: PaymentHealthBody },
  errors: [UnauthorizedError],
  run: (c) => Effect.gen(function* () {
    const userId = caller(c);
    if (!userId) return yield* new UnauthorizedError({ reason: "authentication required" });
    const s = yield* Billing;
    const alerts = yield* s.paymentHealth(userId);
    return { alerts: alerts.map((a) => ({ kind: a.kind, message: a.detail ?? "" })) };
  }).pipe((p) => provide(c.env, p)),
});

/**
 * Mount every route's Effect handler at its sub-path. Each handler runs its fully-provided Effect, renders the success at
 * its declared status, and maps any typed failure to its status + typed body (never a generic ProblemDetails).
 */
export function billingRoutes() {
  const r = new Hono<Env>();

  // ── pricing (public) ──
  r.get("/packs", getPacksRoute.handler);
  r.get("/plans", getPlansRoute.handler);
  r.get("/payment-config", getPaymentConfigRoute.handler);

  // ── top-up ──
  r.post("/checkout", checkoutRoute.handler);
  r.post("/payment-intent", createPaymentIntentRoute.handler);

  // ── subscriptions ──
  r.post("/subscribe", subscribeRoute.handler);
  r.get("/subscription", getSubscriptionRoute.handler);
  r.post("/subscription", cancelSubscriptionRoute.handler);
  r.post("/subscription-plan", changeSubscriptionPlanRoute.handler);

  // ── quotes ──
  r.get("/purchase-quote", getPurchaseQuoteRoute.handler);
  r.get("/refund-quote", getRefundQuoteRoute.handler);

  // ── refund ──
  r.post("/refund", refundRoute.handler);

  // ── cards / methods ──
  r.get("/cards/:userId", listCardsRoute.handler);
  r.get("/methods", listMethodsRoute.handler);
  r.post("/methods/default", setDefaultMethodRoute.handler);
  r.post("/methods/delete", deleteMethodRoute.handler);

  // ── portal ──
  r.post("/portal", billingPortalRoute.handler);

  // ── customer + sessions ──
  r.post("/customer", ensureCustomerRoute.handler);
  r.post("/payment-session", createPaymentSessionRoute.handler);
  r.post("/setup-session", createSetupSessionRoute.handler);

  // ── auto-topup ──
  r.get("/auto-topup", getAutoTopupRoute.handler);
  r.post("/auto-topup", setAutoTopupRoute.handler);

  // ── payment-health ──
  r.get("/payment-health", getPaymentHealthRoute.handler);

  return r;
}
