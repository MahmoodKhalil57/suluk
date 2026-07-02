/** The `reference` module's CONTRACT fragment — its public `/api/reference/*` ops. Composed via `src/contract.ops.ts`. */
import type { RouteContract } from "@suluk/hono";

export const referenceOps = [
  { method: "get", path: "/api/reference", name: "listReference", summary: "The v4-enhanced Scalar API reference PAGE over the derived contract. Public.", tags: ["Reference"], responses: [{ status: 200, description: "The Scalar reference page (HTML)." }] },
  { method: "get", path: "/api/reference/spec", name: "referenceSpec", summary: "The enriched (facet-badged) spec the reference's 'View as' toolbar re-fetches; `?view=anon` projects the public surface. Public.", tags: ["Reference"], responses: [{ status: 200, description: "The enriched OpenAPI spec (JSON), projected to the requested role." }] },
  { method: "get", path: "/api/reference/:tool", name: "getReference", summary: "The reference page FOCUSED on one tool/operation (by its by-name handle). Public.", tags: ["Reference"], responses: [{ status: 200, description: "The single-operation reference page (HTML)." }] },
] satisfies readonly RouteContract[];
