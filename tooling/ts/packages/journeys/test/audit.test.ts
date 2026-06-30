import { test, expect, describe } from "bun:test";
import { buildAudit } from "../src/cli";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * C043 — the unified `journeys audit`: harden SECURITY + harden READINESS + journeys COVERAGE, folded by letter via
 * harden's combineGrades. Coverage is journeys-owned (needs the features); harden never depends on journeys.
 */
const docJson = JSON.stringify({
  openapi: "4.0.0-candidate",
  info: { title: "Billing" },
  paths: {
    "/charge": {
      requests: {
        charge: {
          method: "post",
          contentSchema: {
            type: "object",
            additionalProperties: false,
            required: ["amountCents", "balance"],
            properties: {
              amountCents: { type: "integer" }, // no maximum → a SECURITY finding
              balance: { type: "integer", "x-suluk-origin": "computed" }, // required+computed → a READINESS finding
            },
          },
        },
      },
    },
    "/health": { requests: { health: { method: "get", responses: { "200": { status: 200 } } } } },
  },
});
const feature = "Feature: f\n  Scenario: charge it\n    When I charge\n    Then it succeeds\n";

describe("buildAudit", () => {
  test("doc-only: security + readiness dimensions, no coverage, combined of 2", () => {
    const a = buildAudit(docJson);
    expect(a.combined.grades).toHaveLength(2);
    expect(a.coverage).toBeUndefined();
    expect(a.readiness.findings.some((f) => f.rule === "computed-required")).toBe(true);
    expect(a.security.findings.some((f) => f.rule === "number-maximum")).toBe(true);
  });

  test("with features: coverage dimension included (combined of 3), uncovered ops surfaced", () => {
    const a = buildAudit(docJson, [feature]);
    expect(a.combined.grades).toHaveLength(3);
    expect(a.coverage).toBeDefined();
    expect(a.coverage!.covered).toBe(1); // charge covered
    expect(a.coverage!.uncovered).toContain("health"); // health is a gap → generate an outline
  });

  test("the combined worst is the lowest dimension (the safe gate value)", () => {
    const a = buildAudit(docJson, [feature]);
    const ORDER = ["F", "D", "C", "B", "A"];
    const min = a.combined.grades.reduce((w, g) => (ORDER.indexOf(g) < ORDER.indexOf(w) ? g : w), "A");
    expect(a.combined.worst).toBe(min);
  });
});

describe("bin: `journeys audit` end-to-end", () => {
  const bin = join(import.meta.dir, "..", "bin", "journeys.ts");

  test("prints all three dimensions + a combined grade; --min gates", () => {
    const dir = mkdtempSync(join(tmpdir(), "journeys-audit-"));
    try {
      const docPath = join(dir, "openapi.json");
      const featDir = join(dir, "features");
      mkdirSync(featDir);
      writeFileSync(docPath, docJson);
      writeFileSync(join(featDir, "billing.feature"), feature);

      const run = Bun.spawnSync(["bun", bin, "audit", "--doc", docPath, "--features", featDir]);
      expect(run.exitCode).toBe(0);
      const out = run.stdout.toString();
      expect(out).toContain("security");
      expect(out).toContain("readiness");
      expect(out).toContain("coverage");
      expect(out).toContain("combined");
      expect(out).toContain("uncovered");

      // gate on an impossible-to-meet minimum → non-zero exit
      const gated = Bun.spawnSync(["bun", bin, "audit", "--doc", docPath, "--features", featDir, "--min", "A"]);
      expect(gated.exitCode).toBe(1);
      expect(gated.stderr.toString()).toContain("below the required A");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
