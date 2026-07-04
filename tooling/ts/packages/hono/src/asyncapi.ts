/**
 * `emitAsyncApi` — project a v4 "Suluk" OpenAPI document's EVENT surface into a standard **AsyncAPI 3.0** document whose
 * messages are **CloudEvents 1.0.2** envelopes. This is the async counterpart to {@link emitV4} (OpenAPI, the SYNC
 * request/response surface): a consumer gets OpenAPI for the operations AND AsyncAPI+CloudEvents for the events — both
 * standard, zero bespoke event format. A PURE function of the document (same doc in → same AsyncAPI out); additive.
 *
 * The three event surfaces it reads (all already in the v4 doc):
 *   • `x-suluk-jobs` (C025)      — a scheduled (cron) / queue-consumed job the app RECEIVES → a `receive` operation.
 *   • `webhooks` (C018)          — an inbound HTTP event the app RECEIVES → a `receive` operation (payload = the webhook body).
 *   • per-op `x-suluk-store.invalidates` (C037) — a mutation the app runs EMITS a "store refreshed" event → a `send` operation.
 *
 * Every message payload is a CloudEvent (`specversion`/`id`/`source`/`type` + `data`), so the wire is a standard envelope any
 * CloudEvents SDK / event bus / AsyncAPI generator consumes. NOT normative to the OpenAPI contract — a separate projection.
 */
import type { OpenAPIv4Document, Request } from "@suluk/core";

/** The reverse-DNS prefix for every generated CloudEvent `type` (rebrandable, one place). */
const CE_TYPE_PREFIX = "dev.suluk";

// ── AsyncAPI 3.0 document shape (the subset we emit) ────────────────────────────────────────────────────────────────────
export interface AsyncApiMessage {
  name: string;
  title?: string;
  summary?: string;
  contentType: string;
  /** the CloudEvents envelope schema (JSON Schema); its `data` is the event's own payload. */
  payload: Record<string, unknown>;
}
export interface AsyncApiChannel {
  address: string;
  description?: string;
  messages: Record<string, { $ref: string }>;
}
export interface AsyncApiOperation {
  action: "send" | "receive";
  channel: { $ref: string };
  summary?: string;
  messages: { $ref: string }[];
}
export interface AsyncApiDocument {
  asyncapi: "3.0.0";
  info: { title: string; version: string; description?: string };
  channels: Record<string, AsyncApiChannel>;
  operations: Record<string, AsyncApiOperation>;
  components: { messages: Record<string, AsyncApiMessage> };
  [ext: `x-${string}`]: unknown;
}

/** The CloudEvents 1.0.2 structured-JSON envelope as a JSON Schema — `data` carries the event's own payload (or is open). */
function cloudEvent(type: string, source: string, data?: unknown): Record<string, unknown> {
  return {
    type: "object",
    title: "CloudEvent",
    required: ["specversion", "id", "source", "type"],
    properties: {
      specversion: { type: "string", const: "1.0", description: "The CloudEvents spec version." },
      id: { type: "string", description: "A unique id for this event occurrence." },
      source: { type: "string", format: "uri-reference", description: "The event producer.", examples: [source] },
      type: { type: "string", const: type, description: "The event type (reverse-DNS)." },
      time: { type: "string", format: "date-time", description: "When the event occurred." },
      datacontenttype: { type: "string", const: "application/json" },
      data: data ?? {},
    },
    additionalProperties: true, // CloudEvents extension attributes are allowed
  };
}

