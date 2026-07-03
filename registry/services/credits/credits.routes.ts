/**
 * Credit-ledger routes (Suluk registry: `credits`) — Hono over the {@link Credits} Effect service. Each route is defined
 * with `@suluk/effect`'s `effectRoute`: the handler is an Effect whose ERROR CHANNEL bubbles up into the contract as
 * DETAILED, typed responses (402 PaymentError with `{ required, balance }`) instead of a bare `c.json(..., 402)` with
 * no documented body. Each route's `contract` is spread into `./credits.contract` so the
 * doc/Scalar/SDK show those exact error shapes and the route + its contract can't drift.
 *
 * Mount: `app.route("/api/credits", creditsRoutes())` — the paths below are the full surface (`/api/credits/*`), the
 * router mounts each handler at its sub-path (toolfactory parity). The ledger logic stays in `@suluk/credits`.
 */
import { Hono } from "hono";
import { Effect } from "effect";
import { z } from "zod";
import { effectRoute, PaymentError } from "@suluk/effect";
import { DbLive, type Bindings } from "../app";
import { Credits, CreditsLive } from "../services/credits";

type Env = { Bindings: Bindings };
type Bind = Env["Bindings"];

/** Fully-provide a Credits program against the request's DB — the SAME layer stack the old `run` used, so the Effect's
 *  remaining requirements are discharged (`R = never`) before it reaches the effectRoute handler. */
const provide = <A, E>(env: Bind, program: Effect.Effect<A, E, Credits>): Effect.Effect<A, E, never> =>
  program.pipe(Effect.provide(CreditsLive), Effect.provide(DbLive(env)));

// ── response body schemas (the CURRENT success shapes; the ledger row mirrors `@suluk/credits`'s `LedgerEntry`) ──
const BalanceBody = z.object({ balance: z.number().int() });
/** A ledger row exactly as `s.transactions()` (`LedgerEntry`) returns it — id, signed delta, reason, epoch ms, optional cash. */
const LedgerEntrySchema = z.object({
  id: z.string(),
  delta: z.number().int(),
  reason: z.string(),
  createdAt: z.number(),
  amountCents: z.number().int().nullable(),
});
const TransactionsBody = z.object({ transactions: z.array(LedgerEntrySchema) });
const DebitBody = z.object({ ok: z.boolean() });
const GrantBody = z.object({ granted: z.boolean() });

// ── request body schemas ──
const DebitReq = z.object({ userId: z.string().min(1), amount: z.number().int().positive(), reason: z.string().max(200).optional() });
const GrantReq = z.object({ userId: z.string().min(1), amount: z.number().int().positive(), idemKey: z.string().min(1), reason: z.string().max(200).optional() });

// Standard cost blocks (preserved from the current contract).
const COST_READ_1 = { components: [], infra: { "worker.request": 1, "d1.read": 1 }, settlement: { method: "rate-limited" as const } };
const COST_READ_20 = { components: [], infra: { "worker.request": 1, "d1.read": 20 }, settlement: { method: "rate-limited" as const } };
const COST_WRITE = { components: [], infra: { "worker.request": 1, "d1.write": 1, "d1.read": 1 }, settlement: { method: "rate-limited" as const } };

// ══════════════════════════════════════════════════════════════════════════════════════════
// reads — a specific user's balance + their ledger. Pure reads, no failure branch → errors: [].
// ══════════════════════════════════════════════════════════════════════════════════════════

// GET /balance/:userId → { balance }. A required path param (:userId) — no failure branch in the current code.
export const getUserCreditsRoute = effectRoute({
  method: "get", path: "/api/credits/balance/:userId", name: "getUserCredits",
  summary: "A specific user's credit balance (self/admin).",
  tags: ["Credits"], scopes: ["credits:read"], cost: COST_READ_1,
  rateLimit: { windowMs: 60_000, maxRequests: 60, key: "principal" },
  ok: { status: 200, schema: BalanceBody, description: "The user's credit balance." },
  errors: [],
  run: (c) => Effect.gen(function* () {
    const s = yield* Credits;
    return { balance: yield* s.balance(c.req.param("userId")!) }; // :userId is a required path param — always present
  }).pipe((p) => provide(c.env, p)),
});

