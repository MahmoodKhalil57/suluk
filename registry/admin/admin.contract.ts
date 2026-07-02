/** The `admin` module's CONTRACT fragment — its `/api/admin/*` op. Composed via `src/contract.ops.ts`. */
import type { RouteContract } from "@suluk/hono";

export const adminOps = [
  { method: "get", path: "/api/admin/stats", name: "getAdminStats", summary: "Platform-wide credit + usage stats. ADMIN-only.", tags: ["Admin"], scopes: ["admin"], responses: [{ status: 200, description: "The aggregate platform stats." }] },
] satisfies readonly RouteContract[];
