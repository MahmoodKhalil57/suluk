/**
 * @deprecated MOVED to @suluk/payments (C048). This is a re-export shim for backward compatibility — import the pricing
 * primitives from `@suluk/payments` instead. This file exists only so existing `@suluk/stripe` imports keep working.
 */
export {
  subtotal, computeDiscountAmount, validateDiscount, prorateDiscount, orderTotal, composeTotal, verifyAmount,
  cartFingerprint, idempotencyKey, requiresStripe, STRIPE_MIN_CHARGE_CENTS,
  type CartLine, type Discount, type DiscountResult, type DiscountRejection, type OrderTotal, type OrderTotalFull, type AmountVerdict,
} from "@suluk/payments";
