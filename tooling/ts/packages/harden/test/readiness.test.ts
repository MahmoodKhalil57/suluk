import { test, expect, describe } from "bun:test";
import { auditReadiness } from "../src/index";
import type { OpenAPIv4Document } from "@suluk/core";

/**
 * C043 — the readiness dimension: computed-required (a required field a client can't send) + request-without-example.
 * Separate from the security grade; folded into combineGrades alongside security + journeys coverage.
 */
const doc = {
  openapi: "4.0.0-candidate",
  info: { title: "Billing" },
  paths: {
    "/charge": {
      requests: {
        charge: {
          method: "post",
          contentSchema: {
            type: "object",
            required: ["amountCents", "balance"],
            properties: {
              amountCents: { type: "integer" },
              balance: { type: "integer", "x-suluk-origin": "computed" }, // required AND computed → a bug
            },
          },
        },
      },
    },
    "/good": {
      requests: {
        good: {
          method: "post",
          contentSchema: {
            type: "object",
            required: ["name"],
            properties: { name: { type: "string" } },
            examples: [{ name: "ok" }], // has an example
          },
        },
      },
    },
    "/health": { requests: { health: { method: "get", responses: { "200": { status: 200 } } } } }, // no body → not assessed
  },
} as unknown as OpenAPIv4Document;

describe("auditReadiness", () => {
  const audit = auditReadiness(doc);
  const rules = audit.findings.map((f) => f.rule);

  test("flags a required computed/readOnly field as not client-sendable (high)", () => {
    const f = audit.findings.find((x) => x.rule === "computed-required");
    expect(f).toBeDefined();
    expect(f!.severity).toBe("high");
    expect(f!.path).toBe("charge/body/balance");
  });

  test("flags a request body with no example (low)", () => {
    const f = audit.findings.find((x) => x.rule === "request-without-example" && x.path === "charge/body");
    expect(f).toBeDefined();
    expect(f!.severity).toBe("low");
  });

  test("a body WITH an example + only sendable required fields raises no finding", () => {
    expect(rules).not.toContain("good/body");
    expect(audit.findings.some((f) => f.path.startsWith("good/"))).toBe(false);
  });

  test("a body-less op is not assessed (no nodes for it)", () => {
    expect(audit.findings.some((f) => f.path.startsWith("health/"))).toBe(false);
  });

  test("produces a score + grade from the clean/nodes ratio", () => {
    expect(audit.nodes).toBeGreaterThan(0);
    expect(["A", "B", "C", "D", "F"]).toContain(audit.grade);
  });

  test("readOnly is treated as computed (no x-suluk-origin needed)", () => {
    const ro = { openapi: "4.0.0-candidate", info: { title: "T" }, paths: { "/x": { requests: { x: { method: "post", contentSchema: { type: "object", required: ["id"], properties: { id: { type: "string", readOnly: true } } } } } } } } as unknown as OpenAPIv4Document;
    expect(auditReadiness(ro).findings.some((f) => f.rule === "computed-required")).toBe(true);
  });

  test("a clean contract grades A", () => {
    const clean = { openapi: "4.0.0-candidate", info: { title: "T" }, paths: { "/x": { requests: { x: { method: "post", contentSchema: { type: "object", required: ["n"], properties: { n: { type: "string" } }, examples: [{ n: "a" }] } } } } } } as unknown as OpenAPIv4Document;
    expect(auditReadiness(clean).grade).toBe("A");
  });
});
