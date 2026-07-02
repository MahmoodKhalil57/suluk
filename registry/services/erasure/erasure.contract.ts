/** The `erasure` module's CONTRACT fragment — its `/api/erasure/*` op. Composed via `src/contract.ops.ts`. */
import type { RouteContract } from "@suluk/hono";

export const erasureOps = [
  { method: "post", path: "/api/erasure/:userId", name: "eraseUser", summary: "Run the GDPR erasure cascade for a user across every subsystem. ADMIN-only; fail-closed (a failed step aborts with no receipt).", tags: ["Admin"], scopes: ["admin"], errors: [500], responses: [{ status: 200, description: "The erasure cascade completed." }] },
] satisfies readonly RouteContract[];
