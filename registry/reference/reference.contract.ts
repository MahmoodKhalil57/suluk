/** The `reference` module's CONTRACT fragment — its public `/api/reference/*` ops. Composed via `src/contract.ops.ts`. */
import type { RouteContract } from "@suluk/hono";

export const referenceOps = [
  { method: "get", path: "/api/reference", name: "listReference", summary: "The API tool reference — every operation with its summary + scope. Public.", tags: ["Reference"], responses: [{ status: 200, description: "The tool reference index." }] },
  { method: "get", path: "/api/reference/:tool", name: "getReference", summary: "The reference entry for one tool/operation. Public.", tags: ["Reference"], responses: [{ status: 200, description: "The tool reference entry." }] },
] satisfies readonly RouteContract[];
