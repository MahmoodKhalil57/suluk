/** The `billing` module's CONTRACT fragment — the full `/api/billing/*` surface. Composed via `src/contract.ops.ts`
 *  (own your ops next to your routes; scopes: read for GET, write for POST). */
import { z } from "zod";
import type { RouteContract } from "@suluk/hono";

export const billingOps = [
  { method: "get", path: "/api/billing/packs", name: "getPacks", summary: "Available credit packs (server-authoritative pricing). Public — the frontend reads it pre-sign-in.", tags: ["Billing"], responses: [{ status: 200, description: "The available credit packs." }] },
  { method: "get", path: "/api/billing/plans", name: "getPlans", summary: "Available subscription plans (server-authoritative pricing). Public — the frontend reads it pre-sign-in.", tags: ["Billing"], responses: [{ status: 200, description: "The available subscription plans." }] },
  { method: "get", path: "/api/billing/payment-config", name: "getPaymentConfig", summary: "The publishable payment config (publishable key + enabled methods) for the client SDK.", tags: ["Billing"], scopes: ["billing:read"], responses: [{ status: 200, description: "The client payment config." }] },
  {
    method: "post", path: "/api/billing/checkout", name: "checkout",
    summary: "Start a Stripe checkout / payment session for a credit top-up; returns the client secret or hosted URL.",
    tags: ["Billing"], scopes: ["billing:write"],
    request: { json: z.object({ packId: z.string().min(1), successUrl: z.string().url().max(2048), cancelUrl: z.string().url().max(2048) }) },
    responses: [{ status: 200, description: "The checkout session (client secret / URL)." }],
  },
  { method: "post", path: "/api/billing/payment-intent", name: "createPaymentIntent", summary: "Create a payment intent for a client-confirmed top-up; returns the client secret.", tags: ["Billing"], scopes: ["billing:write"], responses: [{ status: 200, description: "The payment intent (client secret)." }] },
  {
    method: "post", path: "/api/billing/subscribe", name: "subscribe",
    summary: "Start a subscription for a plan — one-click (client secret + subscription id) or hosted (checkout URL).",
    tags: ["Billing"], scopes: ["billing:write"], errors: [400],
    request: { json: z.object({ planId: z.string().min(1), hosted: z.boolean().optional(), successUrl: z.string().url().max(2048).optional(), cancelUrl: z.string().url().max(2048).optional() }) },
    responses: [{ status: 200, description: "The subscription session (client secret / URL)." }],
  },
  { method: "get", path: "/api/billing/subscription", name: "getSubscription", summary: "The caller's current subscription (plan, status, period end, cancel-at-period-end).", tags: ["Billing"], scopes: ["billing:read"], responses: [{ status: 200, description: "The current subscription." }] },
  { method: "post", path: "/api/billing/subscription", name: "cancelSubscription", summary: "Cancel (or schedule cancellation of) the caller's subscription.", tags: ["Billing"], scopes: ["billing:write"], responses: [{ status: 200, description: "The subscription was updated." }] },
  { method: "post", path: "/api/billing/subscription-plan", name: "changeSubscriptionPlan", summary: "Switch the caller's subscription to a different plan (prorated).", tags: ["Billing"], scopes: ["billing:write"], responses: [{ status: 200, description: "The plan change was applied." }] },
  { method: "get", path: "/api/billing/purchase-quote", name: "getPurchaseQuote", summary: "A server-authoritative quote (tax + total) for a credit-pack purchase before checkout.", tags: ["Billing"], scopes: ["billing:read"], responses: [{ status: 200, description: "The purchase quote." }] },
  { method: "get", path: "/api/billing/refund-quote", name: "getRefundQuote", summary: "How much of a purchase is refundable (credits already spent are deducted).", tags: ["Billing"], scopes: ["billing:read"], responses: [{ status: 200, description: "The refund quote." }] },
  { method: "post", path: "/api/billing/refund", name: "refund", summary: "Refund a purchase — DEBITS the granted credits before moving cash (partial-capped; re-credits any shortfall).", tags: ["Billing"], scopes: ["billing:write"], responses: [{ status: 200, description: "The refund was processed." }] },
  { method: "get", path: "/api/billing/cards/:userId", name: "listCards", summary: "A user's saved cards (each with its billing address); empty until they have a Stripe customer.", tags: ["Billing"], scopes: ["billing:read"], responses: [{ status: 200, description: "The saved payment methods." }] },
  { method: "get", path: "/api/billing/methods", name: "listMethods", summary: "The caller's saved payment methods (cards), the default flagged.", tags: ["Billing"], scopes: ["billing:read"], responses: [{ status: 200, description: "The saved payment methods." }] },
  { method: "post", path: "/api/billing/methods/default", name: "setDefaultMethod", summary: "Set a saved card as the default for off-session charges.", tags: ["Billing"], scopes: ["billing:write"], responses: [{ status: 200, description: "The default payment method was set." }] },
  { method: "post", path: "/api/billing/methods/delete", name: "deleteMethod", summary: "Detach a saved card from the caller's Stripe customer.", tags: ["Billing"], scopes: ["billing:write"], responses: [{ status: 200, description: "The payment method was detached." }] },
  { method: "post", path: "/api/billing/portal", name: "billingPortal", summary: "Open the Stripe billing portal to manage/cancel a subscription. Returns the portal URL.", tags: ["Billing"], scopes: ["billing:write"], errors: [404], responses: [{ status: 200, description: "The Stripe billing-portal URL." }] },
  { method: "post", path: "/api/billing/customer", name: "ensureCustomer", summary: "Ensure the caller has a Stripe customer (idempotent) — used before saving a card.", tags: ["Billing"], scopes: ["billing:write"], responses: [{ status: 200, description: "The Stripe customer id." }] },
  { method: "post", path: "/api/billing/payment-session", name: "createPaymentSession", summary: "Create a client payment session (Element auto-PM or one-click on the default card).", tags: ["Billing"], scopes: ["billing:write"], responses: [{ status: 200, description: "The client payment session." }] },
  { method: "post", path: "/api/billing/setup-session", name: "createSetupSession", summary: "Create a setup session to save a card off-session (no charge).", tags: ["Billing"], scopes: ["billing:write"], responses: [{ status: 200, description: "The setup session (client secret)." }] },
  { method: "get", path: "/api/billing/auto-topup", name: "getAutoTopup", summary: "The caller's auto-recharge config (threshold + pack, or disabled).", tags: ["Billing"], scopes: ["billing:read"], responses: [{ status: 200, description: "The auto-topup config." }] },
  { method: "post", path: "/api/billing/auto-topup", name: "setAutoTopup", summary: "Enable/update/disable auto-recharge (top up when the balance falls below a threshold).", tags: ["Billing"], scopes: ["billing:write"], responses: [{ status: 200, description: "The auto-topup config was saved." }] },
  { method: "get", path: "/api/billing/payment-health", name: "getPaymentHealth", summary: "Standing payment-health flags for the caller (failed charges, expiring cards, dunning).", tags: ["Billing"], scopes: ["billing:read"], responses: [{ status: 200, description: "The payment-health flags." }] },
] satisfies readonly RouteContract[];
