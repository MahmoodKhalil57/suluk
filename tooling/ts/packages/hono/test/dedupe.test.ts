import { test, expect, describe } from "bun:test";
import { Hono } from "hono";
import { enforceDedupe, MemoryDedupeStore } from "../src/dedupe";
import type { SulukDedupe } from "@suluk/core";

describe("MemoryDedupeStore — atomic reserve/complete/release", () => {
  test("a fresh key reserves; a second reserve of the SAME key while in-flight reports in-flight", () => {
    const s = new MemoryDedupeStore();
    const opts = { ttlMs: 60_000, now: 1_000 };
    expect(s.reserve("k", opts)).toEqual({ state: "fresh" });
    expect(s.reserve("k", opts)).toEqual({ state: "in-flight" }); // concurrent duplicate
  });

  test("complete() records the result; a later reserve of the same key replays it", () => {
    const s = new MemoryDedupeStore();
    const opts = { ttlMs: 60_000, now: 1_000 };
    s.reserve("k", opts);
    s.complete("k", { status: 201, body: '{"id":1}', contentType: "application/json" }, opts);
    expect(s.reserve("k", { ttlMs: 60_000, now: 2_000 })).toEqual({
      state: "completed",
      response: { status: 201, body: '{"id":1}', contentType: "application/json" },
    });
  });

  test("release() clears a reservation without recording a result — a retry can go fresh again", () => {
    const s = new MemoryDedupeStore();
    const opts = { ttlMs: 60_000, now: 1_000 };
    s.reserve("k", opts);
    s.release("k");
    expect(s.reserve("k", opts)).toEqual({ state: "fresh" });
  });

  test("a completed entry expires after its TTL — a repeated key past ttlMs re-runs fresh", () => {
    const s = new MemoryDedupeStore();
    s.reserve("k", { ttlMs: 1_000, now: 0 });
    s.complete("k", { status: 200, body: "ok", contentType: null }, { ttlMs: 1_000, now: 0 });
    expect(s.reserve("k", { ttlMs: 1_000, now: 500 }).state).toBe("completed");
    expect(s.reserve("k", { ttlMs: 1_000, now: 2_000 }).state).toBe("fresh"); // window rolled
  });

  test("distinct keys are independent", () => {
    const s = new MemoryDedupeStore();
    const opts = { ttlMs: 60_000, now: 0 };
    expect(s.reserve("a", opts)).toEqual({ state: "fresh" });
    expect(s.reserve("b", opts)).toEqual({ state: "fresh" }); // b unaffected by a's reservation
  });
});

