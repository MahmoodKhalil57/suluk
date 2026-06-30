import { test, expect } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * @suluk/stubgen is a zero-dependency leaf — it emits SOURCE TEXT, so it needs no runtime deps, and @suluk/core never
 * imports it (the C027 module-boundary rule: the deterministic core stays free of the higher tooling layers). This pins
 * both: src/index.ts imports nothing, and @suluk/core's barrel does not import @suluk/stubgen.
 */
test("src/index.ts is self-contained: no imports at all (zero-dep leaf)", () => {
  const body = readFileSync(join(import.meta.dir, "..", "src", "index.ts"), "utf8");
  expect(/^\s*import\s/m.test(body)).toBe(false);
  expect(/from\s+["']/.test(body)).toBe(false);
});

test("@suluk/core does not import @suluk/stubgen (the matcher stays free of the stub layer)", () => {
  const coreIndex = readFileSync(join(import.meta.dir, "..", "..", "core", "src", "index.ts"), "utf8");
  expect(coreIndex.includes("@suluk/stubgen")).toBe(false);
});
