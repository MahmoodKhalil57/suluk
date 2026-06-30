import { test, expect, describe } from "bun:test";
import { buildDemoFiles } from "../src/cli";
import { mkdtempSync, rmSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * C042 CLI — `journeys demos` compiles `.feature` files into a Bruno/Postman demo collection on disk. buildDemoFiles is
 * the pure core (no fs); the bin is thin IO around it. Both are exercised here (unit + an end-to-end spawn).
 */
const docJson = JSON.stringify({
  openapi: "4.0.0-candidate",
  info: { title: "Billing" },
  paths: {
    "/subs": { requests: { createSubscription: { method: "post", contentSchema: { type: "object", required: ["plan"], properties: { plan: { type: "string" } } }, responses: { "200": { status: 200 } }, "x-suluk-access": { requires: "authenticated" } } } },
    "/charge": { requests: { charge: { method: "post", contentSchema: { type: "object", required: ["amountCents", "subscriptionId"], properties: { amountCents: { type: "integer", minimum: 100 }, subscriptionId: { type: "string", "x-suluk-origin": "sourced", "x-suluk-from": { op: "createSubscription", select: "id" } } } }, responses: { "200": { status: 200 } }, "x-suluk-access": { requires: "authenticated" } } } },
  },
});
const featureText = "Feature: billing demo\n  Scenario: subscribe then charge\n    When I create subscription\n    And I charge\n";

describe("buildDemoFiles", () => {
  test("format bruno → a Bruno file map (chaining preserved)", () => {
    const r = buildDemoFiles(docJson, [featureText], { format: "bruno", baseUrl: "https://api.example.com" });
    expect([r.scenarios, r.requests]).toEqual([1, 2]);
    expect(r.files["bruno.json"]).toBeDefined();
    expect(r.files["environments/prod.bru"]).toContain("https://api.example.com");
    expect(r.files["subscribe-then-charge/2-charge.bru"]).toContain('"subscriptionId": "{{createSubscription_id}}"');
  });

  test("format postman → a single v2.1 collection json", () => {
    const r = buildDemoFiles(docJson, [featureText], { format: "postman", name: "Billing" });
    expect(Object.keys(r.files)).toEqual(["billing.postman_collection.json"]);
    expect(JSON.parse(r.files["billing.postman_collection.json"]).info.schema).toContain("v2.1.0");
  });

  test("format both → bruno/ and postman/ prefixed, no collision", () => {
    const r = buildDemoFiles(docJson, [featureText], { format: "both", name: "Billing" });
    expect(r.files["bruno/bruno.json"]).toBeDefined();
    expect(r.files["postman/billing.postman_collection.json"]).toBeDefined();
  });

  test("name defaults to the contract's info.title", () => {
    const r = buildDemoFiles(docJson, [featureText], { format: "postman" });
    expect(r.files["billing.postman_collection.json"]).toBeDefined();
  });
});

describe("bin: `journeys demos` end-to-end on disk", () => {
  test("writes the collection files to --out (real spawn)", () => {
    const dir = mkdtempSync(join(tmpdir(), "journeys-cli-"));
    try {
      const docPath = join(dir, "openapi.json");
      const featDir = join(dir, "features");
      const outDir = join(dir, "out");
      mkdirSync(featDir);
      writeFileSync(docPath, docJson);
      writeFileSync(join(featDir, "billing.feature"), featureText);

      const bin = join(import.meta.dir, "..", "bin", "journeys.ts");
      const proc = Bun.spawnSync(["bun", bin, "demos", "--doc", docPath, "--features", featDir, "--out", outDir, "--format", "bruno", "--base-url", "https://api.example.com"]);

      expect(proc.exitCode).toBe(0);
      expect(proc.stdout.toString()).toContain("1 scenario(s), 2 request(s)");
      expect(existsSync(join(outDir, "bruno.json"))).toBe(true);
      const charge = join(outDir, "subscribe-then-charge", "2-charge.bru");
      expect(existsSync(charge)).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("missing required flags → non-zero exit + usage", () => {
    const bin = join(import.meta.dir, "..", "bin", "journeys.ts");
    const proc = Bun.spawnSync(["bun", bin, "demos", "--doc", "x.json"]);
    expect(proc.exitCode).toBe(1);
    expect(proc.stderr.toString()).toContain("required");
  });
});
