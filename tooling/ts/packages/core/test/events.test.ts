import { test, expect } from "bun:test";
import { isCloudEvent, cloudEventEnvelopeSchema, CLOUDEVENTS_JSON_CONTENT_TYPE } from "../src/index";
import type { CloudEventV1, AsyncApiDocument, AsyncApiMessage } from "../src/index";

/**
 * C100 — the event-architecture surface (CloudEvents 1.0.2 + AsyncAPI 3.x). Type assertions are enforced by
 * `bun run typecheck` (core's tsconfig includes `test/**`); the runtime tests anchor the file under `bun test`.
 */

type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

/* ── CloudEventV1<T> mirrors the `cloudevents` npm interface (structurally assignable, no dep) ──────────────── */
type OrderCreated = CloudEventV1<{ orderId: string }>;
type _ceData = Expect<Equal<OrderCreated["data"], { orderId: string } | undefined>>;
type _ceId = Expect<Equal<OrderCreated["id"], string>>;
type _ceSource = Expect<Equal<OrderCreated["source"], string>>;

const ce: OrderCreated = { specversion: "1.0", id: "evt-1", source: "/orders", type: "dev.suluk.order.created", data: { orderId: "o1" } };
void ce;
// a runtime `cloudevents` package event (its CloudEventV1<T> shape) is structurally assignable to ours:
type CloudEventsNpmV1<T> = { id: string; source: string; type: string; specversion: string; data?: T; time?: string; [k: string]: unknown };
const fromNpm: CloudEventV1<{ n: number }> = { id: "1", source: "/s", type: "t", specversion: "1.0", data: { n: 1 } } as CloudEventsNpmV1<{ n: number }>;
void fromNpm;

/* ── The envelope schema is a C099 ObjectSchema; AsyncApiMessage.payload accepts it ────────────────────────── */
const msg: AsyncApiMessage = { name: "x", contentType: CLOUDEVENTS_JSON_CONTENT_TYPE, payload: cloudEventEnvelopeSchema("t", "s") };
void msg;
// the emitter-shaped AsyncAPI document (what @suluk/hono constructs) is assignable:
const doc: AsyncApiDocument = { asyncapi: "3.0.0", info: { title: "x", version: "1" }, channels: {}, operations: {}, components: { messages: {} } };
void doc;

test("C100: cloudEventEnvelopeSchema builds a CloudEvents 1.0 structured envelope (typed ObjectSchema)", () => {
  const env = cloudEventEnvelopeSchema("dev.suluk.test", "test/src", { type: "object", properties: { orderId: { type: "string" } } });
  expect(env.type).toBe("object");
  expect(env.required).toEqual(["specversion", "id", "source", "type"]);
  expect(env.additionalProperties).toBe(true); // CloudEvents extension attributes allowed
  const props = (env.properties ?? {}) as Record<string, { const?: unknown; type?: string }>;
  expect(props.specversion.const).toBe("1.0");
  expect(props.type.const).toBe("dev.suluk.test");
  expect((props.data as { type?: string }).type).toBe("object"); // the `data` slot carries the event's own payload schema
});

test("C100: isCloudEvent discriminates a CloudEvents envelope by its four required context attributes", () => {
  expect(isCloudEvent({ id: "1", source: "/s", type: "t", specversion: "1.0" })).toBe(true);
  expect(isCloudEvent({ id: "1", source: "/s" })).toBe(false); // missing type/specversion
  expect(isCloudEvent(null)).toBe(false);
  expect(isCloudEvent("nope")).toBe(false);
});

test("C100: the CloudEvents structured media type constant", () => {
  expect(CLOUDEVENTS_JSON_CONTENT_TYPE).toBe("application/cloudevents+json");
});
