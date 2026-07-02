/** The `billing` module's CONTRACT fragment — the full `/api/billing/*` surface. Composed via `src/contract.ops.ts`
 *  (own your ops next to your routes; scopes: read for GET, write for POST). */
import { z } from "zod";
import type { RouteContract } from "@suluk/hono";

/** A Stripe payment method (card + its billing address) as the billing panel shows it — the shape `s.cards()` returns. */
const PaymentMethodSchema = z.object({
  id: z.string(),
  brand: z.string(),
  last4: z.string(),
  expMonth: z.number().int(),
  expYear: z.number().int(),
  name: z.string().nullable(),
  line1: z.string().nullable(),
  line2: z.string().nullable(),
  city: z.string().nullable(),
  region: z.string().nullable(),
  postalCode: z.string().nullable(),
  country: z.string().nullable(),
  isDefault: z.boolean(),
});

/** A credit pack in the server-authoritative pricing catalog. */
const PackSchema = z.object({ id: z.string(), credits: z.number().int(), priceCents: z.number().int(), label: z.string() });
/** A subscription plan in the server-authoritative pricing catalog. */
const PlanSchema = z.object({ id: z.string(), name: z.string(), credits: z.number().int(), priceCents: z.number().int(), label: z.string() });

export const billingOps = [
  {
    method: "get", path: "/api/billing/packs", name: "getPacks",
    summary: "Available credit packs (server-authoritative pricing). Public — the frontend reads it pre-sign-in.",
    tags: ["Billing"],
    rateLimit: { windowMs: 60_000, maxRequests: 60, key: "ip" }, // PUBLIC pricing catalog (read pre-sign-in) → IP-keyed abuse cap
    responses: [{ status: 200, schema: z.object({ packs: z.array(PackSchema) }) }],
  },
  {
    method: "get", path: "/api/billing/plans", name: "getPlans",
    summary: "Available subscription plans (server-authoritative pricing). Public — the frontend reads it pre-sign-in.",
    tags: ["Billing"],
    rateLimit: { windowMs: 60_000, maxRequests: 60, key: "ip" }, // PUBLIC pricing catalog (read pre-sign-in) → IP-keyed abuse cap
    responses: [{ status: 200, schema: z.object({ plans: z.array(PlanSchema) }) }],
  },
  {
    method: "get", path: "/api/billing/payment-config", name: "getPaymentConfig",
    summary: "The publishable payment config (publishable key + enabled methods) for the client SDK.",
    tags: ["Billing"], scopes: ["billing:read"],
    rateLimit: { windowMs: 60_000, maxRequests: 60, key: "ip" }, // non-secret publishable key → IP-keyed abuse cap
    responses: [{ status: 200, schema: z.object({ publishableKey: z.string() }) }],
  },
  {
    method: "post", path: "/api/billing/checkout", name: "checkout",
    summary: "Start a Stripe checkout / payment session for a credit top-up; returns the client secret or hosted URL.",
    tags: ["Billing"], scopes: ["billing:write"], errors: [401],
    rateLimit: { windowMs: 60_000, maxRequests: 20, key: "principal" },
    request: { json: z.object({ packId: z.string().min(1), successUrl: z.string().url().max(2048), cancelUrl: z.string().url().max(2048) }) },
    responses: [{ status: 200, schema: z.object({ url: z.string() }) }],
  },
  {
    method: "post", path: "/api/billing/payment-intent", name: "createPaymentIntent",
    summary: "Create a payment intent for a client-confirmed top-up; returns the client secret.",
    tags: ["Billing"], scopes: ["billing:write"], errors: [401],
    rateLimit: { windowMs: 60_000, maxRequests: 20, key: "principal" },
    request: { json: z.object({ packId: z.string().min(1), onDefaultCard: z.boolean().optional() }) },
    responses: [{ status: 200, schema: z.object({ clientSecret: z.string().nullable() }) }], // null when one-click has no default card
  },
  {
    method: "post", path: "/api/billing/subscribe", name: "subscribe",
    summary: "Start a subscription for a plan — one-click (client secret + subscription id) or hosted (checkout URL).",
    tags: ["Billing"], scopes: ["billing:write"], errors: [400, 401],
    rateLimit: { windowMs: 60_000, maxRequests: 20, key: "principal" },
    request: { json: z.object({ planId: z.string().min(1), hosted: z.boolean().optional(), successUrl: z.string().url().max(2048).optional(), cancelUrl: z.string().url().max(2048).optional() }) },
    responses: [
      {
        status: 200,
        schema: z.union([
          z.object({ clientSecret: z.string(), subscriptionId: z.string() }), // one-click
          z.object({ url: z.string() }), // hosted
        ]),
      },
    ],
  },
  {
    method: "get", path: "/api/billing/subscription", name: "getSubscription",
    summary: "The caller's current subscription (plan, status, period end, cancel-at-period-end).",
    tags: ["Billing"], scopes: ["billing:read"], errors: [401],
    rateLimit: { windowMs: 60_000, maxRequests: 60, key: "principal" },
    responses: [
      {
        status: 200,
        schema: z.object({
          subscription: z
            .object({
              planId: z.string().nullable(),
              status: z.string(),
              currentPeriodEnd: z.number().int(),
              cancelAtPeriodEnd: z.boolean(),
            })
            .nullable(),
        }),
      },
    ],
  },
  {
    method: "post", path: "/api/billing/subscription", name: "cancelSubscription",
    summary: "Cancel (or schedule cancellation of) the caller's subscription.",
    tags: ["Billing"], scopes: ["billing:write"], errors: [401, 404],
    rateLimit: { windowMs: 60_000, maxRequests: 20, key: "principal" },
    request: { json: z.object({ cancel: z.boolean().optional() }) }, // defaults true when body absent/unparseable
    responses: [{ status: 200, schema: z.object({ ok: z.boolean() }) }],
  },
  {
    method: "post", path: "/api/billing/subscription-plan", name: "changeSubscriptionPlan",
    summary: "Switch the caller's subscription to a different plan (prorated).",
    tags: ["Billing"], scopes: ["billing:write"], errors: [400, 401],
    rateLimit: { windowMs: 60_000, maxRequests: 20, key: "principal" },
    request: { json: z.object({ planId: z.string().min(1) }) },
    responses: [
      {
        status: 200,
        schema: z.object({
          kind: z.enum(["upgrade", "downgrade"]),
          clientSecret: z.string().nullable(),
          currentPeriodEnd: z.number().int(),
        }),
      },
    ],
  },
  {
    method: "get", path: "/api/billing/purchase-quote", name: "getPurchaseQuote",
    summary: "A server-authoritative quote (tax + total) for a credit-pack purchase before checkout.",
    tags: ["Billing"], scopes: ["billing:read"], errors: [400, 401],
    rateLimit: { windowMs: 60_000, maxRequests: 30, key: "principal" },
    request: { query: z.object({ amountCents: z.coerce.number().int().positive() }) },
    responses: [
      {
        status: 200,
        schema: z.object({ credits: z.number().int(), taxCents: z.number().int(), totalCents: z.number().int() }),
      },
    ],
  },
  {
    method: "get", path: "/api/billing/refund-quote", name: "getRefundQuote",
    summary: "How much of a purchase is refundable (credits already spent are deducted).",
    tags: ["Billing"], scopes: ["billing:read"], errors: [400],
    rateLimit: { windowMs: 60_000, maxRequests: 30, key: "principal" },
    request: { query: z.object({ credits: z.coerce.number().int().positive() }) },
    responses: [{ status: 200, schema: z.object({ credits: z.number().int(), netCents: z.number().int() }) }],
  },
  {
    method: "post", path: "/api/billing/refund", name: "refund",
    summary: "Refund a purchase — DEBITS the granted credits before moving cash (partial-capped; re-credits any shortfall).",
    tags: ["Billing"], scopes: ["billing:write"], errors: [400, 401],
    rateLimit: { windowMs: 60_000, maxRequests: 10, key: "principal" },
    request: { json: z.object({ credits: z.number().int().positive() }) },
    responses: [{ status: 200, schema: z.object({ refundedCents: z.number().int() }) }],
  },
  {
    method: "get", path: "/api/billing/cards/:userId", name: "listCards",
    summary: "A user's saved cards (each with its billing address); empty until they have a Stripe customer.",
    tags: ["Billing"], scopes: ["billing:read"],
    rateLimit: { windowMs: 60_000, maxRequests: 60, key: "principal" },
    responses: [{ status: 200, schema: z.object({ cards: z.array(PaymentMethodSchema) }) }],
  },
  {
    method: "get", path: "/api/billing/methods", name: "listMethods",
    summary: "The caller's saved payment methods (cards), the default flagged.",
    tags: ["Billing"], scopes: ["billing:read"], errors: [401],
    rateLimit: { windowMs: 60_000, maxRequests: 60, key: "principal" },
    responses: [{ status: 200, schema: z.object({ methods: z.array(PaymentMethodSchema) }) }],
  },
  {
    method: "post", path: "/api/billing/methods/default", name: "setDefaultMethod",
    summary: "Set a saved card as the default for off-session charges.",
    tags: ["Billing"], scopes: ["billing:write"], errors: [400, 401],
    rateLimit: { windowMs: 60_000, maxRequests: 30, key: "principal" },
    request: { json: z.object({ pmId: z.string().min(1) }) },
    responses: [{ status: 200, schema: z.object({ ok: z.boolean() }) }],
  },
  {
    method: "post", path: "/api/billing/methods/delete", name: "deleteMethod",
    summary: "Detach a saved card from the caller's Stripe customer.",
    tags: ["Billing"], scopes: ["billing:write"], errors: [400, 401],
    rateLimit: { windowMs: 60_000, maxRequests: 30, key: "principal" },
    request: { json: z.object({ pmId: z.string().min(1) }) },
    responses: [{ status: 200, schema: z.object({ ok: z.boolean() }) }],
  },
  {
    method: "post", path: "/api/billing/portal", name: "billingPortal",
    summary: "Open the Stripe billing portal to manage/cancel a subscription. Returns the portal URL.",
    tags: ["Billing"], scopes: ["billing:write"], errors: [404],
    rateLimit: { windowMs: 60_000, maxRequests: 20, key: "principal" },
    request: { json: z.object({ userId: z.string().min(1), returnUrl: z.string().url().max(2048) }) },
    responses: [{ status: 200, schema: z.object({ url: z.string() }) }],
  },
  {
    method: "post", path: "/api/billing/customer", name: "ensureCustomer",
    summary: "Ensure the caller has a Stripe customer (idempotent) — used before saving a card.",
    tags: ["Billing"], scopes: ["billing:write"],
    rateLimit: { windowMs: 60_000, maxRequests: 30, key: "principal" },
    request: { json: z.object({ userId: z.string().min(1), email: z.string().email().optional() }) },
    responses: [{ status: 200, schema: z.object({ customerId: z.string() }) }],
  },
  {
    method: "post", path: "/api/billing/payment-session", name: "createPaymentSession",
    summary: "Create a client payment session (Element auto-PM or one-click on the default card).",
    tags: ["Billing"], scopes: ["billing:write"],
    rateLimit: { windowMs: 60_000, maxRequests: 20, key: "principal" },
    request: { json: z.object({ userId: z.string().min(1), amountCents: z.number().int().positive(), credits: z.number().int().positive() }) },
    responses: [{ status: 200, schema: z.object({ clientSecret: z.string() }) }],
  },
  {
    method: "post", path: "/api/billing/setup-session", name: "createSetupSession",
    summary: "Create a setup session to save a card off-session (no charge).",
    tags: ["Billing"], scopes: ["billing:write"],
    rateLimit: { windowMs: 60_000, maxRequests: 20, key: "principal" },
    request: { json: z.object({ userId: z.string().min(1) }) },
    responses: [{ status: 200, schema: z.object({ clientSecret: z.string() }) }],
  },
  {
    method: "get", path: "/api/billing/auto-topup", name: "getAutoTopup",
    summary: "The caller's auto-recharge config (threshold + pack, or disabled).",
    tags: ["Billing"], scopes: ["billing:read"], errors: [401],
    rateLimit: { windowMs: 60_000, maxRequests: 30, key: "principal" },
    responses: [
      { status: 200, schema: z.object({ enabled: z.boolean(), thresholdCredits: z.number().int(), topupCredits: z.number().int() }) },
    ],
  },
  {
    method: "post", path: "/api/billing/auto-topup", name: "setAutoTopup",
    summary: "Enable/update/disable auto-recharge (top up when the balance falls below a threshold).",
    tags: ["Billing"], scopes: ["billing:write"], errors: [400, 401],
    rateLimit: { windowMs: 60_000, maxRequests: 30, key: "principal" },
    request: { json: z.object({ enabled: z.boolean(), thresholdCredits: z.number().int(), topupCredits: z.number().int() }) },
    responses: [{ status: 200, schema: z.object({ ok: z.boolean() }) }],
  },
  {
    method: "get", path: "/api/billing/payment-health", name: "getPaymentHealth",
    summary: "Standing payment-health flags for the caller (failed charges, expiring cards, dunning).",
    tags: ["Billing"], scopes: ["billing:read"], errors: [401],
    rateLimit: { windowMs: 60_000, maxRequests: 60, key: "principal" },
    responses: [
      {
        status: 200,
        schema: z.object({
          alerts: z.array(z.object({ kind: z.string(), message: z.string() })),
        }),
      },
    ],
  },
] satisfies readonly RouteContract[];
