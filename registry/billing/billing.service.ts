/**
 * The Billing service (Suluk registry: `billing`) — an Effect-TS service over `@suluk/billing` (which runs on
 * `@suluk/payments`: the agnostic connector + client-token surface). The processor logic + money-correctness stay in the
 * packages; this is the owned wiring. Depends on `Db` (`app`) + `StripeCfg` (from env). v2 EXTENSION (C052): the full
 * toolfactory `/api/billing/*` surface — hosted/one-click top-up, subscribe/status/cancel/plan-change, payment-intent,
 * pricing quotes, the MODULE-OWNED credit refund (buyback), the saved-card methods, auto-top-up config, payment-health.
 *
 * The pricing MATRIX + refund BUYBACK RATE are app POLICY (`../pricing`). The refund + auto-topup MECHANICS are
 * module-owned here (both are excluded from @suluk/billing): the refund debits credits via @suluk/credits BEFORE moving
 * cash, then refunds across the customer's Stripe charges via the raw `stripePost`/`stripeGet` primitives.
 */
import { and, eq, isNull, lt, or } from "drizzle-orm";
import { Context, Effect, Layer } from "effect";
import {
  // v1 — customer + sessions + cards
  createCustomer, createPaymentIntent, createSetupIntent, listPaymentMethods, createPortalSessionForCustomer,
  linkBillingCustomer, billingCustomerId,
  // v2 — money-moving + subscriptions + tax + methods + account
  createCheckout, createSubscriptionCheckout, createPaymentIntentOnDefaultCard,
  createSubscriptionOnDefaultCard, getSubscriptionStatus, setSubscriptionCancel, changeSubscriptionPlan,
  defaultCard, ownsPaymentMethod, setDefaultPaymentMethod, setSubscriptionDefaultCard, detachPaymentMethod,
  calculateTax, recordTaxTransaction,
  billingSubscriptionId, upsertBillingAccount,
  stripePost, stripeGet, toForm,
  type StripeConfig, type BillingDB, type PaymentMethodWire, type SubPlan, type SubscriptionStatus,
  type ChangePlanResult, type TaxAddress,
} from "@suluk/billing";
import { grantOnce, debitCredits, getBalance, type CreditsDB } from "@suluk/credits";
import { Db } from "../app";
import {
  SUB_PLANS, CREDIT_PACKS, packById, subPlanById, creditsForUsd, refundNetCents,
  type CreditPack,
} from "../pricing";
import { autoTopup, paymentAlert } from "../db/billing";

/** The Stripe config (secret key + optional mock fetch) as an Effect service — provided from env at the route. */
export class StripeCfg extends Context.Tag("StripeCfg")<StripeCfg, StripeConfig>() {}

/** The app product name shown on hosted Stripe pages + line items — override in your app if you want your brand. */
const PRODUCT = "suluk";

/** Auto-top-up config as the UI reads/writes it (defaults when unset). */
export interface AutoTopupConfig {
  enabled: boolean;
  thresholdCredits: number;
  topupCredits: number;
}
const AUTO_TOPUP_DEFAULT: AutoTopupConfig = { enabled: false, thresholdCredits: 100, topupCredits: 1000 };

/** A payment-health flag row as the UI reads it. */
export interface PaymentAlertRow {
  id: string;
  kind: string;
  detail: string | null;
  createdAt: number;
}

export class Billing extends Context.Tag("Billing")<
  Billing,
  {
    // ── pricing (public) ──
    readonly packs: () => Effect.Effect<CreditPack[]>;
    readonly plans: () => Effect.Effect<SubPlan[]>;
    // ── customer + sessions ──
    readonly ensureCustomer: (userId: string, email?: string | null) => Effect.Effect<string>;
    readonly paymentSession: (userId: string, amountCents: number, credits: number) => Effect.Effect<{ clientSecret: string }>;
    readonly setupSession: (userId: string) => Effect.Effect<{ clientSecret: string }>;
    // ── top-up (hosted + one-click) ──
    readonly checkout: (userId: string, packId: string, successUrl: string, cancelUrl: string) => Effect.Effect<{ url: string }>;
    readonly paymentIntent: (userId: string, packId: string, onDefaultCard: boolean) => Effect.Effect<{ clientSecret: string | null }>;
    // ── subscriptions ──
    readonly subscribe: (userId: string, planId: string, hosted: boolean, successUrl: string, cancelUrl: string) => Effect.Effect<{ clientSecret?: string; subscriptionId?: string; url?: string } | { error: string }>;
    readonly subscriptionStatus: (userId: string) => Effect.Effect<SubscriptionStatus | null>;
    readonly cancelSubscription: (userId: string, cancel: boolean) => Effect.Effect<{ ok: boolean }>;
    readonly changePlan: (userId: string, planId: string) => Effect.Effect<ChangePlanResult | { error: string }>;
    // ── quotes ──
    readonly purchaseQuote: (userId: string, amountCents: number, ip?: string | null) => Effect.Effect<{ amountCents: number; credits: number; taxCents: number; totalCents: number }>;
    readonly refundQuote: (credits: number) => Effect.Effect<{ credits: number; netCents: number }>;
    // ── refund (module-owned) ──
    readonly refund: (userId: string, credits: number) => Effect.Effect<{ refundedCents: number } | { error: string }>;
    // ── cards / methods ──
    readonly cards: (userId: string) => Effect.Effect<PaymentMethodWire[]>;
    readonly setDefaultMethod: (userId: string, pmId: string) => Effect.Effect<{ ok: boolean } | { error: string }>;
    readonly deleteMethod: (userId: string, pmId: string) => Effect.Effect<{ ok: boolean } | { error: string }>;
    readonly portal: (userId: string, returnUrl: string) => Effect.Effect<{ url: string } | null>;
    // ── auto-topup (owned table) ──
    readonly getAutoTopup: (userId: string) => Effect.Effect<AutoTopupConfig>;
    readonly saveAutoTopup: (userId: string, cfg: AutoTopupConfig) => Effect.Effect<{ ok: boolean } | { error: string }>;
    // ── payment-health (owned table) ──
    readonly paymentHealth: (userId: string) => Effect.Effect<PaymentAlertRow[]>;
  }
