import { test, expect, describe } from "bun:test";
import { generateVocabulary } from "../src/vocabulary";
import { parseFeature } from "../src/gherkin";
import { compileDemos, renderPostman, renderBruno } from "../src/demos";
import type { OpenAPIv4Document } from "@suluk/core";

/**
 * C042 — compile a bound feature into a Bruno/Postman DEMO collection: ordered requests, body from the Examples row (or
 * synthesized), sourced fields wired to request CHAINING (capture → {{var}}), auth + a {{baseUrl}} that a developer
 * points at localhost first and the presenter switches to prod for the live call.
 */
const doc = {
  openapi: "4.0.0-candidate",
  info: { title: "Billing" },
  paths: {
    "/subs": {
      requests: {
        createSubscription: {
          method: "post",
          contentSchema: { type: "object", required: ["plan"], properties: { plan: { type: "string" } } },
          responses: { ok: { status: 200 } },
          "x-suluk-access": { requires: "authenticated" },
        },
      },
    },
    "/charge": {
      requests: {
        charge: {
          method: "post",
          contentSchema: {
            type: "object",
            required: ["amountCents", "subscriptionId"],
            properties: {
              amountCents: { type: "integer", minimum: 100 },
              subscriptionId: { type: "string", "x-suluk-origin": "sourced", "x-suluk-from": { op: "createSubscription", select: "id" } },
            },
          },
          responses: { ok: { status: 200 } },
          "x-suluk-access": { requires: "authenticated" },
        },
      },
    },
  },
} as unknown as OpenAPIv4Document;

const feature = parseFeature(
  ["Feature: billing demo", "  Scenario: subscribe then charge", "    When I create subscription", "    And I charge"].join("\n"),
);
const demos = compileDemos(doc, generateVocabulary(doc), [feature]);

describe("compileDemos — the IR", () => {
  test("ordered requests per scenario, method + path from the contract", () => {
    expect(demos).toHaveLength(1);
    expect(demos[0].requests.map((r) => [r.method, r.path])).toEqual([
      ["POST", "/subs"],
      ["POST", "/charge"],
    ]);
  });

  test("the body is synthesized when there's no Examples table; computed dropped", () => {
    expect(demos[0].requests[0].body).toEqual({ plan: { kind: "literal", value: "plan" } });
  });

  test("a sourced field becomes a {{var}} reference, and the SOURCE request captures it", () => {
    const charge = demos[0].requests[1];
    expect(charge.body!.subscriptionId).toEqual({ kind: "var", name: "createSubscription_id" });
    const create = demos[0].requests[0];
    expect(create.captures).toEqual([{ var: "createSubscription_id", from: "id" }]);
  });

  test("auth is flagged from x-suluk-access", () => {
    expect(demos[0].requests.every((r) => r.needsAuth)).toBe(true);
  });
});

describe("renderPostman", () => {
  const json = renderPostman(demos, { name: "Billing demo", baseUrl: "https://api.example.com" });
  const collection = JSON.parse(json);

  test("a v2.1 collection with baseUrl (local-first) + prodBaseUrl + token variables", () => {
    expect(collection.info.schema).toContain("v2.1.0");
    const vars = Object.fromEntries(collection.variable.map((v: any) => [v.key, v.value]));
    expect(vars.baseUrl).toBe("http://localhost:8787"); // dev-first
    expect(vars.prodBaseUrl).toBe("https://api.example.com");
    expect(vars).toHaveProperty("token");
  });

  test("the charge request body references the chained var, and create captures it via a test script", () => {
    const folder = collection.item[0];
    const create = folder.item[0];
    const charge = folder.item[1];
    expect(charge.request.body.raw).toContain('"subscriptionId": "{{createSubscription_id}}"');
    const createScript = create.event.find((e: any) => e.listen === "test").script.exec.join("\n");
    expect(createScript).toContain('pm.collectionVariables.set("createSubscription_id", pm.response.json().id)');
  });

  test("auth'd requests carry a bearer header + a 2xx test", () => {
    const create = collection.item[0].item[0];
    expect(create.request.header).toContainEqual({ key: "Authorization", value: "Bearer {{token}}" });
    expect(create.event[0].script.exec.join("\n")).toContain("below(300)");
  });
});

describe("renderBruno", () => {
  const files = renderBruno(demos, { name: "Billing demo", baseUrl: "https://api.example.com" });

  test("emits a collection manifest + BOTH local and prod environments", () => {
    expect(files["bruno.json"]).toContain('"name": "Billing demo"');
    expect(files["environments/local.bru"]).toContain("baseUrl: http://localhost:8787");
    expect(files["environments/prod.bru"]).toContain("baseUrl: https://api.example.com");
  });

  test("a .bru file per request, sequenced, with method/url/body", () => {
    const create = files["subscribe-then-charge/1-createsubscription.bru"];
    const charge = files["subscribe-then-charge/2-charge.bru"];
    expect(create).toContain("post {\n  url: {{baseUrl}}/subs");
    expect(create).toContain("auth: bearer");
    expect(charge).toContain('"subscriptionId": "{{createSubscription_id}}"');
  });

  test("the source request captures the chained var via a post-response script", () => {
    const create = files["subscribe-then-charge/1-createsubscription.bru"];
    expect(create).toContain('bru.setVar("createSubscription_id", res.body.id);');
    expect(create).toContain("res.status: lt 300");
  });
});
