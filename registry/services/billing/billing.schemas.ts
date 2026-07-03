/** Shared zod schemas for the `billing` module — the wire shapes both the routes (@suluk/effect `ok.schema`) and the
 *  contract fragment reuse, so the two can never drift on the payment-method / pack / plan shapes. */
import { z } from "zod";

/** A Stripe payment method (card + its billing address) as the billing panel shows it — the shape `s.cards()` returns. */
export const PaymentMethodSchema = z.object({
  id: z.string(),
  brand: z.string(),
  last4: z.string(),
  expMonth: z.number().int(),
  expYear: z.number().int(),
  name: z.string().nullable(),
  line1: z.string().nullable(),
  line2: z.string().nullable(),
  city: z.string().nullable(),
  region: z.string().nullable(),
  postalCode: z.string().nullable(),
  country: z.string().nullable(),
  isDefault: z.boolean(),
});

/** A credit pack in the server-authoritative pricing catalog. */
export const PackSchema = z.object({ id: z.string(), credits: z.number().int(), priceCents: z.number().int(), label: z.string() });

/** A subscription plan in the server-authoritative pricing catalog. */
export const PlanSchema = z.object({ id: z.string(), name: z.string(), credits: z.number().int(), priceCents: z.number().int(), label: z.string() });
