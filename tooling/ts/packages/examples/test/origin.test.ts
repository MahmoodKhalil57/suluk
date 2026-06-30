import { test, expect, describe } from "bun:test";
import {
  fieldOrigin,
  describeInputs,
  asSourceRef,
  resolveSourced,
  synthesize,
  type JsonSchema,
} from "../src/index";

/**
 * C041 — field-origin discipline. `x-suluk-origin` (input|sourced|computed) + `x-suluk-from` authored in Zod .meta(),
 * read here only. Makes the synthesizer CORRECT (stops inventing computed values) and makes a `sourced` field a
 * machine-wireable edge the journeys emitter + the @suluk/sdk generator consume.
 */

describe("fieldOrigin", () => {
  test("explicit x-suluk-origin wins", () => {
    expect(fieldOrigin({ type: "string", "x-suluk-origin": "sourced" })).toBe("sourced");
    expect(fieldOrigin({ type: "integer", "x-suluk-origin": "computed" })).toBe("computed");
    expect(fieldOrigin({ type: "string", "x-suluk-origin": "input" })).toBe("input");
  });
  test("readOnly ⇒ computed when no explicit origin", () => {
    expect(fieldOrigin({ type: "string", readOnly: true })).toBe("computed");
  });
  test("explicit origin overrides readOnly", () => {
    expect(fieldOrigin({ type: "string", readOnly: true, "x-suluk-origin": "input" })).toBe("input");
  });
  test("default is input (incl. unknown values and missing schema)", () => {
    expect(fieldOrigin({ type: "string" })).toBe("input");
    expect(fieldOrigin({ "x-suluk-origin": "bogus" })).toBe("input");
    expect(fieldOrigin(undefined)).toBe("input");
  });
});

describe("describeInputs — the client/SDK-facing surface", () => {
  const schema: JsonSchema = {
    type: "object",
    required: ["amountCents", "subId"],
    properties: {
      amountCents: { type: "integer", minimum: 100, "x-suluk-origin": "input" },
      subId: { type: "string", "x-suluk-origin": "sourced", "x-suluk-from": { op: "createSubscription", select: "id" } },
      note: { type: "string", "x-suluk-origin": "sourced", "x-suluk-from": "from the create call" },
      balance: { type: "integer", "x-suluk-origin": "computed", "x-suluk-from": "ledger sum" },
      plain: { type: "string" },
    },
  };
  const byName = Object.fromEntries(describeInputs(schema).map((d) => [d.name, d]));

  test("classifies origin, fakerable, and required per field", () => {
    expect(byName.amountCents).toMatchObject({ origin: "input", fakerable: true, required: true });
    expect(byName.plain).toMatchObject({ origin: "input", fakerable: true, required: false });
    expect(byName.balance).toMatchObject({ origin: "computed", fakerable: false });
  });

  test("a structured x-suluk-from becomes a wireable source edge", () => {
    expect(byName.subId.source).toEqual({ op: "createSubscription", select: "id" });
    expect(byName.subId.fakerable).toBe(false);
  });

  test("a free-string x-suluk-from is a note, not a wireable edge", () => {
    expect(byName.note.from).toBe("from the create call");
    expect(byName.note.source).toBeUndefined();
  });
});

describe("asSourceRef", () => {
  test("structured object with an op is a SourceRef", () => {
    expect(asSourceRef({ op: "getX", select: "data.id" })).toEqual({ op: "getX", select: "data.id" });
    expect(asSourceRef({ op: "getX" })).toEqual({ op: "getX", select: undefined });
  });
  test("a string or a shapeless object is not wireable", () => {
    expect(asSourceRef("a note")).toBeUndefined();
    expect(asSourceRef({ select: "id" })).toBeUndefined();
    expect(asSourceRef(undefined)).toBeUndefined();
  });
});

describe("resolveSourced — the shared wiring primitive (emitter + sdk chaining)", () => {
  const captured = { createSubscription: { id: "sub_123", nested: { x: 7 } } };
  test("default select is `id`", () => {
    expect(resolveSourced(captured, { op: "createSubscription" })).toBe("sub_123");
  });
  test("a dotted select walks the captured response", () => {
    expect(resolveSourced(captured, { op: "createSubscription", select: "nested.x" })).toBe(7);
  });
  test("a missing op or path resolves to undefined (never throws)", () => {
    expect(resolveSourced(captured, { op: "missing" })).toBeUndefined();
    expect(resolveSourced(captured, { op: "createSubscription", select: "nope.deep" })).toBeUndefined();
  });
});

describe("synthesize — origin/direction aware", () => {
  const body: JsonSchema = {
    type: "object",
    properties: {
      amountCents: { type: "integer", minimum: 100, "x-suluk-origin": "input" },
      subId: { type: "string", "x-suluk-origin": "sourced", "x-suluk-from": { op: "createSubscription", select: "id" } },
      balance: { type: "integer", "x-suluk-origin": "computed" },
      createdAt: { type: "string", readOnly: true },
    },
  };

  test("a REQUEST example omits computed (and readOnly) fields a client never sends", () => {
    const v = synthesize(body) as Record<string, unknown>;
    expect(v).toHaveProperty("amountCents");
    expect(v).toHaveProperty("subId");
    expect(typeof v.subId).toBe("string");
    expect(v).not.toHaveProperty("balance");
    expect(v).not.toHaveProperty("createdAt");
  });

  test("a RESPONSE example includes computed/readOnly fields (they are output)", () => {
    const v = synthesize(body, "body", { direction: "response" }) as Record<string, unknown>;
    expect(v).toHaveProperty("balance");
    expect(v).toHaveProperty("createdAt");
  });

  test("a RESPONSE example omits writeOnly fields", () => {
    const v = synthesize(
      { type: "object", properties: { token: { type: "string", writeOnly: true }, ok: { type: "boolean" } } },
      "body",
      { direction: "response" },
    ) as Record<string, unknown>;
    expect(v).not.toHaveProperty("token");
    expect(v).toHaveProperty("ok");
  });

  test("computed fields are omitted at any depth on a request", () => {
    const v = synthesize({
      type: "object",
      properties: {
        item: { type: "object", properties: { name: { type: "string" }, total: { type: "number", "x-suluk-origin": "computed" } } },
      },
    }) as any;
    expect(v.item).toHaveProperty("name");
    expect(v.item).not.toHaveProperty("total");
  });
});
