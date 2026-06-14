import { test, expect } from "bun:test";
import {
  cartNeedsShipping, flatRateShipping, combineShipping, resolveShipping,
  flatRateTax, noTax, resolveTax, composeTotal,
} from "../src/index";

const physical = (subtotalCents: number) => ({ subtotalCents, lines: [{ qty: 1, requiresShipping: true }] });
const digital = (subtotalCents: number) => ({ subtotalCents, lines: [{ qty: 1, requiresShipping: false }] });

test("flat shipping: flat fee for a physical cart under the free threshold", async () => {
  const p = flatRateShipping({ flatCents: 500, freeOverCents: 5000 });
  const o = await resolveShipping(p, physical(2900));
  expect(o?.amountCents).toBe(500);
});

test("flat shipping: FREE over the threshold", async () => {
  const p = flatRateShipping({ flatCents: 500, freeOverCents: 5000 });
  expect((await resolveShipping(p, physical(5000)))?.amountCents).toBe(0);
  expect((await resolveShipping(p, physical(9900)))?.amountCents).toBe(0);
});

test("flat shipping: digital-only cart quotes nothing", async () => {
  const p = flatRateShipping({ flatCents: 500 });
  expect(cartNeedsShipping(digital(9900))).toBe(false);
  expect(await resolveShipping(p, digital(9900))).toBeNull();
});

test("resolveShipping picks the chosen id, else the cheapest", async () => {
  const p = combineShipping(
    flatRateShipping({ flatCents: 500, id: "std", label: "Standard" }),
    flatRateShipping({ flatCents: 1500, id: "exp", label: "Express" }),
  );
  expect((await resolveShipping(p, physical(2900)))?.id).toBe("std"); // cheapest by default
  expect((await resolveShipping(p, physical(2900), "exp"))?.amountCents).toBe(1500); // honor the choice
});

test("flat tax: rate on the taxable base; shipping taxable only when opted in", async () => {
  expect((await resolveTax(flatRateTax({ rate: 0.08 }), { subtotalCents: 2900 })).taxCents).toBe(232);
  // taxableShipping folds shipping into the base
  expect((await resolveTax(flatRateTax({ rate: 0.1, taxableShipping: true }), { subtotalCents: 1000, shippingCents: 500 })).taxCents).toBe(150);
  expect((await resolveTax(flatRateTax({ rate: 0.1 }), { subtotalCents: 1000, shippingCents: 500 })).taxCents).toBe(100);
});

test("noTax + a non-positive rate yield zero", async () => {
  expect((await resolveTax(noTax(), { subtotalCents: 9999 })).taxCents).toBe(0);
  expect((await resolveTax(flatRateTax({ rate: 0 }), { subtotalCents: 9999 })).taxCents).toBe(0);
});

test("composeTotal folds subtotal − discount + shipping + tax, clamped", () => {
  expect(composeTotal({ subtotalCents: 2900, discountCents: 400, shippingCents: 500, taxCents: 200 }).totalCents).toBe(3200);
  // discount never exceeds subtotal; negatives clamp to 0
  expect(composeTotal({ subtotalCents: 1000, discountCents: 5000 }).totalCents).toBe(0);
  expect(composeTotal({ subtotalCents: 1000, shippingCents: -50, taxCents: NaN }).totalCents).toBe(1000);
});
