/**
 * The Webhooks service (Suluk registry: `webhooks`) — an Effect-TS service over `@suluk/payments`'s inbound Stripe
 * surface. The two hard parts stay upstream (a fix flows via npm): SDK-free signature VERIFICATION (`verifyStripeSignature`
 * — Web Crypto HMAC-SHA256, replay-window enforced) and the typed event ROUTER (`webhookRouter` — dispatch on `event.type`
 * instead of one giant switch). THIS layer is the owned wiring:
 *   - `verify`   — RAW body + `stripe-signature` header + the signing secret → the typed {@link StripeWebhookEvent}, or
 *                  `null` on a bad/stale signature (the caller returns 400). Parses the body only AFTER the HMAC checks out.
 *   - `dispatch` — dedup against the OWNED `webhook_event` table (Stripe is at-least-once → redelivery must be a no-op),
 *                  then route the event through `webhookRouter` to the registered handler.
 * Handlers are a documented STUB set (see `defaultHandlers`) — the app fills fulfillment (e.g. `credits.grant`) so this
 * module stays DECOUPLED from `@suluk/credits`. Config (the signing secret) comes from env via {@link WebhookCfg}.
 * Depends on `Db` (`app`). Compose: `Layer.provide(WebhooksLive, DbLive(env))`.
 */
import { Context, Effect, Layer } from "effect";
import {
  verifyStripeSignature,
  webhookRouter,
  STRIPE_EVENTS,
  type StripeWebhookEvent,
  type WebhookHandler,
  type HandleResult,
} from "@suluk/payments";
import { webhookEvent } from "../db/webhooks";
import { Db } from "../app";

/** The endpoint signing secret (`whsec_…`), from env — declare `STRIPE_WEBHOOK_SECRET` in your `wrangler`/`.dev.vars`. */
export interface WebhookConfig {
  signingSecret: string;
}

/** Build the config from env. */
export interface WebhookEnv {
  STRIPE_WEBHOOK_SECRET?: string;
}
export function webhookCfgFromEnv(env: WebhookEnv): WebhookConfig {
  return { signingSecret: env.STRIPE_WEBHOOK_SECRET ?? "" };
}

export class WebhookCfg extends Context.Tag("WebhookCfg")<WebhookCfg, WebhookConfig>() {}
export const WebhookCfgLive = (env: WebhookEnv): Layer.Layer<WebhookCfg> =>
  Layer.succeed(WebhookCfg, webhookCfgFromEnv(env));

/**
 * The DEFAULT handler set — a documented STUB. Each entry is a no-op the APP replaces with real fulfillment; we keep it
 * here (rather than importing `@suluk/credits`) so the webhook module stays decoupled. To wire fulfillment in your repo,
 * override the map you pass to `WebhooksLive`'s router, e.g. `{ [STRIPE_EVENTS.checkoutCompleted]: (e) => credits.grant(...) }`.
 */
export const defaultHandlers: Record<string, WebhookHandler> = {
  // STUB — the app fills this: on a completed Checkout Session, grant the purchased credits (credits.grant fulfillment).
  [STRIPE_EVENTS.checkoutCompleted]: (_event) => {
    // no-op stub — override in your repo with `credits.grant(...)` fulfillment. Kept decoupled from @suluk/credits.
  },
};

export class Webhooks extends Context.Tag("Webhooks")<
  Webhooks,
  {
    /** verify a RAW body + `stripe-signature` header → the typed event, or `null` on a bad/stale signature (⇒ 400). */
    readonly verify: (rawBody: string, signatureHeader: string) => Effect.Effect<StripeWebhookEvent | null>;
    /** dedup on the event id (at-least-once safe), then route to a handler. `deduped:true` ⇒ a redelivery we skipped. */
    readonly dispatch: (event: StripeWebhookEvent) => Effect.Effect<{ deduped: boolean; result?: HandleResult }>;
  }
>() {}

export const WebhooksLive = Layer.effect(
  Webhooks,
  Effect.gen(function* () {
    const db = yield* Db;
    const cfg = yield* WebhookCfg;
    const router = webhookRouter(defaultHandlers);

    return {
      verify: (rawBody, signatureHeader) =>
        Effect.promise(async () => {
          const ok = await verifyStripeSignature(rawBody, signatureHeader, cfg.signingSecret);
          if (!ok) return null;
          // signature checked out → NOW it's safe to parse the raw bytes into the typed event.
          return JSON.parse(rawBody) as StripeWebhookEvent;
        }),

      dispatch: (event) =>
        Effect.promise(async () => {
          const id = (event as { id?: string }).id;
          if (id) {
            // single-statement claim: if the event id already exists the insert is a no-op → a redelivery we skip.
            const claimed = await db
              .insert(webhookEvent)
              .values({ id, type: event.type, processedAt: new Date() })
              .onConflictDoNothing()
              .returning({ id: webhookEvent.id });
            if (claimed.length === 0) return { deduped: true };
          }
          const result = await router.handle(event);
          return { deduped: false, result };
        }),
    };
  }),
);
