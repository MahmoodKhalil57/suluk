/**
 * The `credits` module's CONTRACT fragment — the RouteContracts for its `/api/credits/*` ops (path/method/scope/summary +
 * the write-body schemas). Composed into the app's v4 document + scope gate via `src/contract.ops.ts` (the generator spreads
 * every module's fragment). OWN your ops next to your routes — editing a route here re-projects the doc; nothing central drifts.
 */
import { z } from "zod";
import type { RouteContract } from "@suluk/hono";

export const creditsOps = [
  { method: "get", path: "/api/credits", name: "getCredits", summary: "The caller's credit balance.", tags: ["Credits"], scopes: ["credits:read"], responses: [{ status: 200, description: "The current credit balance." }] },
  { method: "get", path: "/api/credits/balance/:userId", name: "getUserCredits", summary: "A specific user's credit balance (self/admin).", tags: ["Credits"], scopes: ["credits:read"], responses: [{ status: 200, description: "The user's credit balance." }] },
  { method: "get", path: "/api/credits/transactions", name: "listTransactions", summary: "The caller's recent credit ledger (grants + usage debits), newest first.", tags: ["Credits"], scopes: ["credits:read"], responses: [{ status: 200, description: "The credit transaction ledger." }] },
  {
    method: "post", path: "/api/credits/debit", name: "debitCredits",
    summary: "Atomically debit metered credits; 402 when the balance can't cover the charge.",
    tags: ["Credits"], scopes: ["credits:write"], errors: [402],
    request: { json: z.object({ userId: z.string().min(1), amount: z.number().int().positive(), reason: z.string().max(200).optional() }) },
    responses: [{ status: 200, description: "The debit was applied." }],
  },
  {
    method: "post", path: "/api/credits/grant", name: "grantCredits",
    summary: "Idempotent credit grant (money-IN, safe to retry — keyed on an idempotency key).",
    tags: ["Credits"], scopes: ["credits:write"],
    request: { json: z.object({ userId: z.string().min(1), amount: z.number().int().positive(), idemKey: z.string().min(1), reason: z.string().max(200).optional() }) },
    responses: [{ status: 200, description: "The grant was recorded (or replayed)." }],
  },
] satisfies readonly RouteContract[];
