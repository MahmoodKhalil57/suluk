import { test, expect, describe } from "bun:test";
import * as z from "zod";
import { zodToV4 } from "../src/index";

/**
 * C041 round-trip witness — the load-bearing assumption for the field-origin convention. The marker is authored in Zod
 * `.meta()` and must survive `zodToV4` (which wraps `z.toJSONSchema`) onto the property's JSON Schema, so @suluk/journeys
 * / @suluk/sdk can read it downstream with NO change to @suluk/core, the meta-schema, or the contract authoring surface.
 * If a future Zod changes how `.meta()` is emitted, this fails loudly instead of silently dropping the markers.
 */
describe("zodToV4 carries x-suluk-origin / x-suluk-from .meta() verbatim", () => {
  const schema = z.object({
    amountCents: z.number().int().min(100).meta({ "x-suluk-origin": "input" }),
    balance: z.number().int().meta({ "x-suluk-origin": "computed", "x-suluk-from": "ledger sum" }),
    subId: z.string().meta({ "x-suluk-origin": "sourced", "x-suluk-from": { op: "createSubscription", select: "id" } }),
    serverSet: z.string().readonly(),
  });
  const { schema: json, warnings } = zodToV4(schema);
  const props = (json.properties ?? {}) as Record<string, Record<string, unknown>>;

  test("a string marker survives on the property", () => {
    expect(props.amountCents["x-suluk-origin"]).toBe("input");
  });

  test("a computed marker + free-string x-suluk-from survive", () => {
    expect(props.balance["x-suluk-origin"]).toBe("computed");
    expect(props.balance["x-suluk-from"]).toBe("ledger sum");
  });

  test("a STRUCTURED x-suluk-from (the wireable SourceRef) survives intact", () => {
    expect(props.subId["x-suluk-origin"]).toBe("sourced");
    expect(props.subId["x-suluk-from"]).toEqual({ op: "createSubscription", select: "id" });
  });

  test(".readonly() projects to readOnly:true (⇒ computed for request examples)", () => {
    expect(props.serverSet.readOnly).toBe(true);
  });

  test("carrying the markers is lossless (no dropped-effect warnings)", () => {
    expect(warnings).toEqual([]);
  });
});