>() {}

// The customer's succeeded, USD, still-refundable charges (amount − amount_refunded), newest first. Ported from the
// toolfactory oracle: Stripe itself caps each refund at the charge's headroom, so we can never pay back more than was
// charged. USD-only so we never sum a foreign-currency charge as USD cents.
interface RefundableCharge { id: string; refundable: number; }
async function listRefundableCharges(cfg: StripeConfig, customerId: string): Promise<RefundableCharge[]> {
  const res = await stripeGet(cfg, `charges?customer=${customerId}&limit=100`);
  const list = (await res.json()) as { error?: { message?: string }; data?: { id?: string; status?: string; currency?: string; amount?: number; amount_refunded?: number }[] };
  if (!res.ok) throw new Error(list?.error?.message ?? `Stripe charges list failed (${res.status})`);
  const out: RefundableCharge[] = [];
  for (const c of list?.data ?? []) {
    if (!c.id || c.status !== "succeeded" || c.currency !== "usd") continue;
    const refundable = (c.amount ?? 0) - (c.amount_refunded ?? 0);
    if (refundable > 0) out.push({ id: c.id, refundable });
  }
  return out; // Stripe returns charges newest-first
}

/** Refund up to `amountCents` to the customer, newest charge first, each partial-capped at its refundable headroom.
 *  Idempotent per charge (`${idemScope}:${chargeId}`). On any per-refund failure it STOPS and returns what it DID refund
 *  (never throws mid-way) — the caller re-credits the shortfall, so a partial payout never silently swallows credits. */
async function refundAcrossCharges(cfg: StripeConfig, customerId: string, amountCents: number, idemScope: string): Promise<number> {
  if (amountCents <= 0) return 0;
  let charges: RefundableCharge[];
  try { charges = await listRefundableCharges(cfg, customerId); } catch { return 0; }
  let remaining = amountCents;
  for (const c of charges) {
    if (remaining <= 0) break;
    const amt = Math.min(remaining, c.refundable);
    try {
      const res = await stripePost(cfg, "refunds", toForm({ charge: c.id, amount: amt }), `${idemScope}:${c.id}`);
      const refund = (await res.json()) as { id?: string };
      if (!res.ok || !refund?.id) break; // stop on failure; caller re-credits the unrefunded remainder
      remaining -= amt;
    } catch { break; }
  }
  return amountCents - remaining;
}

