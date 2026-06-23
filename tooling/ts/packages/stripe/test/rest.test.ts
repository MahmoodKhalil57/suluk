/**
 * rest.ts — the Workers-safe StripeLike fetch impl. Pins toForm's bracket encoding (the load-bearing form-encoder
 * the helpers rely on) + the read surface (retrievePaymentIntent) over an injected fetch.
 */
import { test, expect, describe } from "bun:test";
import { toForm, restStripe, retrievePaymentIntent, stripeGet } from "../src/index";

describe("toForm", () => {
  test("flattens scalars, nested objects, and arrays into Stripe bracket notation", () => {
    const f = toForm({ email: "a@b.com", metadata: { orderId: 7 }, items: [{ price: "p_1", qty: 2 }] });
    expect(f.get("email")).toBe("a@b.com");
    expect(f.get("metadata[orderId]")).toBe("7");
    expect(f.get("items[0][price]")).toBe("p_1");
    expect(f.get("items[0][qty]")).toBe("2");
  });
  test("drops null/undefined", () => {
    const f = toForm({ a: 1, b: null, c: undefined });
    expect(f.has("b")).toBe(false);
    expect(f.has("c")).toBe(false);
    expect(f.get("a")).toBe("1");
  });
});

describe("rest read surface (injected fetch)", () => {
  const mockFetch = (status: number, body: unknown) => (async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;

  test("retrievePaymentIntent returns the parsed PI + builds the expand query", async () => {
    let seenUrl = "";
    const fetch = (async (url: string) => { seenUrl = url; return new Response(JSON.stringify({ id: "pi_1", metadata: { orderId: "42" } }), { status: 200 }); }) as unknown as typeof globalThis.fetch;
    const pi = await retrievePaymentIntent<{ metadata?: { orderId?: string } }>("sk_test", "pi_1", { expand: ["latest_charge"], fetch });
    expect(pi?.metadata?.orderId).toBe("42");
    expect(seenUrl).toContain("/payment_intents/pi_1");
    expect(seenUrl).toContain("expand[]=latest_charge");
  });

  test("stripeGet returns null on non-OK", async () => {
    expect(await stripeGet("sk_test", "payment_intents/x", { fetch: mockFetch(404, { error: {} }) })).toBeNull();
  });

  test("restStripe.customers.create posts form-encoded + parses the result", async () => {
    let body = "";
    const fetch = (async (_url: string, init: RequestInit) => { body = String(init.body); return new Response(JSON.stringify({ id: "cus_1" }), { status: 200 }); }) as unknown as typeof globalThis.fetch;
    const r = await restStripe("sk_test", { fetch }).customers.create({ email: "a@b.com" });
    expect((r as { id: string }).id).toBe("cus_1");
    expect(body).toContain("email=a%40b.com");
  });
});
