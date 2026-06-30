/**
 * Stripe Tax mechanics (C046, v2) — sales-tax / VAT for an on-site or auto top-up via the Tax Calculation API (raw
 * PaymentIntents don't support `automatic_tax`, unlike subscriptions/checkout), plus recording the finished calculation
 * as a Tax Transaction for compliance. GRACEFUL by design: no location or ANY failure yields `{ taxCents: 0 }` so a
 * top-up ALWAYS proceeds (covering the period before Stripe Tax is set up + any unregistered jurisdiction at $0).
 * Extracted verbatim with the source's res.ok / field semantics; plain typed JSON access (no Effect-Schema decode).
 */
import { type StripeConfig, stripePost, toForm } from "./transport";
import type { TaxAddress } from "./billing";

export interface TaxResult {
  taxCents: number;
  calculationId: string | null;
}

/** A buyer's tax location. The saved card's BILLING ADDRESS is preferred (precise + works off-session); the request IP is
 *  the fallback for a first on-session purchase where no card is saved yet. */
export interface TaxLocation {
  address?: TaxAddress | null;
  ip?: string | null;
}

/** Build Stripe `customer_details` for the Calculation API from the best available location, or null when none. */
const taxCustomerDetails = (loc: TaxLocation): Record<string, unknown> | null => {
  if (loc.address?.country)
    return {
      address: {
        country: loc.address.country,
        state: loc.address.state ?? undefined,
        postal_code: loc.address.postalCode ?? undefined,
        city: loc.address.city ?? undefined,
        line1: loc.address.line1 ?? undefined,
      },
      address_source: "billing",
    };
  if (loc.ip) return { ip_address: loc.ip };
  return null;
};

/**
 * Sales-tax / VAT for an on-site or auto top-up. The taxable base is the credits `subtotalCents` (tax_behavior=exclusive →
 * tax added on top); the processing service fee is a pass-through, not part of the taxable sale. Located by the saved
 * card's billing address (preferred — works off-session) or the request IP. GRACEFUL — no location or any failure yields
 * `{ taxCents: 0 }` so a top-up always proceeds. When active, the returned `calculationId` is recorded via
 * {@link recordTaxTransaction}.
 */
export async function calculateTax(cfg: StripeConfig, customerId: string, subtotalCents: number, loc: TaxLocation): Promise<TaxResult> {
  const customer_details = taxCustomerDetails(loc);
  if (!customer_details) return { taxCents: 0, calculationId: null }; // no location → can't compute; skip
  try {
    const res = await stripePost(
      cfg,
      "tax/calculations",
      toForm({
        currency: "usd",
        customer: customerId,
        line_items: [{ amount: subtotalCents, reference: "credits", tax_behavior: "exclusive" }],
        customer_details,
      }),
    );
    if (!res.ok) return { taxCents: 0, calculationId: null }; // inactive / unlocatable → no tax, top-up still proceeds
    const calc = (await res.json()) as { tax_amount_exclusive?: number; id?: string };
    return { taxCents: calc?.tax_amount_exclusive ?? 0, calculationId: calc?.id ?? null };
  } catch {
    return { taxCents: 0, calculationId: null };
  }
}

/** Record a finished tax calculation as a Tax Transaction (the compliance/reporting step), keyed to a `reference`
 *  (e.g. `pi:<id>`) which is Stripe's idempotency anchor — a replay of the same reference returns the existing
 *  transaction rather than creating a second, so re-delivery can't double-record. Best-effort — never throws into the
 *  caller (the charge already succeeded; a missed record is reconciled manually). */
export async function recordTaxTransaction(cfg: StripeConfig, calculationId: string, reference: string): Promise<void> {
  try {
    const res = await stripePost(cfg, "tax/transactions/create_from_calculation", toForm({ calculation: calculationId, reference }));
    if (!res.ok) console.warn(`[stripe-tax] tax transaction NOT recorded for ${reference} (calc ${calculationId}, http ${res.status}) — reconcile manually`);
  } catch (e) {
    console.warn(`[stripe-tax] tax transaction record threw for ${reference} (calc ${calculationId})`, e);
  }
}
