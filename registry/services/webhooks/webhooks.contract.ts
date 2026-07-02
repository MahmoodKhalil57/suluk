/** The `webhooks` module's CONTRACT fragment — its `/api/webhooks/*` op. Composed via `src/contract.ops.ts`. */
import type { RouteContract } from "@suluk/hono";
import { z } from "zod";

/** One dispatched event's outcome — `type` is the Stripe event type, `handled` ⇒ a registered handler ran (vs. fallback). */
const HandleResultSchema = z.object({
  type: z.string(),
  handled: z.boolean(),
});

/** The webhook ack the route returns on a verified event: `received:true` + the dispatch outcome. */
const WebhookAckSchema = z.object({
  received: z.literal(true),
  /** `true` ⇒ a redelivery of an already-processed event id — the dispatch was a no-op. */
  deduped: z.boolean(),
  /** the routed handler's outcome; absent when the event was a deduped redelivery (nothing re-dispatched). */
  result: HandleResultSchema.optional(),
});

export const webhooksOps = [
  {
    method: "post",
    path: "/api/webhooks/stripe",
    name: "stripeWebhook",
    summary:
      "Stripe webhook sink — verifies the signature over the RAW body, dedups on the event id, dispatches. Public (no session scope; authenticated by the Stripe signature, not a caller principal).",
    cost: { components: [], infra: { "worker.request": 1, "d1.write": 1, "d1.read": 1 }, settlement: { method: "free" } },
    tags: ["Webhooks"],
    // Public + signature-verified: no caller principal to key on → IP-cap it against redelivery/replay abuse.
    rateLimit: { windowMs: 60_000, maxRequests: 120, key: "ip" },
    errors: [400], // bad/stale `stripe-signature` (verification failed) — Stripe will redeliver.
    responses: [
      { status: 200, description: "The event was received (Stripe stops redelivering).", schema: WebhookAckSchema },
    ],
  },
] satisfies readonly RouteContract[];
