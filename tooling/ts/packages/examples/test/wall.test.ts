import { test, expect } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * @suluk/examples is the SHARED LEAF — it must stay zero-dependency and self-contained so it can sit BELOW both
 * @suluk/journeys and @suluk/sdk with no cycle, and on the VALUE side of the C040 wall (a pure projector core never
 * imports it). This asserts src/index.ts imports NOTHING (no @suluk, no relative, no bare module).
 */
test("src/index.ts is self-contained: no imports at all (zero-dep leaf)", () => {
  const body = readFileSync(join(import.meta.dir, "..", "src", "index.ts"), "utf8");
  expect(/^\s*import\s/m.test(body)).toBe(false);
  expect(/from\s+["']/.test(body)).toBe(false);
});
