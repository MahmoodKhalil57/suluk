/** The `admin` module's CONTRACT fragment — its `/api/admin/*` op. Composed via `src/contract.ops.ts`. */
import { z } from "zod";
import type { RouteContract } from "@suluk/hono";

/** The admin dashboard aggregate our route returns under `stats` — the generic ledger stats (issued/spent/outstanding)
 *  plus the module-owned transaction count; `users` is the app's to compose in (it owns the user table), so it's optional. */
const AdminStatsSchema = z.object({
  creditsIssued: z.number().int().describe("total credits granted across the ledger"),
  creditsSpent: z.number().int().describe("total credits debited across the ledger"),
  balanceOutstanding: z.number().int().describe("net outstanding credit balance (issued − spent)"),
  transactions: z.number().int().describe("module-owned count of credit-ledger rows"),
  users: z.number().int().optional().describe("total users — composed in by the app that owns the user table"),
});

export const adminOps = [
  {
    method: "get",
    path: "/api/admin/stats",
    name: "getAdminStats",
    summary: "Platform-wide credit + usage stats. ADMIN-only.",
    cost: { components: [], infra: { "worker.request": 1, "d1.read": 1 }, settlement: { method: "rate-limited" } },
    tags: ["Admin"],
    scopes: ["admin"],
    rateLimit: { windowMs: 60_000, maxRequests: 60, key: "principal" },
    errors: [401, 403],
    responses: [
      {
        status: 200,
        description: "The aggregate platform stats.",
        schema: z.object({ stats: AdminStatsSchema }),
      },
    ],
  },
] satisfies readonly RouteContract[];
