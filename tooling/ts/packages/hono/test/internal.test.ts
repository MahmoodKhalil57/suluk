import { test, expect, describe } from "bun:test";
import { Hono } from "hono";
import { emitV4, enforceInternal, internalFetch } from "../src/index";

describe("internal routes — documented, grouped, not-hosted, test-invokable", () => {
  test("emitV4 stamps x-suluk-internal + groups an internal op under the 'Internal' tag", () => {
    const { document } = emitV4([
      { method: "post", path: "/api/email/send", name: "sendEmail", internal: true, tags: ["Email"], responses: [{ status: 200, description: "ok" }] },
    ]);
    const req = Object.values(document.paths)[0].requests.sendEmail as unknown as Record<string, unknown>;
    expect(req["x-suluk-internal"]).toBe(true);
    expect(req.tags).toContain("Internal"); // → Scalar's sidebar sections it under "Internal"
    expect(req.tags).toContain("Email"); // original tags preserved
  });

  test("enforceInternal 404s an internal op over the wire (dev + live) — not accidentally hosted", async () => {
    const internalOps = new Set(["/api/email/send"]);
    const app = new Hono();
    app.use("/api/*", enforceInternal((_m, p) => internalOps.has(p)));
    app.post("/api/email/send", (c) => c.json({ sent: true }));
    app.get("/api/public", (c) => c.json({ ok: true }));

    const gated = await app.fetch(new Request("http://x/api/email/send", { method: "POST" }));
    expect(gated.status).toBe(404); // an external caller can't reach it

    const publicOk = await app.fetch(new Request("http://x/api/public"));
    expect(publicOk.status).toBe(200); // non-internal ops are unaffected
  });

  test("internalFetch reaches the internal route in-process (the clean test method)", async () => {
    const internalOps = new Set(["/api/email/send"]);
    const app = new Hono();
    app.use("/api/*", enforceInternal((_m, p) => internalOps.has(p)));
    app.post("/api/email/send", (c) => c.json({ sent: true }));

    const res = await internalFetch(app, new Request("http://x/api/email/send", { method: "POST" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ sent: true });
  });

  test("the internal nonce is unforgeable — a hand-set header does NOT pass the guard", async () => {
    const app = new Hono();
    app.use("/api/*", enforceInternal(() => true));
    app.post("/api/x", (c) => c.json({ ok: true }));
    // an attacker guessing the header name but not the per-process nonce
    const forged = await app.fetch(new Request("http://x/api/x", { method: "POST", headers: { "x-suluk-internal-call": "guess" } }));
    expect(forged.status).toBe(404);
  });
});