export const BillingLive = Layer.effect(
  Billing,
  Effect.gen(function* () {
    const db = (yield* Db) as BillingDB & CreditsDB;
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
      packs: () => Effect.succeed(CREDIT_PACKS),
      plans: () => Effect.succeed(SUB_PLANS),

      ensureCustomer: (userId, email) => Effect.promise(() => customerFor(userId, email)),

      paymentSession: (userId, amountCents, credits) =>
        Effect.promise(async () => ({ clientSecret: await createPaymentIntent(cfg, await customerFor(userId), amountCents, { userId, credits }) })),

      setupSession: (userId) =>
        Effect.promise(async () => ({ clientSecret: await createSetupIntent(cfg, await customerFor(userId), userId) })),

      // POST /checkout — hosted top-up for a chosen pack. The pack drives amount + credits SERVER-AUTHORITATIVELY (the
      // client sends only the id). Reuses the user's customer so a saved card isn't orphaned.
      checkout: (userId, packId, successUrl, cancelUrl) =>
        Effect.promise(async () => {
          const pack = packById(packId);
          if (!pack) throw new Error("unknown pack");
          const customerId = await billingCustomerId(db, userId); // reuse if present; Checkout creates one otherwise
          const url = await createCheckout(cfg, {
            userId, customerId, amountCents: pack.priceCents, credits: pack.credits,
            successUrl, cancelUrl, productName: `${PRODUCT} — ${pack.credits} credits`,
          });
          return { url };
        }),

      // POST /payment-intent — on-site top-up for a pack; onDefaultCard=true is the one-click path (null when no card).
      paymentIntent: (userId, packId, onDefaultCard) =>
        Effect.promise(async () => {
          const pack = packById(packId);
          if (!pack) throw new Error("unknown pack");
          const customerId = await customerFor(userId);
          const meta = { userId, credits: pack.credits };
          const clientSecret = onDefaultCard
            ? await createPaymentIntentOnDefaultCard(cfg, customerId, pack.priceCents, meta)
            : await createPaymentIntent(cfg, customerId, pack.priceCents, meta);
          return { clientSecret };
        }),

      // POST /subscribe — one-click on the saved default card (default), or hosted Checkout. On one-click we persist the
      // new subscription id (upsertBillingAccount) so status/cancel/change can find it.
      subscribe: (userId, planId, hosted, successUrl, cancelUrl) =>
        Effect.promise(async () => {
          const plan = subPlanById(planId);
          if (!plan) return { error: "unknown plan" as const };
          const customerId = await customerFor(userId);
          if (hosted) {
            const url = await createSubscriptionCheckout(cfg, { userId, plan, successUrl, cancelUrl, productName: `${PRODUCT} — ${plan.label}` });
            return { url };
          }
          const created = await createSubscriptionOnDefaultCard(cfg, customerId, plan, userId);
          if (!created) return { error: "no default card — add one first" as const };
          await upsertBillingAccount(db, userId, customerId, created.subscriptionId);
          return { clientSecret: created.clientSecret, subscriptionId: created.subscriptionId };
        }),

      // GET /subscription — live status for the caller's recorded subscription (null when they have none).
      subscriptionStatus: (userId) =>
        Effect.promise(async () => {
          const subId = await billingSubscriptionId(db, userId);
          return subId ? getSubscriptionStatus(cfg, subId, SUB_PLANS) : null;
        }),

      // POST /subscription — schedule cancel at period end (or resume).
      cancelSubscription: (userId, cancel) =>
        Effect.promise(async () => {
          const subId = await billingSubscriptionId(db, userId);
          if (!subId) return { ok: false };
          await setSubscriptionCancel(cfg, subId, cancel);
          return { ok: true };
        }),

      // POST /subscription-plan — change plan in place against the paid ceiling.
      changePlan: (userId, planId) =>
        Effect.promise(async () => {
          const plan = subPlanById(planId);
          if (!plan) return { error: "unknown plan" as const };
          const subId = await billingSubscriptionId(db, userId);
          if (!subId) return { error: "no active subscription" as const };
          return changeSubscriptionPlan(cfg, subId, plan, userId, SUB_PLANS);
        }),

      // GET /purchase-quote — credits a custom USD charge buys + a graceful tax preview (located by the saved card).
      purchaseQuote: (userId, amountCents, ip) =>
        Effect.promise(async () => {
          const credits = creditsForUsd(amountCents);
          const customerId = await billingCustomerId(db, userId);
          // Tax is best-effort ($0 until Stripe Tax is live / no locatable address). Located by the saved card's billing
          // address (preferred) or the request IP.
          let address: TaxAddress | null = null;
          if (customerId) address = (await defaultCard(cfg, customerId))?.address ?? null;
          const tax = customerId ? await calculateTax(cfg, customerId, amountCents, { address, ip }) : { taxCents: 0, calculationId: null };
          return { amountCents, credits, taxCents: tax.taxCents, totalCents: amountCents + tax.taxCents };
        }),

      // GET /refund-quote — the net cash a credit buyback returns (below acquisition, minus the Stripe fee).
      refundQuote: (credits) => Effect.succeed({ credits, netCents: refundNetCents(credits) }),

      // POST /refund — MODULE-OWNED. DEBIT the credits FIRST (so a double-submit can't refund twice; debitCredits throws
      // InsufficientCreditsError when the balance can't cover it → mapped to an error below), THEN refund cash across the
      // customer's Stripe charges. If the payout falls short of the quote (a charge failed mid-way), RE-CREDIT the
      // unrefunded portion so the user never loses credits without the matching cash.
      refund: (userId, credits) =>
        Effect.promise(async () => {
          if (!Number.isInteger(credits) || credits <= 0) return { error: "invalid credit amount" as const };
          const customerId = await billingCustomerId(db, userId);
          if (!customerId) return { error: "no billing account" as const };
          const netCents = refundNetCents(credits);
          if (netCents <= 0) return { error: "amount too small to refund" as const };
          const balance = await getBalance(db, userId);
          if (balance < credits) return { error: "insufficient credits" as const };
          // Debit first — the credits are gone the moment we start moving cash.
          await debitCredits(db, userId, credits, "refund");
          const idemScope = `refund:${userId}:${Date.now()}`;
          const refundedCents = await refundAcrossCharges(cfg, customerId, netCents, idemScope);
          if (refundedCents < netCents) {
            // Cash payout fell short → re-credit the un-refunded portion (credits ← cents at the SAME refund rate) so the
            // ledger stays whole. Ceil so we never under-restore the user.
            const shortfallCents = netCents - refundedCents;
            const reCredit = Math.ceil((shortfallCents / netCents) * credits);
            if (reCredit > 0) await grantOnce(db, userId, reCredit, `${idemScope}:recredit`, "refund_shortfall");
          }
          return { refundedCents };
        }),

      cards: (userId) =>
        Effect.promise(async () => { const cust = await billingCustomerId(db, userId); return cust ? listPaymentMethods(cfg, cust) : []; }),

      // POST /methods/default — set the invoice default AND move an active subscription to the same card.
      setDefaultMethod: (userId, pmId) =>
        Effect.promise(async () => {
          const customerId = await billingCustomerId(db, userId);
          if (!customerId) return { error: "no billing account" as const };
          if (!(await ownsPaymentMethod(cfg, customerId, pmId))) return { error: "card not found" as const };
          await setDefaultPaymentMethod(cfg, customerId, pmId);
          const subId = await billingSubscriptionId(db, userId);
          if (subId) await setSubscriptionDefaultCard(cfg, subId, pmId);
          return { ok: true };
        }),

      // POST /methods/delete — detach a card (guarded to the caller's customer).
      deleteMethod: (userId, pmId) =>
        Effect.promise(async () => {
          const customerId = await billingCustomerId(db, userId);
          if (!customerId) return { error: "no billing account" as const };
          if (!(await ownsPaymentMethod(cfg, customerId, pmId))) return { error: "card not found" as const };
          await detachPaymentMethod(cfg, pmId);
          return { ok: true };
        }),

      portal: (userId, returnUrl) =>
        Effect.promise(async () => { const cust = await billingCustomerId(db, userId); return cust ? { url: await createPortalSessionForCustomer(cfg, cust, returnUrl) } : null; }),

      // GET /auto-topup — read the owned row (defaults when unset).
      getAutoTopup: (userId) =>
        Effect.promise(async () => {
          const r = (await db.select().from(autoTopup).where(eq(autoTopup.userId, userId)).limit(1))[0];
          return r ? { enabled: r.enabled, thresholdCredits: r.thresholdCredits, topupCredits: r.topupCredits } : { ...AUTO_TOPUP_DEFAULT };
        }),

      // POST /auto-topup — upsert the owned row. Enabling requires a saved default card (else a triggered charge would
      // silently no-op), so we verify one exists before letting `enabled` go true.
      saveAutoTopup: (userId, cfg2) =>
        Effect.promise(async () => {
          if (cfg2.enabled) {
            const customerId = await billingCustomerId(db, userId);
            const card = customerId ? await defaultCard(cfg, customerId) : null;
            if (!card) return { error: "add a default card before enabling auto top-up" as const };
          }
          const set = { enabled: cfg2.enabled, thresholdCredits: cfg2.thresholdCredits, topupCredits: cfg2.topupCredits, updatedAt: new Date() };
          await db.insert(autoTopup).values({ userId, ...set }).onConflictDoUpdate({ target: autoTopup.userId, set }).run();
          return { ok: true };
        }),

      // GET /payment-health — the standing alert rows for the user (newest first).
      paymentHealth: (userId) =>
        Effect.promise(async () => {
          const rows = await db.select().from(paymentAlert).where(eq(paymentAlert.userId, userId)).limit(50);
          return rows
            .map((r) => ({ id: r.id, kind: r.kind, detail: r.detail, createdAt: r.createdAt instanceof Date ? r.createdAt.getTime() : Number(r.createdAt) }))
            .sort((a, b) => b.createdAt - a.createdAt);
        }),
    };
  }),
);

// Re-export the CAS predicate helpers a background auto-top-up trigger (outside the request path) would compose — the
// owned `auto_topup` row's `lastTriggeredAt` is the cooldown/claim anchor (see the toolfactory oracle's maybeAutoTopup).
export const autoTopupClaimWhere = (userId: string, cutoff: Date) =>
  and(eq(autoTopup.userId, userId), or(isNull(autoTopup.lastTriggeredAt), lt(autoTopup.lastTriggeredAt, cutoff)));
