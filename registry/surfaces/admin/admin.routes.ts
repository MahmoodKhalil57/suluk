/**
 * Admin routes (Suluk registry: `admin`) — Hono over the {@link Admin} Effect service. Mount: `app.route("/api/admin",
 * adminRoutes())`. Admin-scope is enforced GLOBALLY by `enforceApiKeyScope` (the contract mount) via the contract's
 * `admin` scope on `/api/admin` — so there is NO gating in the route itself. Yours to edit; the ledger aggregate stays in
 * `@suluk/credits`.
 *
 * Each route is defined with `@suluk/effect`'s `effectRoute`: the handler is an Effect whose ERROR CHANNEL bubbles up into
 * the contract as DETAILED, typed responses. `getAdminStats` is a pure READ with no in-handler failure branch (auth is the
 * global scope gate, not the handler), so its success STATUS is effect-derived (200) and its `errors` list is empty.
 */
import { Effect } from "effect";
import { z } from "zod";
import { effectRoute, routeGroup } from "@suluk/effect";
import { DbLive, type Bindings } from "../app";
import { Admin, AdminLive } from "../services/admin";

type Env = { Bindings: Bindings };
type Bind = Env["Bindings"];

// The module's ENVELOPE — its `.ops` bubbles up into the contract (replacing `admin.contract.ts`) and its `.router()` is the
// mount. The single source of truth for the `/api/admin/*` surface is the route below.
const admin = routeGroup("/api/admin");

/** Fully-provide an Admin program against the request's DB — the SAME layer stack the old `run` used, so the Effect's
 *  remaining requirements are discharged (`R = never`) before it reaches the effectRoute handler. */
const provide = <A, E>(env: Bind, program: Effect.Effect<A, E, Admin>): Effect.Effect<A, E, never> =>
  program.pipe(Effect.provide(AdminLive), Effect.provide(DbLive(env)));

// ── response body schema (the CURRENT success shape our route returns under `stats`) ──
/** The admin dashboard aggregate our route returns under `stats` — the generic ledger stats (issued/spent/outstanding)
 *  plus the module-owned transaction count; `users` is the app's to compose in (it owns the user table), so it's optional. */
const AdminStatsSchema = z.object({
  creditsIssued: z.number().int().describe("total credits granted across the ledger"),
  creditsSpent: z.number().int().describe("total credits debited across the ledger"),
  balanceOutstanding: z.number().int().describe("net outstanding credit balance (issued − spent)"),
  transactions: z.number().int().describe("module-owned count of credit-ledger rows"),
  users: z.number().int().optional().describe("total users — composed in by the app that owns the user table"),
});
const StatsBody = z.object({ stats: AdminStatsSchema });

// ══════════════════════════════════════════════════════════════════════════════════════════
// read — platform-wide aggregate stats. Pure read, no in-handler failure branch → errors: [].
// (admin-scope is enforced GLOBALLY by the contract's `admin` scope, not in this handler.)
// ══════════════════════════════════════════════════════════════════════════════════════════

// GET /api/admin/stats → { stats } aggregate ops/usage stats (admin-scoped by the global contract gate).
export const getAdminStatsRoute = admin.route(effectRoute({
  method: "get", path: "/api/admin/stats", name: "getAdminStats",
  summary: "Platform-wide credit + usage stats. ADMIN-only.",
  tags: ["Admin"], scopes: ["admin"],
  cost: { components: [], infra: { "worker.request": 1, "d1.read": 1 }, settlement: { method: "rate-limited" as const } },
  rateLimit: { windowMs: 60_000, maxRequests: 60, key: "principal" },
  ok: { status: 200, schema: StatsBody, description: "The aggregate platform stats." },
  errors: [],
  run: (c) => Effect.gen(function* () {
    const s = yield* Admin;
    return { stats: yield* s.stats() };
  }).pipe((p) => provide(c.env, p)),
}));

/** The `admin` module's CONTRACT fragment — bubbled up from the route above (replaces `admin.contract.ts`). */
export const adminOps = admin.ops;

/**
 * Mount every route's Effect handler at its sub-path — DERIVED from the envelope (`.router()`), so the mount can't drift
 * from the definitions.
 */
export function adminRoutes() {
  return admin.router();
}
