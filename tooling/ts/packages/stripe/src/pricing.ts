/**
 * MONEY — pure, side-effect-free pricing primitives (saastarter-parity roadmap, Phase 0; PARITY §2 trust layer).
 *
 * The checkout-resilience cluster is "invisible until the edge case hits; exactly what separates a toy cart from
 * one you'd trust with money." Its core is arithmetic that MUST be authored once and conformance-tested, never
 * re-derived per app where the cart-drawer total and the order-summary total silently drift:
 *
 *   • all money is INTEGER minor units (cents) — never a float (0.1 + 0.2 has no place near money);
 *   • a discount NEVER exceeds the subtotal (no negative totals, no free-money over-discount);
 *   • per-line proration sums EXACTLY to the order discount (largest-remainder), so every surface agrees;
 *   • verifyAmount RECOMPUTES the total from authoritative prices and rejects a client-supplied amount that
 *     doesn't match (anti-tampering — never trust the amount the browser sends);
 *   • a deterministic idempotency key from the cart lets a retry REUSE one payment intent (no double-charge).
 *
 * The BUSINESS rules around a discount (is it active? in its date window? under its usage cap? category-limited?)
 * stay the app's concern — this module is the MATH + the structural validation, the part every store shares.
 */

/** One cart line. `unitCents` is the authoritative price (from the server, not the client). */
export interface CartLine { unitCents: number; qty: number; id?: string | number }

/** A discount's MATH shape (the structural part; app-side eligibility rules are separate). */
export interface Discount {
  type: "percent" | "fixed";
  /** percent: 0–100; fixed: cents off the subtotal. */
  value: number;
  /** the discount only applies at/above this subtotal (cents). */
  minSubtotalCents?: number;
  /** cap the amount removed (cents) — e.g. "30% off, up to $50". Applied before the [0, subtotal] clamp. */
  maxDiscountCents?: number;
}

/** Stripe's minimum chargeable amount (USD). Below it, a charge is impossible — the order must go the free path. */
export const STRIPE_MIN_CHARGE_CENTS = 50;

/** Does this total require a real Stripe charge, or can it complete as a free order? Centralizes the $0.50 floor
 *  decision so the free-checkout branch and the Stripe branch can never disagree about where $0–$0.49 goes. */
export function requiresStripe(totalCents: number): boolean {
  return Math.max(0, Math.round(fin(totalCents))) >= STRIPE_MIN_CHARGE_CENTS;
}

export interface DiscountResult { valid: boolean; amountCents: number; reason?: DiscountRejection }
export type DiscountRejection = "no-discount" | "non-positive-value" | "percent-out-of-range" | "below-minimum";

export interface OrderTotal { subtotalCents: number; discountCents: number; totalCents: number }
export interface AmountVerdict { ok: boolean; expectedCents: number; claimedCents: number; deltaCents: number; reason?: "amount-mismatch" }

const sum = (ns: number[]) => ns.reduce((a, b) => a + b, 0);
/** Coerce a non-finite number (NaN/±Infinity) to 0 — money math must never propagate poison. */
const fin = (n: number) => (Number.isFinite(n) ? n : 0);
const lineTotal = (l: CartLine) => Math.max(0, Math.round(fin(l.unitCents))) * Math.max(0, Math.trunc(fin(l.qty)));

/** Subtotal in cents — integer, non-negative. */
export function subtotal(lines: CartLine[]): number {
  return sum(lines.map(lineTotal));
}

/**
 * The cents a discount removes from `subtotalCents` — ROUNDED to a whole cent and CLAMPED to [0, subtotal] so a
 * discount can never exceed the order or go negative. Validation (eligibility) is `validateDiscount`; this is the
 * raw amount assuming the discount applies.
 */
export function computeDiscountAmount(subtotalCents: number, d: Discount): number {
  const base = Math.max(0, Math.round(fin(subtotalCents)));
  if (base === 0 || !Number.isFinite(d.value) || d.value <= 0) return 0; // a non-finite/non-positive value buys nothing
  const raw = d.type === "percent" ? (base * d.value) / 100 : d.value;
  // cap a percentage (or fixed) discount at maxDiscountCents if set ("30% off, up to $50"), then clamp to [0, subtotal].
  const capped = d.maxDiscountCents != null && Number.isFinite(d.maxDiscountCents) ? Math.min(raw, Math.max(0, d.maxDiscountCents)) : raw;
  return Math.min(base, Math.max(0, Math.round(capped)));
}

/**
 * Validate a discount against a subtotal, with a SPECIFIC rejection reason (PARITY: "specific discount-rejection
 * reasons" — a shopper is told *why*, not just "invalid"). Structural only; the app layers active/window/usage.
 */
export function validateDiscount(subtotalCents: number, d: Discount | undefined | null): DiscountResult {
  if (!d) return { valid: false, amountCents: 0, reason: "no-discount" };
  if (d.value <= 0) return { valid: false, amountCents: 0, reason: "non-positive-value" };
  if (d.type === "percent" && d.value > 100) return { valid: false, amountCents: 0, reason: "percent-out-of-range" };
  if (d.minSubtotalCents != null && subtotalCents < d.minSubtotalCents) return { valid: false, amountCents: 0, reason: "below-minimum" };
  return { valid: true, amountCents: computeDiscountAmount(subtotalCents, d) };
}