// vendor facets live on an untyped view (they aren't on the typed Request — the same cast emitV4/journeys use).
const ext = (o: unknown): Record<string, unknown> => o as Record<string, unknown>;
const camelSafe = (s: string): string => s.replace(/[^A-Za-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

interface SulukJobLike { trigger?: string; queue?: string; schedule?: string; summary?: string; description?: string }
interface StoreLike { key?: string; invalidates?: string[] }

/**
 * Project the document's event surface to AsyncAPI 3.0 + CloudEvents. Returns a document with a channel + operation + CloudEvent
 * message per job / webhook / store-invalidation. If the document declares NO events, `channels`/`operations` are empty (a valid,
 * honest "no async surface" doc).
 */
export function emitAsyncApi(doc: OpenAPIv4Document): AsyncApiDocument {
  const out: AsyncApiDocument = {
    asyncapi: "3.0.0",
    info: { title: `${doc.info?.title ?? "API"} — events`, version: doc.info?.version ?? "0.0.0", description: "The event-driven surface (jobs, webhooks, store invalidations) as CloudEvents. Companion to the OpenAPI document." },
    channels: {},
    operations: {},
    components: { messages: {} },
  };
  const addMessage = (id: string, msg: AsyncApiMessage) => { out.components.messages[id] = msg; };
  const addChannelOp = (id: string, address: string, description: string, msgId: string, action: "send" | "receive", summary: string) => {
    out.channels[id] = { address, description, messages: { [msgId]: { $ref: `#/components/messages/${msgId}` } } };
    out.operations[id] = { action, channel: { $ref: `#/channels/${id}` }, summary, messages: [{ $ref: `#/channels/${id}/messages/${msgId}` }] };
  };

  // (1) JOBS — the app RECEIVES a scheduled/queued trigger.
  for (const [name, jobRaw] of Object.entries(ext(doc)["x-suluk-jobs"] as Record<string, SulukJobLike> ?? {})) {
    const job = jobRaw ?? {};
    const queued = job.trigger === "queue-consumed";
    const type = `${CE_TYPE_PREFIX}.job.${camelSafe(name)}${queued ? ".queued" : ".scheduled"}`;
    const source = queued ? `queue/${job.queue ?? name}` : `schedule/${job.schedule ?? name}`;
    const msgId = `${camelSafe(name)}Trigger`;
    addMessage(msgId, { name: type, title: `${name} trigger`, summary: job.summary, contentType: "application/cloudevents+json", payload: cloudEvent(type, source) });
    addChannelOp(camelSafe(name), source, job.description ?? `The ${name} job's trigger (${job.trigger ?? "scheduled"}).`, msgId, "receive", `Handle the ${name} job.`);
  }

  // (2) WEBHOOKS — the app RECEIVES an inbound HTTP event; the CloudEvent `data` is the webhook body.
  for (const [name, whRaw] of Object.entries(doc.webhooks ?? {})) {
    const wh = whRaw as Request;
    const type = `${CE_TYPE_PREFIX}.webhook.${camelSafe(name)}`;
    const msgId = `${camelSafe(name)}Webhook`;
    addMessage(msgId, { name: type, title: `${name} webhook`, summary: wh.summary, contentType: "application/cloudevents+json", payload: cloudEvent(type, `webhook/${name}`, wh.contentSchema as unknown) });
    addChannelOp(`${camelSafe(name)}Webhook`, `webhook/${name}`, wh.description ?? `Inbound ${name} webhook.`, msgId, "receive", `Receive the ${name} webhook.`);
  }

  // (3) STORE INVALIDATIONS — a mutation the app runs EMITS a "store refreshed" event per invalidated key (deduped across ops).
  const emitted = new Set<string>();
  for (const [uri, piRaw] of Object.entries(doc.paths ?? {})) {
    const pi = piRaw as { requests?: Record<string, Request> };
    for (const [opName, op] of Object.entries(pi.requests ?? {})) {
      const store = ext(op)["x-suluk-store"] as StoreLike | undefined;
      for (const key of store?.invalidates ?? []) {
        if (emitted.has(key)) continue;
        emitted.add(key);
        const type = `${CE_TYPE_PREFIX}.store.${camelSafe(key)}.invalidated`;
        const msgId = `${camelSafe(key)}Invalidated`;
        addMessage(msgId, { name: type, title: `${key} invalidated`, summary: `The ${key} store was invalidated and should refresh.`, contentType: "application/cloudevents+json", payload: cloudEvent(type, `op/${opName}`) });
        addChannelOp(`store_${camelSafe(key)}`, `store/${key}`, `Emitted when a mutation (e.g. ${opName} at ${uri}) invalidates the ${key} store.`, msgId, "send", `Announce the ${key} store is stale.`);
      }
    }
  }

  return out;
}
