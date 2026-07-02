import { test, expect, describe } from "bun:test";
import { STRIPE_WEIGHTS, STRIPE_CHARGE_FEE_MICRO_USD, STRIPE_PERCENT, stripePercentFee, stripeFee } from "../src/weights";

/**
 * Stripe fee weights — the provider analogue of Cloudflare infra weights. The FIXED $0.30 is a static weight; the 2.9% is
 * dynamic (metered per charge). Tokens are µ$ (1:1 with dollars): $0.30 = 300,000 µ$.
 */
describe("Stripe fee weights", () => {
  test("the fixed per-charge fee is $0.30 = 300,000 µ$", () => {
    expect(STRIPE_CHARGE_FEE_MICRO_USD).toBe(300_000);
    expect(STRIPE_WEIGHTS["stripe.charge"]).toBe(300_000);
  });

  test("the % fee is 2.9% of the charged amount (dynamic)", () => {
    expect(STRIPE_PERCENT).toBeCloseTo(0.029);
    expect(stripePercentFee(10_000_000)).toBe(290_000); // 2.9% of $10 = $0.29
    expect(stripePercentFee(0)).toBe(0);
    expect(stripePercentFee(NaN)).toBe(0); // poison-safe
  });

  test("the total fee for a charge = fixed $0.30 + 2.9%", () => {
    // a $10 charge → $0.30 + $0.29 = $0.59 = 590,000 µ$
    expect(stripeFee(10_000_000)).toBe(300_000 + 290_000);
  });
});
