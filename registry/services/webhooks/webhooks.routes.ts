/**
 * Webhooks routes (Suluk registry: `webhooks`) — Hono over the {@link Webhooks} Effect service. Mount:
 * `app.route("/webhooks", webhooksRoutes())`. One endpoint, `POST /webhooks/stripe`: read the RAW body with
 * `c.req.text()` (NOT `.json()` — signature verification needs the exact bytes Stripe signed), read the
 * `stripe-signature` header, verify, dedup + dispatch. Returns 200 on success (so Stripe stops redelivering), 400 on a
 * bad/stale signature. Yours to edit; the verification + routing logic stay in `@suluk/payments`.
 */
import { Hono } from "hono";
import { Effect } from "effect";
import { z } from "zod";
import type { RouteContract } from "@suluk/hono";
import { DbLive, type Bindings } from "../app";
import { Webhooks, WebhooksLive, WebhookCfgLive, type WebhookEnv } from "../services/webhooks";

// ── the module's CONTRACT fragment, co-located with the route it describes (replaces `webhooks.contract.ts`) ──
// This surface is bespoke-mounted (raw-body signature verification, not an effectRoute), so its op is a documented literal
// rather than a derived `effectRoute` contract; it still bubbles up via `webhooksOps` (spread by `src/contract.ops.ts`).

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
    cost: { components: [], infra: { "worker.request": 1, "d1.write": 1, "d1.read": 1 }, settlement: { method: "rate-limited" } },
    tags: ["Webhooks"],
    // Public + signature-verified: no caller principal to key on → IP-cap it against redelivery/replay abuse.
    rateLimit: { windowMs: 60_000, maxRequests: 120, key: "ip" },
    errors: [400], // bad/stale `stripe-signature` (verification failed) — Stripe will redeliver.
    responses: [
      { status: 200, description: "The event was received (Stripe stops redelivering).", schema: WebhookAckSchema },
    ],
  },
] satisfies readonly RouteContract[];

export function webhooksRoutes() {
  const r = new Hono<{ Bindings: Bindings }>();
  const run = <A>(env: Bindings, program: Effect.Effect<A, never, Webhooks>): Promise<A> =>
    program.pipe(
      Effect.provide(WebhooksLive),
      Effect.provide(WebhookCfgLive(env as unknown as WebhookEnv)),
      Effect.provide(DbLive(env)),
      Effect.runPromise,
    );

  // POST /webhooks/stripe — verify the signature over the RAW body, dedup on the event id, dispatch to a handler.
  r.post("/stripe", async (c) => {
    const rawBody = await c.req.text(); // RAW bytes — re-serializing JSON would break the HMAC.
    const signature = c.req.header("stripe-signature") ?? "";
    const event = await run(c.env, Effect.flatMap(Webhooks, (s) => s.verify(rawBody, signature)));
    if (!event) return c.json({ error: "invalid signature" }, 400);
    const res = await run(c.env, Effect.flatMap(Webhooks, (s) => s.dispatch(event)));
    return c.json({ received: true, ...res }, 200);
  });

  return r;
}
