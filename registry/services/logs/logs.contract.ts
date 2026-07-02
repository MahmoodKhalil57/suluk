/** The `logs` module's CONTRACT fragment — its `/api/logs/*` ops. Composed via `src/contract.ops.ts`. */
import type { RouteContract } from "@suluk/hono";
import { z } from "zod";

// One row of the append-only activity log — the exact shape both routes map from the `activity_log` table (`detail` is
// arbitrary JSON, `userId` nullable for system-originated actions, `createdAt` a ms-since-epoch number).
const LogEntrySchema = z.object({
  id: z.string(),
  userId: z.string().nullable(),
  action: z.string(),
  detail: z.unknown(),
  createdAt: z.number().int(),
});

// Both routes reply `{ logs: LogEntry[] }` (newest first).
const LogsResponseSchema = z.object({ logs: z.array(LogEntrySchema) });

export const logsOps = [
  {
    method: "get",
    path: "/api/logs",
    name: "listLogs",
    summary: "The caller's recent activity — an append-only action log.",
    tags: ["Activity"],
    scopes: ["logs:read"],
    rateLimit: { windowMs: 60_000, maxRequests: 60, key: "principal" },
    request: {
      query: z.object({
        userId: z.string().optional(),
        limit: z.coerce.number().int().min(1).max(1000).optional(),
      }),
    },
    errors: [400],
    responses: [{ status: 200, description: "Recent activity events.", schema: LogsResponseSchema }],
  },
  {
    method: "get",
    path: "/api/logs/query",
    name: "queryLogs",
    summary: "Filter the activity log by a parameterized DSL (action / principal / time window).",
    tags: ["Activity"],
    scopes: ["logs:read"],
    rateLimit: { windowMs: 60_000, maxRequests: 60, key: "principal" },
    request: {
      // Closed whitelist — every value compiles to a BOUND drizzle param (see the service). `action` may lead with `~`
      // for a substring match; `since` is a ms-since-epoch inclusive lower bound on `createdAt`.
      query: z.object({
        userId: z.string().optional(),
        action: z.string().optional(),
        since: z.coerce.number().int().optional(),
        limit: z.coerce.number().int().min(1).max(1000).optional(),
      }),
    },
    errors: [400],
    responses: [{ status: 200, description: "The filtered activity events.", schema: LogsResponseSchema }],
  },
] satisfies readonly RouteContract[];
