/**
 * The `credits` module's CONTRACT fragment — the RouteContracts for its `/api/credits/*` ops (path/method/scope/summary +
 * the write-body schemas + the RESPONSE schemas). Composed into the app's v4 document + scope gate via `src/contract.ops.ts`
 * (the generator spreads every module's fragment). OWN your ops next to your routes — editing a route here re-projects the
 * doc; nothing central drifts.
 *
 * NOTE — declare `responses[].schema` (the success body) + `request.query`/`params` to make Scalar/reports show the response
 * shape + parameters. A `:userId` path segment auto-derives a required string path parameter even without `request.params`;
 * declare `request.params` only to give it a richer schema. This fragment is the reference exemplar for a fully-typed op.
 */
import { z } from "zod";
import type { RouteContract } from "@suluk/hono";

const Balance = z.object({ balance: z.number().int() });
const Transaction = z.object({ id: z.string(), userId: z.string(), amount: z.number().int(), reason: z.string(), createdAt: z.number() });

export const creditsOps = [
  { method: "get", path: "/api/credits", name: "getCredits", summary: "The caller's credit balance.", tags: ["Credits"], scopes: ["credits:read"], cost: { components: [], infra: { "worker.request": 1, "d1.read": 1 }, settlement: { method: "rate-limited" } }, rateLimit: { windowMs: 60_000, maxRequests: 60, key: "principal" }, responses: [{ status: 200, description: "The current credit balance.", schema: Balance }] },
  { method: "get", path: "/api/credits/balance/:userId", name: "getUserCredits", summary: "A specific user's credit balance (self/admin).", tags: ["Credits"], scopes: ["credits:read"], cost: { components: [], infra: { "worker.request": 1, "d1.read": 1 }, settlement: { method: "rate-limited" } }, rateLimit: { windowMs: 60_000, maxRequests: 60, key: "principal" }, responses: [{ status: 200, description: "The user's credit balance.", schema: Balance }] },
  { method: "get", path: "/api/credits/transactions", name: "listTransactions", summary: "The caller's recent credit ledger (grants + usage debits), newest first.", tags: ["Credits"], scopes: ["credits:read"], cost: { components: [], infra: { "worker.request": 1, "d1.read": 20 }, settlement: { method: "rate-limited" } }, rateLimit: { windowMs: 60_000, maxRequests: 60, key: "principal" }, responses: [{ status: 200, description: "The credit transaction ledger.", schema: z.object({ transactions: z.array(Transaction) }) }] },
  {
    method: "post", path: "/api/credits/debit", name: "debitCredits",
    summary: "Atomically debit metered credits; 402 when the balance can't cover the charge.",
    tags: ["Credits"], scopes: ["credits:write"],
    cost: { components: [], infra: { "worker.request": 1, "d1.write": 1, "d1.read": 1 }, settlement: { method: "rate-limited" } },
    rateLimit: { windowMs: 60_000, maxRequests: 30, key: "principal" },
    errors: [400, 402],
    request: { json: z.object({ userId: z.string().min(1), amount: z.number().int().positive(), reason: z.string().max(200).optional() }) },
    responses: [{ status: 200, description: "The debit was applied.", schema: z.object({ ok: z.boolean() }) }],
  },
  {
    method: "post", path: "/api/credits/grant", name: "grantCredits",
    summary: "Idempotent credit grant (money-IN, safe to retry — keyed on an idempotency key).",
    tags: ["Credits"], scopes: ["credits:write"],
    cost: { components: [], infra: { "worker.request": 1, "d1.write": 1, "d1.read": 1 }, settlement: { method: "rate-limited" } },
    rateLimit: { windowMs: 60_000, maxRequests: 30, key: "principal" },
    errors: [400],
    request: { json: z.object({ userId: z.string().min(1), amount: z.number().int().positive(), idemKey: z.string().min(1), reason: z.string().max(200).optional() }) },
    responses: [{ status: 200, description: "The grant was recorded (or replayed).", schema: z.object({ granted: z.number().int() }) }],
  },
] satisfies readonly RouteContract[];
