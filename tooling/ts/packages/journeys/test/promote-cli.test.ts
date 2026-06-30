import { test, expect, describe } from "bun:test";
import { planPromotions, parseTargetSpec, miniDiff, type PromoteTargetSpec } from "../src/cli";
import { mkdtempSync, rmSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * C040-P4 CLI — `journeys promote` lifts a tester's @public Examples row into the Zod source. planPromotions is the pure
 * core (no fs); the bin is dry-run-by-default + --write (the reviewable safety model; a substrate operator runs
 * mizan_check_action_safety before --write).
 */
const featureText = ["Feature: f", "  Scenario Outline: charge", "    When I charge", "    @public", "    Examples:", "      | amountCents | currency |", "      | 100         | usd      |"].join("\n");
const source = `import { z } from "zod";\nexport const ChargeBody = z.object({ amountCents: z.number().int(), currency: z.string() });\n`;

describe("parseTargetSpec", () => {
  test('parses "<scenario>=<file>#<schemaVar>" (scenario may have spaces)', () => {
    expect(parseTargetSpec("subscribe then charge=src/validation.ts#ChargeBody")).toEqual({ scenario: "subscribe then charge", file: "src/validation.ts", schemaVar: "ChargeBody" });
  });
  test("rejects a malformed spec", () => {
    expect(parseTargetSpec("no-hash=file.ts")).toBeNull();
    expect(parseTargetSpec("nodelimiters")).toBeNull();
  });
});

describe("planPromotions", () => {
  const targets = new Map<string, PromoteTargetSpec>([["charge", { file: "validation.ts", schemaVar: "ChargeBody" }]]);

  test("applies the @public row to the target source (content-typed coercion)", () => {
    const plan = planPromotions([featureText], targets, { "validation.ts": source });
    expect(plan.rows[0]).toMatchObject({ scenario: "charge", schemaVar: "ChargeBody", status: "applied" });
    const file = plan.files.find((f) => f.file === "validation.ts")!;
    expect(file.changed).toBe(true);
    expect(file.updated).toContain('examples: [{"amountCents":100,"currency":"usd"}]'); // 100 → number, usd → string
    expect(file.updated).toContain("@suluk-public");
  });

  test("an unmapped scenario is reported as skipped, source unchanged", () => {
    const plan = planPromotions([featureText], new Map(), { "validation.ts": source });
    expect(plan.rows[0].status).toBe("skipped");
    expect(plan.files.every((f) => !f.changed)).toBe(true);
  });

  test("never-clobber surfaces as a skipped row (hand-authored examples present)", () => {
    const hand = `export const ChargeBody = z.object({ amountCents: z.number() }).meta({ examples: [{ amountCents: 1 }] });\n`;
    const plan = planPromotions([featureText], targets, { "validation.ts": hand });
    expect(plan.rows[0].status).toBe("skipped");
    expect(plan.rows[0].reason).toMatch(/not clobbering/i);
  });
});

describe("miniDiff", () => {
  test("marks removed/added lines with context", () => {
    const d = miniDiff("a\nb\nc\n", "a\nB\nc\n");
    expect(d).toContain("- b");
    expect(d).toContain("+ B");
  });
});

describe("bin: `journeys promote` end-to-end on disk", () => {
  test("dry run prints a diff but does NOT write; --write applies", () => {
    const dir = mkdtempSync(join(tmpdir(), "journeys-promote-"));
    try {
      const featDir = join(dir, "features");
      const src = join(dir, "validation.ts");
      mkdirSync(featDir);
      writeFileSync(join(featDir, "billing.feature"), featureText);
      writeFileSync(src, source);
      const bin = join(import.meta.dir, "..", "bin", "journeys.ts");
      const target = `charge=${src}#ChargeBody`;

      const dry = Bun.spawnSync(["bun", bin, "promote", "--features", featDir, "--target", target]);
      expect(dry.exitCode).toBe(0);
      expect(dry.stdout.toString()).toContain("@suluk-public");
      expect(dry.stdout.toString()).toContain("dry run");
      expect(readFileSync(src, "utf8")).toBe(source); // UNCHANGED on a dry run

      const wrote = Bun.spawnSync(["bun", bin, "promote", "--features", featDir, "--target", target, "--write"]);
      expect(wrote.exitCode).toBe(0);
      expect(wrote.stdout.toString()).toContain("wrote 1 file");
      expect(readFileSync(src, "utf8")).toContain("@suluk-public"); // applied on --write
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
