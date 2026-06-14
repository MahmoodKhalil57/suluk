/**
 * verifyStripeSignature — the SDK-free Web-Crypto webhook verifier. Pins a known-good signature (computed with the
 * same HMAC the verifier checks), a stale-timestamp rejection, and a tampered-body rejection. The constant-time
 * compare must have no early-out. These pin the behavior BEFORE dev + prod adopt this one verifier.
 */
import { test, expect, describe } from "bun:test";
import { verifyStripeSignature, timingSafeHexEqual } from "../src/index";

const SECRET = "whsec_test_secret";
const BODY = JSON.stringify({ id: "evt_1", type: "checkout.session.completed", data: { object: { id: "cs_1" } } });

/** Build a valid `stripe-signature` header (t=<ts>,v1=<HMAC-SHA256(`${ts}.${body}`)>) the way Stripe does. */
async function sign(body: string, secret: string, ts: number): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${ts}.${body}`));
  const v1 = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `t=${ts},v1=${v1}`;
}

describe("verifyStripeSignature", () => {
  const now = () => 1_700_000_000; // fixed clock

  test("accepts a fresh, correctly-signed payload", async () => {
    const sig = await sign(BODY, SECRET, 1_700_000_000);
    expect(await verifyStripeSignature(BODY, sig, SECRET, { now })).toBe(true);
  });

  test("rejects a stale timestamp beyond tolerance (replay)", async () => {
    const sig = await sign(BODY, SECRET, 1_700_000_000 - 600); // 10 min old, tolerance 300
    expect(await verifyStripeSignature(BODY, sig, SECRET, { now })).toBe(false);
  });

  test("rejects a tampered body (HMAC mismatch)", async () => {
    const sig = await sign(BODY, SECRET, 1_700_000_000);
    expect(await verifyStripeSignature(BODY + " ", sig, SECRET, { now })).toBe(false);
  });

  test("rejects a wrong secret, a missing v1, and empty inputs", async () => {
    const sig = await sign(BODY, SECRET, 1_700_000_000);
    expect(await verifyStripeSignature(BODY, sig, "whsec_wrong", { now })).toBe(false);
    expect(await verifyStripeSignature(BODY, "t=1700000000", SECRET, { now })).toBe(false);
    expect(await verifyStripeSignature("", sig, SECRET, { now })).toBe(false);
  });

  test("honors an injected tolerance window", async () => {
    const sig = await sign(BODY, SECRET, 1_700_000_000 - 60);
    expect(await verifyStripeSignature(BODY, sig, SECRET, { now, toleranceSec: 30 })).toBe(false);
    expect(await verifyStripeSignature(BODY, sig, SECRET, { now, toleranceSec: 120 })).toBe(true);
  });
});

describe("timingSafeHexEqual", () => {
  test("true on equal, false on differing same-length and differing-length", () => {
    expect(timingSafeHexEqual("deadbeef", "deadbeef")).toBe(true);
    expect(timingSafeHexEqual("deadbeef", "deadbef0")).toBe(false);
    expect(timingSafeHexEqual("dead", "deadbeef")).toBe(false);
  });
});
