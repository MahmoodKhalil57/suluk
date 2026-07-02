/** The `webhooks` module's CONTRACT fragment — its `/api/webhooks/*` op. Composed via `src/contract.ops.ts`. */
import type { RouteContract } from "@suluk/hono";

export const webhooksOps = [
  { method: "post", path: "/api/webhooks/stripe", name: "stripeWebhook", summary: "Stripe webhook sink — verifies the signature over the RAW body, dedups on the event id, dispatches. Public (no session scope; authenticated by the Stripe signature, not a caller principal).", tags: ["Webhooks"], errors: [400], responses: [{ status: 200, description: "The event was received (Stripe stops redelivering)." }] },
] satisfies readonly RouteContract[];
