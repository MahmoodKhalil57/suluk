import { test, expect, describe } from "bun:test";
import { generateSdk, resolveOps } from "../src/index";
import type { OpenAPIv4Document } from "@suluk/core";

/**
 * C041 — the SDK generator surfaces field-origin as typed metadata (`.fields`) so a caller knows which inputs to faker
 * (`input`), which to CHAIN from a prior call (`sourced`, with a wireable `{op, select}` edge), and which are server-set
 * (`computed`). Read from `@suluk/examples` (the shared leaf), not re-derived. The marker rides the request body schema.
 */
const doc = {
  openapi: "4.0.0-candidate",
  info: { title: "Billing API" },
  paths: {
    "billing/charge": {
      requests: {
        charge: {
          method: "post",
          contentSchema: {
            type: "object",
            required: ["amountCents", "subscriptionId"],
            properties: {
              amountCents: { type: "integer", minimum: 100, "x-suluk-origin": "input" },
              subscriptionId: { type: "string", "x-suluk-origin": "sourced", "x-suluk-from": { op: "createSubscription", select: "id" } },
              total: { type: "number", "x-suluk-origin": "computed", "x-suluk-from": "amountCents + fees" },
            },
          },
          responses: { ok: { status: 200 } },
          "x-suluk-access": { requires: "authenticated" },
        },
      },
    },
  },
} as unknown as OpenAPIv4Document;

describe("@suluk/sdk surfaces C041 field origin as method metadata", () => {
  const src = generateSdk(doc, { baseURL: "https://api.example.com" });

  test("the op carries a `fields:` metadata block", () => {
    expect(src).toContain("fields:");
  });

  test("the sourced field is surfaced as a wireable edge (op + select), not a free input", () => {
    expect(src).toContain('"origin":"sourced"');
    expect(src).toContain('"op":"createSubscription"');
    expect(src).toContain('"select":"id"');
  });

  test("the input field is marked fakerable; the computed field is marked not-fakerable", () => {
    expect(src).toMatch(/"name":"amountCents"[^}]*"origin":"input"[^}]*"fakerable":true/);
    expect(src).toMatch(/"name":"total"[^}]*"origin":"computed"[^}]*"fakerable":false/);
  });

  test("resolveOps populates op.fields from the request body (the SDK reads, never re-derives)", () => {
    const { ops } = resolveOps(doc);
    const charge = ops.find((o) => o.name === "charge")!;
    expect(charge.fields?.map((f) => [f.name, f.origin])).toEqual([
      ["amountCents", "input"],
      ["subscriptionId", "sourced"],
      ["total", "computed"],
    ]);
    expect(charge.fields?.find((f) => f.name === "subscriptionId")?.source).toEqual({ op: "createSubscription", select: "id" });
  });

  test("an op with no body emits no fields block (no bloat)", () => {
    const noBody = {
      openapi: "4.0.0-candidate", info: { title: "T" },
      paths: { health: { requests: { health: { method: "get", responses: { ok: { status: 200 } } } } } },
    } as unknown as OpenAPIv4Document;
    expect(generateSdk(noBody)).not.toContain("fields:");
  });
});
