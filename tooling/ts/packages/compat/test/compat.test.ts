import { test, expect, describe } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseDocument, buildAda } from "@suluk/core";
import { downgrade, upgrade, validate31 } from "../src/index";

const corpus = join(import.meta.dir, "..", "..", "core", "test", "conformance", "valid");
const petstore = parseDocument(readFileSync(join(corpus, "01-petstore.yaml"), "utf8"));

describe("v4 → 3.1 downgrade (the Scalar/Swagger lever)", () => {
  const { document, diagnostics } = downgrade(petstore);

  test("produces a document that validates against the OFFICIAL OpenAPI 3.1 meta-schema", () => {
    const v = validate31(document);
    if (!v.valid) console.error(JSON.stringify(v.errors, null, 2));
    expect(v.valid).toBe(true);
  });

  test("declares 3.1 version + carries info/paths", () => {
    expect((document as any).openapi).toBe("3.1.0");
    expect((document as any).info.title).toContain("Petstore");
    expect(Object.keys((document as any).paths)).toContain("/pet");
  });

  test("name-keyed requests become method-keyed operations, operationId = the v4 name", () => {
    const petPost = (document as any).paths["/pet"].post;
    expect(petPost.operationId).toBe("createPet");
    expect((document as any).paths["/pet"].get.operationId).toBe("listPets");
  });

  test("the shared (inherited) path param is materialized onto each operation (C012 merge)", () => {
    const getPet = (document as any).paths["/pet/{petId}"].get;
    const petIdParam = (getPet.parameters ?? []).find((p: any) => p.name === "petId");
    expect(petIdParam).toBeDefined();
    expect(petIdParam.in).toBe("path");
    expect(petIdParam.required).toBe(true); // 3.1: path params always required
  });

  test("per-location query schema expands into a 3.1 query parameter", () => {
    const op = (document as any).paths["/pet/findByStatus"].get;
    const statusParam = (op.parameters ?? []).find((p: any) => p.name === "status");
    expect(statusParam).toBeDefined();
    expect(statusParam.in).toBe("query");
    expect(statusParam.required).toBe(true);
  });

  test("flattened body (contentType + contentSchema) becomes requestBody.content", () => {
    const rb = (document as any).paths["/pet"].post.requestBody;
    expect(rb.content["application/json"].schema.$ref).toBe("#/components/schemas/Pet");
  });

  test("inherited pathResponses/apiResponses are merged into operations for rendering", () => {
    const getPet = (document as any).paths["/pet/{petId}"].get;
    expect(Object.keys(getPet.responses)).toContain("404"); // from pathResponses.petNotFound
    expect(Object.keys(getPet.responses)).toContain("5XX"); // from apiResponses.globalServerError
  });

  test("schemas pass through verbatim (shared 2020-12 dialect)", () => {
    expect((document as any).components.schemas.Pet).toEqual(petstore.components!.schemas!.Pet as any);
  });

  test("petstore has no method collisions → clean downgrade", () => {
    expect(diagnostics.filter((d) => d.kind === "collision")).toEqual([]);
  });
});

describe("same-method requests are MERGED into one operation (C003, non-lossy)", () => {
  test("two same-method bodyless requests collapse to one operation + a collision diagnostic naming both", () => {
    const doc = parseDocument(`
openapi: 4.0.0-candidate
info: { title: t, version: "1" }
paths:
  "thing":
    requests:
      listA: { method: get, responses: { ok: { status: 200 } } }
      listB: { method: get, responses: { ok: { status: 200 } } }
`);
    const { document, diagnostics } = downgrade(doc);
    const collisions = diagnostics.filter((d) => d.kind === "collision");
    expect(collisions.length).toBe(1);
    expect(collisions[0].message).toContain("merged");
    expect(collisions[0].message).toContain("listA");
    expect(collisions[0].message).toContain("listB");
    // still VALID 3.1; first request's name is the operationId
    expect(validate31(document).valid).toBe(true);
    expect((document as any).paths["/thing"].get.operationId).toBe("listA");
  });

  test("multiple body variants become a oneOf request body, each preserving its discriminator", () => {
    const doc = parseDocument(`
openapi: 4.0.0-candidate
info: { title: t, version: "1" }
paths:
  thing:
    requests:
      submit:
        method: patch
        contentType: application/json
        contentSchema:
          type: object
          properties:
            action: { type: string, const: SUBMIT }
            signed: { type: string }
          required: [action]
          additionalProperties: false
        responses:
          ok: { status: 200 }
      cancel:
        method: patch
        contentType: application/json
        contentSchema:
          type: object
          properties:
            action: { type: string, const: CANCEL }
          required: [action]
          additionalProperties: false
        responses:
          ok: { status: 200 }
`);
    const { document, diagnostics } = downgrade(doc);
    const op = (document as any).paths["/thing"].patch;
    const body = op.requestBody.content["application/json"].schema;
    // both variants preserved in oneOf
    expect(Array.isArray(body.oneOf)).toBe(true);
    expect(body.oneOf).toHaveLength(2);
    const consts = body.oneOf.map((v: any) => v.properties?.action?.const).sort();
    expect(consts).toEqual(["CANCEL", "SUBMIT"]);
    // the description records the merge
    expect(op.description).toContain("Merged from 2 v4 requests");
    // one collision diagnostic describing the merge
    const collisions = diagnostics.filter((d) => d.kind === "collision");
    expect(collisions.length).toBe(1);
    expect(collisions[0].message).toContain("merged");
    expect(validate31(document).valid).toBe(true);
  });

  test("identical variant bodies collapse to a single schema (no redundant oneOf)", () => {
    const doc = parseDocument(`
openapi: 4.0.0-candidate
info: { title: t, version: "1" }
paths:
  thing:
    requests:
      a: { method: post, contentType: application/json, contentSchema: { type: object, properties: { x: { type: string } } }, responses: { ok: { status: 200 } } }
      b: { method: post, contentType: application/json, contentSchema: { type: object, properties: { x: { type: string } } }, responses: { ok: { status: 200 } } }
`);
    const { document, diagnostics } = downgrade(doc);
    const body = (document as any).paths["/thing"].post.requestBody.content["application/json"].schema;
    // identical bodies → no oneOf wrapper, just the single schema
    expect(body.oneOf).toBeUndefined();
    expect(body.properties.x).toBeDefined();
    expect(diagnostics.filter((d) => d.kind === "collision").length).toBe(1);
  });
});

