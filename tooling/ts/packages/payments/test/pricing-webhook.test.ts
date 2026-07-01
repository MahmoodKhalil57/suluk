import { test, expect, describe } from "bun:test";
import {
  subtotal, orderTotal, verifyAmount, prorateDiscount, computeDiscountAmount, idempotencyKey,
  verifyStripeSignature, webhookRouter, STRIPE_EVENTS, type CartLine, type Discount,
} from "../src/index";

/** C048 — the pricing + Stripe-webhook surfaces moved here from @suluk/stripe; direct coverage in their new home. */

describe("pricing primitives (moved from @suluk/stripe)", () => {
  const lines: CartLine[] = [{ unitCents: 1999, qty: 2, id: "a" }, { unitCents: 500, qty: 1, id: "b" }];

  test("verifyAmount is anti-tampering (recomputes; rejects a mismatch)", () => {
    const total = orderTotal(lines, null).totalCents; // 4498
    expect(verifyAmount(lines, null, total).ok).toBe(true);
    expect(verifyAmount(lines, null, total - 1).reason).toBe("amount-mismatch");
  });

  test("a discount never exceeds the subtotal; proration sums EXACTLY", () => {
    expect(computeDiscountAmount(subtotal(lines), { type: "fixed", value: 9_999_999 } as Discount)).toBe(subtotal(lines));
    const shares = prorateDiscount(lines, 777);
    expect(shares.reduce((a, b) => a + b, 0)).toBe(777);
  });

  test("idempotencyKey is order-independent + scope-sensitive", () => {
    const k = idempotencyKey("u1", lines);
    expect(idempotencyKey("u1", [...lines].reverse())).toBe(k);
    expect(idempotencyKey("u2", lines)).not.toBe(k);
  });
});

describe("Stripe webhook surface (moved from @suluk/stripe)", () => {
  async function sign(secret: string, ts: number, body: string): Promise<string> {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${ts}.${body}`));
    return [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  test("verifyStripeSignature: accepts a correctly-signed fresh event; rejects tampered/stale/missing", async () => {
    const secret = "whsec_test";
    const body = '{"type":"payment_intent.succeeded"}';
    const ts = 1_700_000_000;
    const sig = await sign(secret, ts, body);
    const now = () => ts;
    expect(await verifyStripeSignature(body, `t=${ts},v1=${sig}`, secret, { now })).toBe(true);
    expect(await verifyStripeSignature(`${body} `, `t=${ts},v1=${sig}`, secret, { now })).toBe(false); // body tampered
    expect(await verifyStripeSignature(body, `t=${ts - 999},v1=${sig}`, secret, { now })).toBe(false); // stale (outside tolerance)
    expect(await verifyStripeSignature("", "", "")).toBe(false); // missing
  });

  test("webhookRouter dispatches by type + falls back to onUnhandled", async () => {
    const seen: string[] = [];
    const router = webhookRouter()
      .on(STRIPE_EVENTS.invoicePaid, () => void seen.push("paid"))
      .onUnhandled((e) => void seen.push(`unhandled:${e.type}`));
    expect((await router.handle({ type: STRIPE_EVENTS.invoicePaid })).handled).toBe(true);
    expect((await router.handle({ type: "some.other" })).handled).toBe(false);
    expect(seen).toEqual(["paid", "unhandled:some.other"]);
  });
});
