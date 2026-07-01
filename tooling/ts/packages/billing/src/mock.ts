/**
 * `mockStripeFetch` (C057) — a mock Stripe HTTP transport for LOCAL DEV. A drop-in `fetch` (injected as the
 * `StripeConfig.fetch` seam via `env.STRIPE_FETCH`) that intercepts `api.stripe.com/v1/*` and returns GENERIC, parseable
 * objects for every endpoint @suluk/billing calls — so the billing routes work with ZERO Stripe account or key. It lives
 * HERE, in @suluk/billing, because this package owns the request/response SHAPES its parsers read (customers, checkout
 * sessions, subscriptions, prices, payment methods, tax, refunds), so the fake and the parser co-evolve. Mock-until-keyed:
 * the dev entry injects this only when no real `STRIPE_SECRET_KEY` is present; a provisioned app hits real Stripe.
 *
 * It is NOT a stateful Stripe simulator — responses are generic (a fresh id + plausible fields), not a ledger. Credit
 * fulfilment is webhook-driven (checkout.session.completed → credits.grant); the mock returns a COMPLETED checkout but
 * does not itself deliver the webhook, so a local "buy credits" needs the webhook fired manually (or real Stripe).
 */

const rid = (prefix: string): string => `${prefix}_mock_${Math.random().toString(36).slice(2, 12)}`;
const nowSec = (): number => Math.floor(Date.now() / 1000);
const jsonResponse = (obj: unknown, status = 200): Response =>
  new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });

/** Build a mock Stripe `fetch`. Returns generic objects for the endpoints @suluk/billing drives; a permissive fallback
 *  for anything else. Ignores the auth header (any/no key works). */
export function mockStripeFetch(): typeof fetch {
  return (async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : (input as Request).url;
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/^\/v1\//, "");
    const seg = path.split("/");
    // params come from the POST body (form-encoded) OR the GET query string — read either.
    const body = new URLSearchParams(typeof init?.body === "string" ? init.body : "");
    const form = { get: (k: string): string | null => body.get(k) ?? parsed.searchParams.get(k), [Symbol.iterator]: () => body[Symbol.iterator]() };

    // customers, customers/{id}
    if (seg[0] === "customers") return jsonResponse({ id: seg[1] ?? rid("cus"), object: "customer", email: form.get("email") ?? "dev@local.test", name: form.get("name") ?? null, metadata: {}, invoice_settings: { default_payment_method: null } });

    // checkout/sessions — a COMPLETED session (redirect to the app's own success_url)
    if (path === "checkout/sessions") { const cid = rid("cs"); return jsonResponse({ id: cid, object: "checkout.session", url: form.get("success_url") ?? "http://localhost:8787/billing/success", status: "complete", payment_status: "paid", amount_total: Number(form.get("amount_total") ?? form.get("line_items[0][price_data][unit_amount]") ?? 0), currency: "usd", customer: form.get("customer") ?? rid("cus"), subscription: null, payment_intent: rid("pi"), metadata: Object.fromEntries([...form].filter(([k]) => k.startsWith("metadata["))) }); }

    // billing_portal/sessions
    if (path === "billing_portal/sessions") return jsonResponse({ id: rid("bps"), object: "billing_portal.session", url: form.get("return_url") ?? "http://localhost:8787/billing" });

    // subscriptions, subscriptions/{id}
    if (seg[0] === "subscriptions") return jsonResponse({ id: seg[1] ?? rid("sub"), object: "subscription", status: "active", current_period_end: nowSec() + 30 * 86400, cancel_at_period_end: form.get("cancel_at_period_end") === "true", customer: rid("cus"), latest_invoice: { id: rid("in"), object: "invoice", status: "paid", hosted_invoice_url: "http://localhost:8787/invoice", payment_intent: { id: rid("pi"), object: "payment_intent", client_secret: rid("pi") + "_secret", status: "succeeded" } }, items: { object: "list", data: [{ id: rid("si"), price: { id: rid("price"), object: "price" } }] } });

    // payment_methods list / detach
    if (seg[0] === "payment_methods" && path.endsWith("/detach")) return jsonResponse({ id: seg[1], object: "payment_method", customer: null });
    if (seg[0] === "payment_methods") return jsonResponse({ object: "list", has_more: false, data: [{ id: rid("pm"), object: "payment_method", type: "card", card: { brand: "visa", last4: "4242", exp_month: 12, exp_year: 2032 } }] });

    // prices, products
    if (seg[0] === "prices") return jsonResponse({ object: "list", has_more: false, data: [{ id: rid("price"), object: "price", active: true, unit_amount: 1000, currency: "usd", lookup_key: form.get("lookup_keys[0]") ?? null, recurring: { interval: "month" }, product: rid("prod") }] });
    if (seg[0] === "products") return jsonResponse({ id: rid("prod"), object: "product", active: true, default_price: rid("price") });

    // intents
    if (seg[0] === "payment_intents") return jsonResponse({ id: rid("pi"), object: "payment_intent", client_secret: rid("pi") + "_secret", status: "succeeded", amount: Number(form.get("amount") ?? 0), currency: "usd" });
    if (seg[0] === "setup_intents") return jsonResponse({ id: rid("si"), object: "setup_intent", client_secret: rid("si") + "_secret", status: "succeeded" });

    // tax
    if (seg[0] === "tax") return jsonResponse({ id: rid("tax"), object: "tax.transaction", amount_total: Number(form.get("amount") ?? 0), tax_amount_exclusive: 0, tax_breakdown: [] });

    // invoices/{id}/pay, charges, refunds
    if (seg[0] === "invoices" && path.endsWith("/pay")) return jsonResponse({ id: seg[1], object: "invoice", status: "paid", hosted_invoice_url: "http://localhost:8787/invoice" });
    if (seg[0] === "charges") return jsonResponse({ object: "list", has_more: false, data: [] });
    if (seg[0] === "refunds") return jsonResponse({ id: rid("re"), object: "refund", status: "succeeded", amount: Number(form.get("amount") ?? 0) });

    // permissive generic fallback — a fresh id + the resource name as `object`
    return jsonResponse({ id: rid(seg[0] || "obj"), object: seg[0] || "object", data: [] });
  }) as typeof fetch;
}
