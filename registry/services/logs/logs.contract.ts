/** The `logs` module's CONTRACT fragment — its `/api/logs/*` ops. Composed via `src/contract.ops.ts`. */
import type { RouteContract } from "@suluk/hono";

export const logsOps = [
  { method: "get", path: "/api/logs", name: "listLogs", summary: "The caller's recent activity — an append-only action log.", tags: ["Activity"], scopes: ["logs:read"], responses: [{ status: 200, description: "Recent activity events." }] },
  { method: "get", path: "/api/logs/query", name: "queryLogs", summary: "Filter the activity log by a parameterized DSL (action / principal / time window).", tags: ["Activity"], scopes: ["logs:read"], responses: [{ status: 200, description: "The filtered activity events." }] },
] satisfies readonly RouteContract[];