/**
 * Split `discountCents` across `lines` proportionally to each line's total, as whole cents that sum EXACTLY to
 * `discountCents` (largest-remainder apportionment). This is what keeps the cart drawer and the order summary
 * from disagreeing by a cent. Each line's share is clamped to its own total.
 */
export function prorateDiscount(lines: CartLine[], discountCents: number): number[] {
  const totals = lines.map(lineTotal);
  const gross = sum(totals);
  const want = Math.min(Math.max(0, Math.round(discountCents)), gross);
  if (gross <= 0 || want <= 0) return lines.map(() => 0);
  const exact = totals.map((t) => (want * t) / gross);
  const shares = exact.map((e, i) => Math.min(totals[i], Math.floor(e)));
  let remainder = want - sum(shares);
  // hand the leftover cents to the lines with the largest fractional part that still have headroom
  const order = exact
    .map((e, i) => ({ i, frac: e - Math.floor(e) }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i);
  for (let k = 0; remainder > 0 && k < order.length * 2; k++) {
    const { i } = order[k % order.length];
    if (shares[i] < totals[i]) { shares[i] += 1; remainder -= 1; }
  }
  return shares;
}

/** Compose the authoritative order total from lines + an optional (already-validated) discount. */
export function orderTotal(lines: CartLine[], discount?: Discount | null): OrderTotal {
  const subtotalCents = subtotal(lines);
  const discountCents = discount ? validateDiscount(subtotalCents, discount).amountCents : 0;
  return { subtotalCents, discountCents, totalCents: subtotalCents - discountCents };
}

/** The full order total once shipping + tax (from the ./shipping + ./tax adapters) are known. */
export interface OrderTotalFull { subtotalCents: number; discountCents: number; shippingCents: number; taxCents: number; totalCents: number }

/**
 * Fold every component into ONE authoritative total: subtotal − discount + shipping + tax, each a non-negative whole
 * cent and the discount never exceeding the subtotal. The single place the order total is composed once shipping (a
 * ShippingOption) and tax (a TaxResult) are resolved — so the cart drawer, checkout summary, order record, and the
 * Stripe charge can never disagree.
 */
export function composeTotal(parts: { subtotalCents: number; discountCents?: number; shippingCents?: number; taxCents?: number }): OrderTotalFull {
  const subtotalCents = Math.max(0, Math.round(fin(parts.subtotalCents)));
  const discountCents = Math.min(subtotalCents, Math.max(0, Math.round(fin(parts.discountCents ?? 0))));
  const shippingCents = Math.max(0, Math.round(fin(parts.shippingCents ?? 0)));
  const taxCents = Math.max(0, Math.round(fin(parts.taxCents ?? 0)));
  return { subtotalCents, discountCents, shippingCents, taxCents, totalCents: subtotalCents - discountCents + shippingCents + taxCents };
}

/**
 * ANTI-TAMPERING: recompute the total from authoritative line prices + the discount and compare it to the amount
 * the client claims (e.g. a PaymentIntent amount the browser posted). Reject any mismatch beyond `toleranceCents`
 * (default 0 — money is exact). The server must call this before honoring any client-supplied amount.
 */
export function verifyAmount(lines: CartLine[], discount: Discount | null | undefined, claimedCents: number, opts: { toleranceCents?: number } = {}): AmountVerdict {
  const expectedCents = orderTotal(lines, discount).totalCents;
  const deltaCents = Math.round(claimedCents) - expectedCents;
  const ok = Math.abs(deltaCents) <= (opts.toleranceCents ?? 0);
  return { ok, expectedCents, claimedCents: Math.round(claimedCents), deltaCents, ...(ok ? {} : { reason: "amount-mismatch" as const }) };
}

/**
 * A stable fingerprint of the priced cart (+ discount) — order-independent over lines. Two carts that should be
 * charged identically produce the same fingerprint; any price/qty/discount change produces a different one.
 */
export function cartFingerprint(lines: CartLine[], discount?: Discount | null): string {
  const norm = lines
    .map((l) => `${l.id ?? "?"}:${Math.round(l.unitCents)}x${Math.trunc(l.qty)}`)
    .sort()
    .join("|");
  const d = discount ? `${discount.type}:${discount.value}:${discount.minSubtotalCents ?? ""}` : "";
  const s = `${norm}#${d}`;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h.toString(16).padStart(8, "0");
}

/**
 * A deterministic idempotency key for a checkout attempt. The SAME cart under the same scope (principal) yields
 * the SAME key, so a retried "create payment intent" REUSES the existing intent instead of charging twice; a
 * changed cart yields a new key. Thread this into the processor's idempotency-key header.
 */
export function idempotencyKey(scope: string, lines: CartLine[], discount?: Discount | null): string {
  return `co_${scope}_${cartFingerprint(lines, discount)}`;
}
