/**
 * A {@link StripeLike} client over the Stripe REST API (fetch only — no SDK), so the @suluk/stripe helpers
 * (setupUsageBilling / stripeProvider / reportCostUsage / subscriptions) run on a Cloudflare Worker or any fetch
 * runtime. Stripe's API is form-encoded with bracket notation for nested params; {@link toForm} flattens the param
 * objects the helpers build. Plus the read surface ({@link stripeGet} / {@link retrievePaymentIntent}) the edge needs
 * for webhook PaymentIntent→order resolution and refund-state checks. `fetch` is injectable for testing.
 */
import type { StripeLike } from "./types";

type FetchLike = typeof fetch;
export interface RestStripeOptions { fetch?: FetchLike }

/** Flatten a params object into Stripe's bracket form-encoding (recurse objects + arrays). */
export function toForm(obj: Record<string, unknown>, prefix = "", form = new URLSearchParams()): URLSearchParams {
  for (const [k, v] of Object.entries(obj)) {
    if (v == null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (item && typeof item === "object") toForm(item as Record<string, unknown>, `${key}[${i}]`, form);
        else form.append(`${key}[${i}]`, String(item));
      });
    } else if (typeof v === "object") {
      toForm(v as Record<string, unknown>, key, form);
    } else {
      form.append(key, String(v));
    }
  }
  return form;
}

/** A duck-typed Stripe client backed by the REST API. `key` is the secret key. */
export function restStripe(key: string, opts: RestStripeOptions = {}): StripeLike {
  const f = opts.fetch ?? fetch;
  const post = async (path: string, params: Record<string, unknown>): Promise<any> => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const res = await f(`https://api.stripe.com/v1/${path}`, {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/x-www-form-urlencoded" },
      body: toForm(params).toString(),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((json as { error?: { message?: string } })?.error?.message ?? `Stripe ${path} failed (${res.status})`);
    return json;
  };
  return {
    customers: { create: (p) => post("customers", p) },
    products: { create: (p) => post("products", p) },
    prices: { create: (p) => post("prices", p) },
    subscriptions: { create: (p) => post("subscriptions", p) },
    billing: {
      meters: { create: (p) => post("billing/meters", p) },
      meterEvents: { create: (p) => post("billing/meter_events", p) },
    },
    billingPortal: { sessions: { create: (p) => post("billing_portal/sessions", p) } },
    // verifyWebhook isn't used by the REST adapter (the edge uses verifyStripeSignature) — stub to satisfy the type.
    webhooks: { constructEvent: () => { throw new Error("constructEvent not supported by the REST adapter; use verifyStripeSignature"); } },
  } as StripeLike;
}

/** Low-level authenticated GET → parsed JSON (null on non-OK / parse error). */
export async function stripeGet<T = unknown>(key: string, path: string, opts: RestStripeOptions = {}): Promise<T | null> {
  if (!key) return null;
  const f = opts.fetch ?? fetch;
  try {
    const r = await f(`https://api.stripe.com/v1/${path}`, { headers: { authorization: `Bearer ${key}` } });
    if (!r.ok) return null;
    return (await r.json().catch(() => null)) as T | null;
  } catch { return null; }
}

/** Retrieve a PaymentIntent, optionally expanding fields (e.g. `latest_charge`). Returns null if unresolvable. */
export async function retrievePaymentIntent<T = Record<string, unknown>>(key: string, id: string, opts: RestStripeOptions & { expand?: string[] } = {}): Promise<T | null> {
  if (!id) return null;
  const q = (opts.expand ?? []).map((e) => `expand[]=${encodeURIComponent(e)}`).join("&");
  return stripeGet<T>(key, `payment_intents/${encodeURIComponent(id)}${q ? "?" + q : ""}`, opts);
}
