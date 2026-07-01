/**
 * The Billing service (Suluk registry: `billing`) — an Effect-TS service over `@suluk/billing` (which runs on
 * `@suluk/payments`: the agnostic connector + client-token surface). The processor logic + the money-correctness stay in
 * the packages; this is the owned wiring. Depends on the `Db` service (`app`) + a `StripeCfg` service (from env). The
 * webhook dispatch + the pricing matrix stay in YOUR app (per C046/C048) — this covers customer + browser-session + cards.
 */
import { Context, Effect, Layer } from "effect";
import {
  createCustomer, createPaymentIntent, createSetupIntent, listPaymentMethods, createPortalSessionForCustomer,
  linkBillingCustomer, billingCustomerId, type StripeConfig, type BillingDB, type PaymentMethodWire,
} from "@suluk/billing";
import { Db } from "../app";

/** The Stripe config (secret key + optional mock fetch) as an Effect service — provided from env at the route. */
export class StripeCfg extends Context.Tag("StripeCfg")<StripeCfg, StripeConfig>() {}

export class Billing extends Context.Tag("Billing")<
  Billing,
  {
    readonly ensureCustomer: (userId: string, email?: string | null) => Effect.Effect<string>;
    readonly paymentSession: (userId: string, amountCents: number, credits: number) => Effect.Effect<{ clientSecret: string }>;
    readonly setupSession: (userId: string) => Effect.Effect<{ clientSecret: string }>;
    readonly cards: (userId: string) => Effect.Effect<PaymentMethodWire[]>;
    readonly portal: (userId: string, returnUrl: string) => Effect.Effect<{ url: string } | null>;
  }
>() {}

export const BillingLive = Layer.effect(
  Billing,
  Effect.gen(function* () {
    const db = (yield* Db) as BillingDB;
    const cfg = yield* StripeCfg;

    // Find-or-create the user's Stripe customer, persisting the link (never orphans a saved card).
    const customerFor = async (userId: string, email?: string | null): Promise<string> => {
      const existing = await billingCustomerId(db, userId);
      if (existing) return existing;
      const id = await createCustomer(cfg, email ?? null, userId);
      await linkBillingCustomer(db, userId, id);
      return id;
    };

    return {
      ensureCustomer: (userId, email) => Effect.promise(() => customerFor(userId, email)),
      paymentSession: (userId, amountCents, credits) =>
        Effect.promise(async () => ({ clientSecret: await createPaymentIntent(cfg, await customerFor(userId), amountCents, { userId, credits }) })),
      setupSession: (userId) => Effect.promise(async () => ({ clientSecret: await createSetupIntent(cfg, await customerFor(userId), userId) })),
      cards: (userId) => Effect.promise(async () => { const cust = await billingCustomerId(db, userId); return cust ? listPaymentMethods(cfg, cust) : []; }),
      portal: (userId, returnUrl) => Effect.promise(async () => { const cust = await billingCustomerId(db, userId); return cust ? { url: await createPortalSessionForCustomer(cfg, cust, returnUrl) } : null; }),
    };
  }),
);
