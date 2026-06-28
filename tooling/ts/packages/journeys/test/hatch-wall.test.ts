import { test, expect, describe } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * THE CONTRACT WALL (C039) — the security council's strongest, verified property: the deterministic core of
 * @suluk/journeys (the vocabulary projection + the binder) must NEVER transitively reach the escape hatches, the CF
 * write-client, raw fetch, or env. A hatch is runtime IO over live state; it is invisible to the contract and the
 * request→operation matcher. Subpath naming alone is not compiler-enforced, so this asserts it over the source.
 */
const src = (rel: string) => readFileSync(join(import.meta.dir, "..", "src", rel), "utf8");

// The deterministic projector/binder core: produces the contract-derived artifacts and the bind decision. It must do
// NO runtime IO and reach NOTHING in the hatch/CF/env/fetch world — not even reference it.
const PROJECTOR_CORE = ["vocabulary.ts", "bind.ts", "gherkin.ts", "normalize.ts"];
const NO_IO = [/from\s+["']\.{1,2}\/hatch/, /@suluk\/cloudflare/, /@suluk\/env/, /\bprocess\.env\b/, /\bfetch\s*\(/];

// The emitter + the package barrel: the emitter is the user-path bridge (it may import @suluk/sdk and EMIT a
// `process.env.SULUK_BASE_URL` string into the generated suite), but neither may import the hatch or the CF write-client.
const BRIDGE = ["emit.ts", "index.ts"];
const NO_HATCH = [/from\s+["']\.{1,2}\/hatch/, /@suluk\/cloudflare/];

describe("C039 contract wall — the deterministic core never reaches the hatch / CF write-client / fetch / env", () => {
  for (const file of PROJECTOR_CORE) {
    test(`src/${file}: no hatch, no @suluk/cloudflare, no env, no fetch (pure projection)`, () => {
      for (const pattern of NO_IO) expect(pattern.test(src(file))).toBe(false);
    });
  }
  for (const file of BRIDGE) {
    test(`src/${file}: imports neither the hatch nor the CF write-client`, () => {
      for (const pattern of NO_HATCH) expect(pattern.test(src(file))).toBe(false);
    });
  }
  test("the hatch DOES live in its own subtree (the CF client is imported only under hatch/, never in the core)", () => {
    expect(/@suluk\/cloudflare/.test(src("hatch/backends.ts"))).toBe(true);
    expect(/@suluk\/cloudflare/.test(src("index.ts"))).toBe(false);
  });
});
