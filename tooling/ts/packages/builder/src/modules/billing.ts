/** A first-party `billing` module — Invoices and Subscriptions for the host's User. Ships a swappable
 *  `payments` provider slot. Intentionally leaves a couple of operations without a cost facet, so its
 *  conformance grade (B) differs from the fully-costed modules — the registry shows the grade up front. */
import type { SulukModule } from "../module";

export const BILLING: SulukModule = {
  name: "billing",
  version: "0.1.0",
  provides: ["Invoice", "Subscription"],
  requires: ["User"],
  schemas: {
    Invoice: {
      type: "object",
      required: ["amountCents"],
      properties: {
        id: { type: "integer" },
        customer: { $ref: "#/components/schemas/User" },
        amountCents: { type: "integer", minimum: 0 },
        status: { type: "string", enum: ["draft", "open", "paid", "void"] },
      },
      additionalProperties: false,
    },
    Subscription: {
      type: "object",
      required: ["plan"],
      properties: {
        id: { type: "integer" },
        customer: { $ref: "#/components/schemas/User" },
        plan: { type: "string" },
        status: { type: "string", enum: ["active", "past_due", "canceled"] },
      },
      additionalProperties: false,
    },
  },
  cost: {
    // Each op declares its infra multipliers + a PAYMENT METHOD. Subscription ops settle as `subscription` (their cost is
    // covered by the recurring plan allowance, not per-call credit); the invoice reads settle as `credit`. The Stripe fee
    // on a create is a THIRD-PARTY component (per-call here; the % is metered dynamically at charge time — see @suluk/payments).
    listInvoice: { components: [{ source: "db-read", basis: "per-call", microUsd: 12 }], estimateMicroUsd: 12, infra: { "worker.request": 1, "d1.read": 20 }, settlement: { method: "credit" } },
    createInvoice: { components: [{ source: "third-party", basis: "per-call", microUsd: 500 }], estimateMicroUsd: 500, infra: { "worker.request": 1, "d1.write": 1 }, settlement: { method: "subscription" } },
    listSubscription: { components: [{ source: "db-read", basis: "per-call", microUsd: 12 }], estimateMicroUsd: 12, infra: { "worker.request": 1, "d1.read": 20 }, settlement: { method: "credit" } },
    createSubscription: { components: [{ source: "third-party", basis: "per-call", microUsd: 500 }], estimateMicroUsd: 500, infra: { "worker.request": 1, "d1.write": 1 }, settlement: { method: "subscription" } },
    updateSubscription: { components: [{ source: "db-write", basis: "per-call", microUsd: 40 }], estimateMicroUsd: 40, infra: { "worker.request": 1, "d1.write": 1, "d1.read": 1 }, settlement: { method: "subscription" } },
  },
  providerSlots: { payments: "stripe" },
};
