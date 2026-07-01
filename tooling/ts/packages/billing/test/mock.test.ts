import { test, expect } from "bun:test";
import { mockStripeFetch } from "../src/mock";
import { createCustomer } from "../src/billing";
import { stripePost, stripeGet } from "../src/transport";

const cfg = { secretKey: "sk_mock_local", fetch: mockStripeFetch() };

test("mockStripeFetch drives @suluk/billing's real transport — createCustomer returns a customer id", async () => {
  const id = await createCustomer(cfg, "dev@local.test", "user_1");
  expect(id).toMatch(/^cus_mock_/);
});

test("checkout/sessions → a completed session with a url (echoes success_url)", async () => {
  const form = new URLSearchParams({ success_url: "http://localhost:8787/ok", "line_items[0][price]": "price_x" });
  const res = await stripePost(cfg, "checkout/sessions", form);
  const body = (await res.json()) as any;
  expect(res.ok).toBe(true);
  expect(body.object).toBe("checkout.session");
  expect(body.url).toBe("http://localhost:8787/ok");
  expect(body.payment_status).toBe("paid");
});

test("generic parseable objects: subscription is active with a period end; prices is a list", async () => {
  const sub = (await (await stripeGet(cfg, "subscriptions/sub_x")).json()) as any;
  expect(sub.status).toBe("active");
  expect(typeof sub.current_period_end).toBe("number");
  expect(sub.latest_invoice.payment_intent.status).toBe("succeeded");
  const prices = (await (await stripeGet(cfg, "prices?lookup_keys[0]=pro&active=true&limit=1")).json()) as any;
  expect(prices.object).toBe("list");
  expect(prices.data[0].lookup_key).toBe("pro");
});
