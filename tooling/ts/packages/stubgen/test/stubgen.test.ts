import { test, expect, describe } from "bun:test";
import { stubSpec, renderContract, generateStub, honoEffectTarget, honoTarget, type StubGap } from "../src/index";

/**
 * C040-P3 — @suluk/stubgen turns a NEEDS-CONTRACT gap into a generic RouteContract stub + a handler via an adapter seam.
 * The inferred Zod is honestly-provisional (`// TODO: tighten`); the maintainer owns the final schema.
 */

describe("stubSpec — inference from intent + Examples columns", () => {
  const gap: StubGap = { intent: "I refund a charge", fields: [{ name: "chargeId", sample: "ch_123" }, { name: "amountCents", sample: "500" }, { name: "full", sample: "true" }] };
  const spec = stubSpec(gap);

  test("name drops the leading I + stop-words and camelCases", () => {
    expect(spec.name).toBe("refundCharge");
  });
  test("method is inferred from the verb; path is the kebab of the name", () => {
    expect(spec.method).toBe("post");
    expect(spec.path).toBe("/refund-charge");
  });
  test("field Zod is inferred from the sample cell (number/boolean/string)", () => {
    const byName = Object.fromEntries(spec.fields.map((f) => [f.name, f.zod]));
    expect(byName.chargeId).toBe("z.string()");
    expect(byName.amountCents).toBe("z.number()");
    expect(byName.full).toBe("z.boolean()");
  });

  test("a get-verb intent infers method get", () => {
    expect(stubSpec({ intent: "I view the receipt" }).method).toBe("get");
    expect(stubSpec({ intent: "I delete a key" }).method).toBe("delete");
  });

  test("explicit overrides win over inference", () => {
    const s = stubSpec({ intent: "I do a thing", name: "customName", method: "PUT", path: "/x/y" });
    expect(s).toMatchObject({ name: "customName", method: "put", path: "/x/y" });
  });
});

describe("renderContract — a paste-ready @suluk/hono RouteContract literal", () => {
  const contract = renderContract(stubSpec({ intent: "I refund a charge", fields: [{ name: "chargeId", sample: "ch_1" }] }));
  test("carries method/path/name + the inferred request Zod + a TODO", () => {
    expect(contract).toContain('method: "post"');
    expect(contract).toContain('name: "refundCharge"');
    expect(contract).toContain("request: { json: z.object({ chargeId: z.string() /* TODO: tighten */ }) }");
    expect(contract).toContain("/* TODO: response shape */");
  });
  test("a fieldless gap emits no request block", () => {
    expect(renderContract(stubSpec({ intent: "I ping" }))).not.toContain("request:");
  });
});

describe("HandlerTarget seam", () => {
  const spec = stubSpec({ intent: "I refund a charge" });
  test("honoEffectTarget emits the Effect + run() + RouteError idiom, wired to the route", () => {
    const h = honoEffectTarget.emitHandler(spec);
    expect(h).toContain("const refundChargeProgram = (c: Context<AppCtx>): Effect.Effect<Response, RouteError<\"refundCharge\">, AppServices>");
    expect(h).toContain('app.post("/refund-charge", (c) => run(refundChargeProgram(c), c.env));');
  });
  test("honoTarget emits a framework-generic handler", () => {
    const h = honoTarget.emitHandler(spec);
    expect(h).toContain('app.post("/refund-charge", async (c) => {');
    expect(h).not.toContain("Effect");
  });
});

describe("generateStub — contract + handler, default target", () => {
  const g = generateStub({ intent: "I create a subscription", fields: [{ name: "plan", sample: "pro" }] });
  test("returns the inferred name + both halves", () => {
    expect(g.name).toBe("createSubscription");
    expect(g.contract).toContain('name: "createSubscription"');
    expect(g.handler).toContain("createSubscriptionProgram");
  });
});
