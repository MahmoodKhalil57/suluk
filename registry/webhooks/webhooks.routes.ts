/**
 * Webhooks routes (Suluk registry: `webhooks`) — Hono over the {@link Webhooks} Effect service. Mount:
 * `app.route("/webhooks", webhooksRoutes())`. One endpoint, `POST /webhooks/stripe`: read the RAW body with
 * `c.req.text()` (NOT `.json()` — signature verification needs the exact bytes Stripe signed), read the
 * `stripe-signature` header, verify, dedup + dispatch. Returns 200 on success (so Stripe stops redelivering), 400 on a
 * bad/stale signature. Yours to edit; the verification + routing logic stay in `@suluk/payments`.
 */
import { Hono } from "hono";
import { Effect } from "effect";
import { DbLive, type Bindings } from "../app";
import { Webhooks, WebhooksLive, WebhookCfgLive, type WebhookEnv } from "../services/webhooks";

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