describe("3.0-shaped features upgrade() must not drop ($ref params, response headers, doc-level security)", () => {
  // a compact OSB-style 3.0 doc exercising: a $ref header param, an inline path/query param, a response header,
  // and doc-level security with one op opting out via `security: []`.
  const doc30: Record<string, unknown> = {
    openapi: "3.0.0",
    info: { title: "OSB-ish", version: "1" },
    security: [{ basicAuth: [] }],
    externalDocs: { url: "https://example.com/spec", description: "the spec" },
    paths: {
      "/v2/service_instances/{instance_id}/last_operation": {
        get: {
          operationId: "lastOp.get",
          parameters: [
            { $ref: "#/components/parameters/APIVersion" },
            { name: "instance_id", in: "path", required: true, schema: { type: "string" } },
            { name: "operation", in: "query", schema: { type: "string" } },
          ],
          responses: {
            "200": {
              description: "OK",
              content: { "application/json": { schema: { type: "object" } } },
              headers: { "Retry-After": { description: "when to retry", required: false, schema: { type: "string" } } },
            },
          },
        },
      },
      "/public": {
        get: { operationId: "ping", security: [], responses: { "200": { description: "OK" } } },
      },
    },
    components: {
      parameters: {
        APIVersion: { name: "X-Broker-API-Version", in: "header", required: true, schema: { type: "string", default: "2.13" } },
      },
    },
  };
  const v4 = upgrade(doc30) as any;
  const lastOp = v4.paths["/v2/service_instances/{instance_id}/last_operation"].requests["lastOp.get"];

  test("a $ref header parameter is inlined into parameterSchema.header (not dropped)", () => {
    expect(lastOp.parameterSchema.header.properties["X-Broker-API-Version"]).toEqual({ type: "string", default: "2.13" });
    expect(lastOp.parameterSchema.header.required).toEqual(["X-Broker-API-Version"]);
  });

  test("inline path/query params still bucket by location", () => {
    expect(lastOp.parameterSchema.path.required).toEqual(["instance_id"]);
    expect(lastOp.parameterSchema.query.properties.operation).toEqual({ type: "string" });
    expect(lastOp.parameterSchema.query.required).toBeUndefined(); // `operation` is optional
  });

  test("response headers pass through to Response.headers", () => {
    expect(lastOp.responses["200"].headers["Retry-After"].schema).toEqual({ type: "string" });
  });

  test("doc-level security is pushed onto ops that don't declare their own; an op-level `security: []` opts out", () => {
    expect(lastOp.security).toEqual([{ basicAuth: [] }]);
    expect(v4.paths["/public"].requests.ping.security).toEqual([]); // explicit opt-out preserved, not overwritten
  });

  test("doc-level externalDocs is preserved as x-externalDocs (v4 has no doc-level field)", () => {
    expect(v4["x-externalDocs"]).toEqual({ url: "https://example.com/spec", description: "the spec" });
  });

  test("headers survive a v4 → 3.1 downgrade too (lossless round-trip)", () => {
    const back = downgrade(v4).document as any;
    const resp = back.paths["/v2/service_instances/{instance_id}/last_operation"].get.responses["200"];
    expect(resp.headers["Retry-After"].schema).toEqual({ type: "string" });
  });
});

describe("3.1 → v4 → 3.1 round-trip", () => {
  test("downgrade → upgrade recovers the operations by name + method", () => {
    const { document } = downgrade(petstore);
    const v4again = upgrade(document);
    const ada = buildAda(v4again);
    const names = ada.operations.map((o) => o.name).sort();
    // operationId carried the original v4 names through the 3.1 hop
    expect(names).toContain("createPet");
    expect(names).toContain("getPet");
    expect(names).toContain("findByStatus");
  });

  test("upgrade output is a structurally valid v4 doc that re-downgrades to valid 3.1", () => {
    const v4again = upgrade(downgrade(petstore).document);
    const redown = downgrade(v4again);
    expect(validate31(redown.document).valid).toBe(true);
  });
});
