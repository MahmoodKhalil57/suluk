import { test, expect } from "bun:test";
import { emitAsyncApi } from "../src/index";
import type { OpenAPIv4Document } from "@suluk/core";

// A synthetic v4 document exercising ALL THREE event surfaces at once: a scheduled job, a queue-consumed job, an inbound
// webhook (with a body schema), and a mutation that invalidates a reactive store. (Real registry apps don't yet populate
// these facets — this is the projection's contract, proven against a representative doc.)
const DOC: OpenAPIv4Document = {
  openapi: "4.0.0",
  info: { title: "Widgets", version: "1.2.3" },
  paths: {
    "/api/widgets": {
      requests: {
        createWidget: {
          method: "post",
          summary: "Create a widget.",
          // a mutation that refreshes the `widgets` store on success — the app EMITS a "widgets invalidated" event.
          ["x-suluk-store"]: { invalidates: ["widgets", "widget-count"] },
        } as never,
      },
    },
    "/api/widgets/:id": {
      requests: {
        getWidget: {
          method: "get",
          summary: "Get a widget.",
          // a QUERY that BACKS a store — NOT an event (no `invalidates`); must not appear on the async surface.
          ["x-suluk-store"]: { key: "widget", params: ["id"] },
        } as never,
      },
    },
  },
  webhooks: {
    stripe: {
      method: "post",
      summary: "Stripe billing events.",
      description: "Inbound Stripe webhook.",
      contentSchema: { type: "object", properties: { type: { type: "string" }, id: { type: "string" } } },
    } as never,
  },
  ["x-suluk-jobs"]: {
    nightlyDigest: { trigger: "scheduled", schedule: "0 0 * * *", summary: "Email the daily digest.", description: "Runs nightly." },
    processUploads: { trigger: "queue-consumed", queue: "uploads", summary: "Process an uploaded file." },
  },
} as OpenAPIv4Document;

test("emits a valid AsyncAPI 3.0 shell", () => {
  const a = emitAsyncApi(DOC);
  expect(a.asyncapi).toBe("3.0.0");
  expect(a.info.title).toBe("Widgets — events");
  expect(a.info.version).toBe("1.2.3");
});

test("a scheduled job → a receive operation on its cron address, with a CloudEvent trigger message", () => {
  const a = emitAsyncApi(DOC);
  const op = a.operations.nightlyDigest;
  expect(op.action).toBe("receive"); // the app RECEIVES the scheduled tick
  expect(a.channels.nightlyDigest.address).toBe("schedule/0 0 * * *");
  const msg = a.components.messages.nightlyDigestTrigger;
  expect(msg.contentType).toBe("application/cloudevents+json");
  const props = (msg.payload as { properties: Record<string, { const?: string }> }).properties;
  expect(props.specversion.const).toBe("1.0");
  expect(props.type.const).toBe("dev.suluk.job.nightlyDigest.scheduled");
});

test("a queue-consumed job → a receive operation on its queue address (.queued type)", () => {
  const a = emitAsyncApi(DOC);
  expect(a.channels.processUploads.address).toBe("queue/uploads");
  expect(a.operations.processUploads.action).toBe("receive");
  const props = (a.components.messages.processUploadsTrigger.payload as { properties: Record<string, { const?: string }> }).properties;
  expect(props.type.const).toBe("dev.suluk.job.processUploads.queued");
});

test("a webhook → a receive operation whose CloudEvent `data` is the webhook body", () => {
  const a = emitAsyncApi(DOC);
  expect(a.operations.stripeWebhook.action).toBe("receive");
  expect(a.channels.stripeWebhook.address).toBe("webhook/stripe");
  const payload = a.components.messages.stripeWebhook.payload as { properties: { data: { type?: string; properties?: Record<string, unknown> } } };
  // the CloudEvent's `data` slot carries the webhook's own contentSchema
  expect(payload.properties.data.type).toBe("object");
  expect(payload.properties.data.properties).toHaveProperty("type");
});

test("a mutation's store invalidations → SEND operations, one CloudEvent per invalidated key", () => {
  const a = emitAsyncApi(DOC);
  expect(a.operations.store_widgets.action).toBe("send"); // the app EMITS the invalidation
  expect(a.channels.store_widgets.address).toBe("store/widgets");
  expect(a.operations["store_widget_count"].action).toBe("send");
  const props = (a.components.messages.widgetsInvalidated.payload as { properties: Record<string, { const?: string }> }).properties;
  expect(props.type.const).toBe("dev.suluk.store.widgets.invalidated");
});

test("a QUERY that only BACKS a store (key, no invalidates) produces NO event", () => {
  const a = emitAsyncApi(DOC);
  // `getWidget` has x-suluk-store.key "widget" but no invalidates → the read side produces no `store_widget` channel/op
  expect(a.channels.store_widget).toBeUndefined();
  expect(a.operations.store_widget).toBeUndefined();
  // only the two INVALIDATED keys became events
  expect(Object.keys(a.channels).filter((k) => k.startsWith("store_")).sort()).toEqual(["store_widget_count", "store_widgets"]);
});

test("an empty event surface yields a valid, honest empty async document", () => {
  const empty = emitAsyncApi({ openapi: "4.0.0", info: { title: "Bare", version: "0.0.0" }, paths: {} } as OpenAPIv4Document);
  expect(empty.asyncapi).toBe("3.0.0");
  expect(Object.keys(empty.channels)).toHaveLength(0);
  expect(Object.keys(empty.operations)).toHaveLength(0);
});

test("is a PURE function — same doc in, deep-equal doc out", () => {
  expect(emitAsyncApi(DOC)).toEqual(emitAsyncApi(DOC));
});
