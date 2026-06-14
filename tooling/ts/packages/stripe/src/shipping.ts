/**
 * SHIPPING — a pluggable rate-quoting adapter, so a store can swap or stack shipping providers (flat-rate now;
 * Shippo / EasyPost / Stripe-Shipping / carrier-specific later) WITHOUT touching checkout. Like {@link ./pricing},
 * this is pure MATH + structure; "which provider, what rates" is config the app supplies. All money is integer cents.
 *
 * The contract: a {@link ShippingProvider} turns a {@link ShippingInput} (the priced cart + an optional destination)
 * into zero-or-more {@link ShippingOption}s the buyer can pick. A DIGITAL-only cart quotes nothing (free, no method).
 */

/** What a provider sees: the priced cart, which lines physically ship, and an optional destination. */
export interface ShippingInput {
  subtotalCents: number;
  /** one entry per cart line; `requiresShipping` marks a physical good (absent/false ⇒ digital, never shipped). */
  lines: { id?: string | number; qty: number; requiresShipping?: boolean }[];
  address?: { country?: string; state?: string; postalCode?: string };
}

/** A quoted shipping method the buyer can choose. `amountCents` is integer minor units. */
export interface ShippingOption { id: string; label: string; amountCents: number; estimate?: string }

/** A swappable shipping-rate source. Implement `quote` over any carrier API; the default is {@link flatRateShipping}. */
export interface ShippingProvider { id: string; quote(input: ShippingInput): ShippingOption[] | Promise<ShippingOption[]> }

const cents = (n: number) => Math.max(0, Math.round(Number.isFinite(n) ? n : 0));

/** Does the cart contain anything that physically ships? (A digital-only cart needs no shipping at all.) */
export function cartNeedsShipping(input: ShippingInput): boolean {
  return (input.lines ?? []).some((l) => l && l.requiresShipping);
}

/**
 * The default provider: a single FLAT fee, optionally FREE over a subtotal threshold ("free shipping over $50").
 * Quotes nothing for a digital-only cart, so digital orders stay free + method-less.
 */
export function flatRateShipping(opts: { flatCents: number; freeOverCents?: number; label?: string; id?: string }): ShippingProvider {
  const id = opts.id ?? "flat";
  return {
    id,
    quote(input) {
      if (!cartNeedsShipping(input)) return [];
      const free = opts.freeOverCents != null && cents(input.subtotalCents) >= cents(opts.freeOverCents);
      return [{ id, label: opts.label ?? "Standard shipping", amountCents: free ? 0 : cents(opts.flatCents), estimate: "3–7 business days" }];
    },
  };
}

/** Compose several providers — the union of every provider's options (e.g. flat + an express carrier). */
export function combineShipping(...providers: ShippingProvider[]): ShippingProvider {
  return {
    id: "combined",
    async quote(input) { return (await Promise.all(providers.map((p) => p.quote(input)))).flat(); },
  };
}

/**
 * Resolve the buyer's CHOSEN option from a provider's quote — by id when given, else the cheapest. Returns null when
 * the cart needs no shipping (digital-only) so the caller adds a $0 / no-method line. The server must re-resolve
 * (never trust a client-sent amount) — pass only the chosen id.
 */
export async function resolveShipping(provider: ShippingProvider | null | undefined, input: ShippingInput, chosenId?: string): Promise<ShippingOption | null> {
  if (!provider) return null;
  const options = await provider.quote(input);
  if (!options.length) return null;
  return (chosenId ? options.find((o) => o.id === chosenId) : undefined) ?? options.slice().sort((a, b) => a.amountCents - b.amountCents)[0];
}
