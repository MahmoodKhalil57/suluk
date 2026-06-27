import { test, expect } from "bun:test";
import { contractDoc } from "../src/index";

// contractDoc is contract() with a stricter input type: every route must be DOCUMENTED (summary or description). The
// runtime is identity; the enforcement is at the TYPE level, validated by this package's `tsc --noEmit` (tsconfig
// includes test/). The `@ts-expect-error` below FAILS typecheck if an undocumented route ever becomes assignable.

test("accepts a route documented via summary (identity at runtime, literal-preserving)", () => {
  const routes = contractDoc([{ method: "get", path: "/health", name: "health", summary: "Liveness check." }]);
  expect(routes).toHaveLength(1);
  expect(routes[0].name).toBe("health");
});

test("accepts a route documented via description", () => {
  const routes = contractDoc([{ method: "post", path: "/x", description: "Does X." }]);
  expect(routes).toHaveLength(1);
});

test("rejects an UNDOCUMENTED route at the type level (no summary, no description)", () => {
  // @ts-expect-error — neither summary nor description ⇒ not a DocumentedRoute
  const routes = contractDoc([{ method: "get", path: "/y", name: "y" }]);
  expect(routes).toHaveLength(1); // still identity at runtime; the guard is compile-time only
});