// GET /transactions/:userId → { transactions }. Pure read; no failure branch in the current code.
export const listTransactionsRoute = effectRoute({
  method: "get", path: "/api/credits/transactions/:userId", name: "listTransactions",
  summary: "The caller's recent credit ledger (grants + usage debits), newest first.",
  tags: ["Credits"], scopes: ["credits:read"], cost: COST_READ_20,
  rateLimit: { windowMs: 60_000, maxRequests: 60, key: "principal" },
  ok: { status: 200, schema: TransactionsBody, description: "The credit transaction ledger." },
  errors: [],
  run: (c) => Effect.gen(function* () {
    const s = yield* Credits;
    return { transactions: yield* s.transactions(c.req.param("userId")!) }; // :userId is a required path param — always present
  }).pipe((p) => provide(c.env, p)),
});

// ══════════════════════════════════════════════════════════════════════════════════════════
// writes — metered debit (402 when uncovered) + idempotent grant.
// ══════════════════════════════════════════════════════════════════════════════════════════

// POST /debit { userId, amount, reason } — atomic metered debit; the old `c.json({ ok }, ok ? 200 : 402)` becomes a
// success 200 on cover, or a TYPED 402 PaymentError { required: amount, balance } when the ledger can't cover it.
export const debitCreditsRoute = effectRoute({
  method: "post", path: "/api/credits/debit", name: "debitCredits",
  summary: "Atomically debit metered credits; 402 when the balance can't cover the charge.",
  tags: ["Credits"], scopes: ["credits:write"], cost: COST_WRITE,
  rateLimit: { windowMs: 60_000, maxRequests: 30, key: "principal" },
  request: { json: DebitReq },
  ok: { status: 200, schema: DebitBody, description: "The debit was applied." },
  errors: [PaymentError],
  run: (c) => Effect.gen(function* () {
    const { userId, amount, reason } = yield* Effect.promise(() => c.req.json<{ userId: string; amount: number; reason?: string }>());
    const s = yield* Credits;
    const ok = yield* s.debit(userId, amount, reason ?? "usage");
    if (!ok) {
      const balance = yield* s.balance(userId);
      return yield* new PaymentError({ required: amount, balance });
    }
    return { ok };
  }).pipe((p) => provide(c.env, p)),
});

// POST /grant { userId, amount, idemKey, reason } — idempotent money-IN (safe to retry; keyed on idemKey). The service
// returns a boolean (granted this call vs. replayed); the current handler has NO in-handler failure branch (bad input is
// caught by the request schema at the framework layer), so no typed error is declared → errors: [].
export const grantCreditsRoute = effectRoute({
  method: "post", path: "/api/credits/grant", name: "grantCredits",
  summary: "Idempotent credit grant (money-IN, safe to retry — keyed on an idempotency key).",
  tags: ["Credits"], scopes: ["credits:write"], cost: COST_WRITE,
  rateLimit: { windowMs: 60_000, maxRequests: 30, key: "principal" },
  request: { json: GrantReq },
  ok: { status: 200, schema: GrantBody, description: "The grant was recorded (or replayed)." },
  errors: [],
  run: (c) => Effect.gen(function* () {
    const { userId, amount, idemKey, reason } = yield* Effect.promise(() => c.req.json<{ userId: string; amount: number; idemKey: string; reason?: string }>());
    const s = yield* Credits;
    const granted = yield* s.grant(userId, amount, idemKey, reason);
    return { granted };
  }).pipe((p) => provide(c.env, p)),
});

/**
 * Mount every route's Effect handler at its sub-path. Each handler runs its fully-provided Effect, renders the success at
 * its declared status, and maps any typed failure to its status + typed body (never a generic ProblemDetails).
 */
export function creditsRoutes() {
  const r = new Hono<Env>();

  // ── reads ──
  r.get("/balance/:userId", getUserCreditsRoute.handler);
  r.get("/transactions/:userId", listTransactionsRoute.handler);

  // ── writes ──
  r.post("/debit", debitCreditsRoute.handler);
  r.post("/grant", grantCreditsRoute.handler);

  return r;
}
