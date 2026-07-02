/** The `erasure` module's CONTRACT fragment — its `/api/erasure/*` op. Composed via `src/contract.ops.ts`. */
import { z } from "zod";
import type { RouteContract } from "@suluk/hono";

/** The GDPR erasure receipt the cascade returns — the ordered names of the steps that ran (`c.json({ steps })`). */
const ErasureReceiptSchema = z.object({
  steps: z.array(z.string()),
});

export const erasureOps = [
  {
    method: "post",
    path: "/api/erasure/:userId",
    name: "eraseUser",
    summary: "Run the GDPR erasure cascade for a user across every subsystem. ADMIN-only; fail-closed (a failed step aborts with no receipt).",
    tags: ["Admin"],
    scopes: ["admin"],
    cost: { components: [], infra: { "worker.request": 1, "d1.write": 1, "d1.read": 1 }, settlement: { method: "rate-limited" } },
    request: { params: z.object({ userId: z.string() }) },
    responses: [{ status: 200, description: "The erasure cascade completed.", schema: ErasureReceiptSchema }],
    rateLimit: { windowMs: 60_000, maxRequests: 20, key: "principal" }, // destructive admin op → tight per-principal cap
    errors: [500], // fail-closed: a failed cascade step aborts with no receipt (500)
  },
] satisfies readonly RouteContract[];