describe("enforceDedupe middleware — facet-driven, header/body key sources, real 409 + result replay", () => {
  const HEADER_BUDGET: SulukDedupe = { ttlMs: 60_000, keySource: { header: "idempotency-key" } };
  const BODY_BUDGET: SulukDedupe = { ttlMs: 60_000, keySource: { bodyField: "clientRequestId" } };

  let calls = 0;
  function makeApp(facets: Record<string, SulukDedupe | undefined>, opts?: { now?: () => number }) {
    calls = 0;
    const byPath: Record<string, string> = { "/charge": "charge", "/create": "create", "/free": "free" };
    const app = new Hono();
    app.use(
      "*",
      enforceDedupe({
        operationOf: (c) => byPath[new URL(c.req.url).pathname],
        dedupeOf: (op) => facets[op],
        store: new MemoryDedupeStore(),
        now: opts?.now,
      }),
    );
    app.post("/charge", (c) => {
      calls++;
      return c.json({ chargeId: calls }, 201);
    });
    app.post("/create", async (c) => {
      calls++;
      const body = await c.req.json(); // proves the middleware's own c.req.json() peek didn't consume the stream
      return c.json({ echo: body, calls }, 201);
    });
    app.post("/free", (c) => {
      calls++;
      return c.json({ calls }, 200);
    });
    app.get("/static.css", (c) => c.text("body{}")); // non-contract path
    return app;
  }

  test("an op WITHOUT a facet is never deduped (runs every time)", async () => {
    const app = makeApp({ free: undefined });
    await app.request("/free", { method: "POST", headers: { "idempotency-key": "x" } });
    await app.request("/free", { method: "POST", headers: { "idempotency-key": "x" } });
    expect(calls).toBe(2);
  });

  test("no key extractable on the request (header absent) passes through unmetered", async () => {
    const app = makeApp({ charge: HEADER_BUDGET });
    await app.request("/charge", { method: "POST" });
    await app.request("/charge", { method: "POST" });
    expect(calls).toBe(2);
  });

  test("a fresh key runs the handler once; a repeated key REPLAYS the recorded response without re-running", async () => {
    const app = makeApp({ charge: HEADER_BUDGET });
    const first = await app.request("/charge", { method: "POST", headers: { "idempotency-key": "abc" } });
    expect(first.status).toBe(201);
    const firstBody = await first.json();
    expect(calls).toBe(1);

    const second = await app.request("/charge", { method: "POST", headers: { "idempotency-key": "abc" } });
    expect(second.status).toBe(201);
    expect(second.headers.get("x-suluk-dedupe-replay")).toBe("true");
    expect(await second.json()).toEqual(firstBody); // SAME body, handler did NOT run again
    expect(calls).toBe(1); // still 1 — the second request never reached the handler
  });

  test("a 5xx response is NEVER cached/replayed — a retry with the same key reaches the handler again (safe retries)", async () => {
    let attempt = 0;
    const app = new Hono();
    app.use(
      "*",
      enforceDedupe({
        operationOf: () => "flaky",
        dedupeOf: () => HEADER_BUDGET,
        store: new MemoryDedupeStore(),
      }),
    );
    app.post("/flaky", (c) => {
      attempt++;
      if (attempt === 1) return c.json({ error: "transient" }, 500); // an unexpected failure the FIRST time
      return c.json({ ok: true, attempt }, 200); // succeeds on a real retry
    });
    const first = await app.request("/flaky", { method: "POST", headers: { "idempotency-key": "retry-me" } });
    expect(first.status).toBe(500);
    expect(attempt).toBe(1);

    // a retry with the SAME idempotency key must reach the handler again — a cached 500 would permanently deny
    // every retry of a genuinely transient failure, defeating the whole point of an idempotency key.
    const second = await app.request("/flaky", { method: "POST", headers: { "idempotency-key": "retry-me" } });
    expect(second.status).toBe(200);
    expect(second.headers.get("x-suluk-dedupe-replay")).toBeNull(); // NOT a replay — the handler really ran again
    expect(attempt).toBe(2);
  });

  test("a distinct key runs independently (not deduped against a different key)", async () => {
    const app = makeApp({ charge: HEADER_BUDGET });
    await app.request("/charge", { method: "POST", headers: { "idempotency-key": "k1" } });
    await app.request("/charge", { method: "POST", headers: { "idempotency-key": "k2" } });
    expect(calls).toBe(2);
  });

  test("the body-field key source reads the declared field, and the real handler's OWN c.req.json() still sees the body", async () => {
    const app = makeApp({ create: BODY_BUDGET });
    const res = await app.request("/create", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ clientRequestId: "req-1", title: "hello" }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.echo).toEqual({ clientRequestId: "req-1", title: "hello" }); // the downstream handler's own .json() worked
    expect(calls).toBe(1);
  });

  test("a concurrent duplicate (reserved but not yet completed) gets 409 Conflict, not a re-run", async () => {
    const store = new MemoryDedupeStore();
    const app = new Hono();
    app.use(
      "*",
      enforceDedupe({
        operationOf: () => "slow",
        dedupeOf: () => ({ ttlMs: 60_000, keySource: { header: "idempotency-key" } }),
        store,
      }),
    );
    // simulate an in-flight reservation left by a request that hasn't completed yet.
    store.reserve("slow::inflight-key", { ttlMs: 60_000, now: Date.now() });
    app.post("/slow", (c) => c.json({}, 200));
    const res = await app.request("/slow", { method: "POST", headers: { "idempotency-key": "inflight-key" } });
    expect(res.status).toBe(409);
    expect(res.headers.get("content-type")).toContain("application/problem+json");
    const body = await res.json();
    expect(body).toMatchObject({ status: 409, title: "Conflict" });
  });

  test("a non-contract path passes straight through", async () => {
    const app = makeApp({ charge: HEADER_BUDGET });
    expect((await app.request("/static.css")).status).toBe(200);
  });
});
