import { test, expect, describe } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * THE VALUE WALL (C040) — the mirror of the C039 hatch wall, one layer over. Examples are request/response VALUES, and
 * `examples.ts` SYNTHESIZES them. The deterministic PROJECTOR CORE (the vocabulary projection + the binder + the parser
 * + normalization) names only contract FACTS and must never reach the value-synthesis layer — otherwise a value could
 * leak into a place the D1 wall keeps fact-only. Subpath/module naming is not compiler-enforced, so this asserts it over
 * the source. It also pins `examples.ts` as SELF-CONTAINED (no journeys-internal, no external import) so it stays a
 * one-file extraction if @suluk/reference / @suluk/sdk later want the resolver.
 */
const src = (rel: string) => readFileSync(join(import.meta.dir, "..", "src", rel), "utf8");

// The pure projector core — produces contract-derived FACTS and the bind decision. It must not import the value layer.
const PROJECTOR_CORE = ["vocabulary.ts", "bind.ts", "gherkin.ts", "normalize.ts"];
const NO_EXAMPLES = /from\s+["']\.{1,2}\/examples["']/;

describe("C040 value wall — the projector core never imports the example/value synthesis layer", () => {
  for (const file of PROJECTOR_CORE) {
    test(`src/${file}: does not import ./examples`, () => {
      expect(NO_EXAMPLES.test(src(file))).toBe(false);
    });
  }

  test("src/examples.ts is a pure re-export of the shared @suluk/examples leaf (no relative value-layer import)", () => {
    const body = src("examples.ts");
    expect(/export\s+\*\s+from\s+["']@suluk\/examples["']/.test(body)).toBe(true);
    expect(/from\s+["']\.{1,2}\//.test(body)).toBe(false); // the impl lives in the leaf, not a journeys-relative file
  });
});
