/**
 * TAX — a pluggable tax-rule adapter, so a store can swap or layer tax logic (a flat rate now; TaxJar / Stripe Tax /
 * jurisdiction tables / per-product rules later) WITHOUT touching checkout. Pure MATH + structure; the RULES (which
 * rate, where, what's taxable) are config the app supplies. All money is integer cents.
 *
 * The contract: a {@link TaxProvider} turns a {@link TaxInput} (the taxable base + destination + lines) into a
 * {@link TaxResult} (cents of tax, the effective rate, a label). Real tax is jurisdiction-specific — the default
 * {@link flatRateTax} is a clearly-labeled starter placeholder; production swaps in a real provider via the same shape.
 */

/** What a tax provider sees. `subtotalCents` is the TAXABLE base (typically post-discount). */
export interface TaxInput {
  subtotalCents: number;
  shippingCents?: number;
  address?: { country?: string; state?: string; postalCode?: string };
  /** per-line, when a provider needs item-level taxability (e.g. digital vs physical, exempt categories). */
  lines?: { id?: string | number; qty: number; taxable?: boolean }[];
}

/** The computed tax. `rate` is the effective fraction (0.08 = 8%); `label` shows on the order summary. */
export interface TaxResult { taxCents: number; rate?: number; label?: string }

/** A swappable tax-rule source. Implement `calculate` over any rules engine; the default is {@link flatRateTax}. */
export interface TaxProvider { id: string; calculate(input: TaxInput): TaxResult | Promise<TaxResult> }

const cents = (n: number) => Math.max(0, Math.round(Number.isFinite(n) ? n : 0));

/**
 * The default provider: a single FLAT rate on the taxable base (optionally including shipping). A starter placeholder
 * — swap for a jurisdiction-aware provider in production. `rate` is a fraction (0.08 = 8%); a non-positive rate ⇒ $0.
 */
export function flatRateTax(opts: { rate: number; label?: string; taxableShipping?: boolean; id?: string }): TaxProvider {
  return {
    id: opts.id ?? "flat",
    calculate(input) {
      const rate = Number.isFinite(opts.rate) && opts.rate > 0 ? opts.rate : 0;
      const base = cents(input.subtotalCents) + (opts.taxableShipping ? cents(input.shippingCents ?? 0) : 0);
      return { taxCents: Math.round(base * rate), rate, label: opts.label ?? "Tax" };
    },
  };
}

/** A no-op provider — tax-exempt, or handled externally (e.g. Stripe Tax computes it on the PaymentIntent). */
export function noTax(): TaxProvider {
  return { id: "none", calculate: () => ({ taxCents: 0 }) };
}

/** Resolve tax via the provider (or $0 when none configured). The server must compute this — never trust the client. */
export async function resolveTax(provider: TaxProvider | null | undefined, input: TaxInput): Promise<TaxResult> {
  if (!provider) return { taxCents: 0 };
  return provider.calculate(input);
}
