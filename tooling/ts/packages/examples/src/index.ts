/**
 * @suluk/examples — example precedence + deterministic, origin-aware schema synthesis.
 *
 * The shared, ZERO-DEPENDENCY leaf both @suluk/journeys (BDD outlines + runnable suite) and @suluk/sdk (typed client
 * metadata + sampling) read. Extracted from @suluk/journeys (C040-P2) when @suluk/sdk needed the same reader — journeys
 * already depends on sdk, so the reader had to sit BELOW both (it was built self-contained for exactly this move).
 *
 * `resolveExample` picks a request/response example by precedence — a tester-curated PUBLIC example wins over a
 * MAINTAINER example (an explicit one, or the schema's own `examples`/`example`/`const`), which wins over a SYNTHETIC
 * value derived from the schema shape. The synthetic tier is a DETERMINISTIC synthesizer (no external faker dep): same
 * (schema, hint) -> same value, so BDD tests don't flap, and a synthesized value is ALWAYS lowest-precedence, always
 * overridable, and carries `synthetic: true`. That precedence IS the reconciliation with the journeys arc's
 * never-launder discipline — nothing synthetic is ever presented as authoritative.
 *
 * This module imports NOTHING (no @suluk, no external) so it stays on the VALUE side of the C040 wall (a pure projector
 * core must never import it) and is consumable by any package without a dependency cycle. Witnessed by test/wall.test.ts.
 */

/** A JSON Schema 2020-12 object (the v4 inner-schema shape). Opaque-ish; we read a known subset. */
export type JsonSchema = Record<string, unknown>;

/** Which source supplied the resolved value. `public` (highest) > `maintainer` > `synthetic` (lowest). */
export type ExampleTier = "public" | "maintainer" | "synthetic";

/** The two human-authored tiers a caller may supply; the synthetic tier is derived from the schema. */
export interface ExampleSources {
  /** tier 3 (highest) — a tester-curated, willing-to-expose example. After C040-P4 promotion it also lives in Zod meta. */
  public?: unknown;
  /** tier 2 — an explicit maintainer example (overrides the schema's own `examples`/`example`/`const`). */
  maintainer?: unknown;
}

export interface ResolvedExample {
  value: unknown;
  /** which tier won. */
  tier: ExampleTier;
  /** true IFF the value was synthesized from the schema shape (the honest never-launder marker). */
  synthetic: boolean;
  /** a short, human-readable note on where the value came from (for reports / docs provenance). */
  provenance: string;
}

// ---------------------------------------------------------------------------------------------------------------------
// Field origin (C041) — which fields a client may faker, which are sourced from elsewhere, which are server-computed.
// Authored in Zod `.meta({ "x-suluk-origin": ..., "x-suluk-from": ... })`, carried verbatim by zodToV4, read here only
// (the matcher never sees it). This makes the synthesizer CORRECT: it stops inventing ids/totals, and a `sourced` field
// becomes a machine-wireable edge both the journeys emitter and the @suluk/sdk generator can consume.
// ---------------------------------------------------------------------------------------------------------------------

export const ORIGIN_KEYWORD = "x-suluk-origin";
export const FROM_KEYWORD = "x-suluk-from";

/** `input` = the client is the authority (free, faker-able); `sourced` = retrieved elsewhere (wired); `computed` = server-derived. */
export type FieldOrigin = "input" | "sourced" | "computed";

/** A machine-wireable source edge for a `sourced` field: pull `select` (default "id") from operation `op`'s response. */
export interface SourceRef {
  /** the source operation's v4 by-name handle (C009 identity: `op.name`). */
  op: string;
  /** a dotted path into the source op's RESPONSE to pull (default "id"). */
  select?: string;
}

/** `x-suluk-from` is EITHER a free human note (string, doc-only) OR a structured, wireable `SourceRef`. */
export type FieldSource = string | SourceRef;

export interface FieldDescriptor {
  name: string;
  origin: FieldOrigin;
  /** the raw `x-suluk-from` when it is a human note (string). */
  from?: string;
  /** the machine-wireable edge when `x-suluk-from` is structured `{ op, select? }`. */
  source?: SourceRef;
  /** true IFF a client may freely synthesize/fill it (origin === "input"). */
  fakerable: boolean;
  required: boolean;
}

/** Read a property's origin: explicit `x-suluk-origin` wins; else `readOnly` ⇒ `computed`; else default `input`. */
export function fieldOrigin(schema: JsonSchema | undefined): FieldOrigin {
  if (!schema || typeof schema !== "object") return "input";
  const o = schema[ORIGIN_KEYWORD];
  if (o === "input" || o === "sourced" || o === "computed") return o;
  if (schema.readOnly === true) return "computed";
  return "input";
}

/** The structured source edge if `x-suluk-from` names an `op`; otherwise undefined (a free note is not wireable). */
export function asSourceRef(from: unknown): SourceRef | undefined {
  if (from && typeof from === "object" && typeof (from as { op?: unknown }).op === "string") {
    const r = from as { op: string; select?: unknown };
    return { op: r.op, select: typeof r.select === "string" ? r.select : undefined };
  }
  return undefined;
}

/**
 * Describe the TOP-LEVEL fields of an object schema by origin — the surface a client / the @suluk/sdk generator uses to
 * know what it may freely fill (`fakerable`), what is wired from elsewhere (`source`), and what is server-computed.
 */
export function describeInputs(schema: JsonSchema | undefined): FieldDescriptor[] {
  const props = (schema?.properties ?? {}) as Record<string, JsonSchema>;
  const required = new Set(Array.isArray(schema?.required) ? (schema!.required as string[]) : []);
  return Object.entries(props).map(([name, sub]) => {
    const from = sub[FROM_KEYWORD];
    return {
      name,
      origin: fieldOrigin(sub),
      from: typeof from === "string" ? from : undefined,
      source: asSourceRef(from),
      fakerable: fieldOrigin(sub) === "input",
      required: required.has(name),
    };
  });
}

/**
 * Resolve a `sourced` field's value from a scenario-scoped bag of captured operation results (keyed by `op.name`). The
 * shared primitive both the journeys emitter (carried-data across a journey) and an sdk chaining helper use. Pure.
 */
export function resolveSourced(captured: Record<string, unknown>, ref: SourceRef): unknown {
  let cur: unknown = captured[ref.op];
  for (const seg of (ref.select ?? "id").split(".").filter(Boolean)) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[seg];
  }
  return cur;
}

/** The maintainer example carried by the schema itself: `examples[0]` > `example` (3.x) > `const`. */
function schemaExample(schema: JsonSchema): { value: unknown; from: string } | undefined {
  const exs = schema.examples;
  if (Array.isArray(exs) && exs.length > 0) return { value: exs[0], from: "schema.examples" };
  if ("example" in schema) return { value: schema.example, from: "schema.example" };
  if ("const" in schema) return { value: schema.const, from: "schema.const" };
  return undefined;
}

/**
 * Resolve a single example by precedence. `hint` (typically the field/op name) only steers SYNTHETIC string values; it
 * never changes which tier wins.
 */
export function resolveExample(
  schema: JsonSchema | undefined,
  sources: ExampleSources = {},
  hint = "value",
  opts: SynthOptions = {},
): ResolvedExample {
  if (sources.public !== undefined) {
    return { value: sources.public, tier: "public", synthetic: false, provenance: "tester-public" };
  }
  if (sources.maintainer !== undefined) {
    return { value: sources.maintainer, tier: "maintainer", synthetic: false, provenance: "maintainer-explicit" };
  }
  const fromSchema = schema ? schemaExample(schema) : undefined;
  if (fromSchema) {
    return { value: fromSchema.value, tier: "maintainer", synthetic: false, provenance: fromSchema.from };
  }
  return { value: synthesize(schema ?? {}, hint, opts), tier: "synthetic", synthetic: true, provenance: "synthetic" };
}

// ---------------------------------------------------------------------------------------------------------------------
// Deterministic synthesis — tier 1. No randomness, no Date.now: a fixed, readable representative per schema shape.
// ---------------------------------------------------------------------------------------------------------------------

const MAX_DEPTH = 6;

function num(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

/** The effective primitive/compound kind: explicit `type` (first of an array) else inferred from `properties`/`items`. */
function pickType(schema: JsonSchema): string | undefined {
  const t = schema.type;
  if (typeof t === "string") return t;
  if (Array.isArray(t) && t.length > 0 && typeof t[0] === "string") return t[0] as string;
  if (schema.properties || schema.required || schema.additionalProperties) return "object";
  if (schema.items) return "array";
  return undefined;
}

/** Naive singularization for an array element hint (`files` -> `file`). Presentational only. */
function singular(hint: string): string {
  return hint.endsWith("ies") ? `${hint.slice(0, -3)}y` : hint.endsWith("s") ? hint.slice(0, -1) : hint;
}

function synthString(schema: JsonSchema, hint: string): string {
  const fmt = typeof schema.format === "string" ? schema.format : undefined;
  switch (fmt) {
    case "email":
      return "user@example.com";
    case "uuid":
      return "00000000-0000-4000-8000-000000000000";
    case "date-time":
      return "2026-01-01T00:00:00Z";
    case "date":
      return "2026-01-01";
    case "time":
      return "00:00:00";
    case "uri":
    case "url":
    case "uri-reference":
      return "https://example.com";
    case "hostname":
      return "example.com";
    case "ipv4":
      return "192.0.2.1";
    default:
      break;
  }
  let s = hint && /^[a-z0-9_-]+$/i.test(hint) ? hint : "string";
  const min = num(schema.minLength);
  const max = num(schema.maxLength);
  if (min !== undefined && s.length < min) s = s.padEnd(min, "x");
  if (max !== undefined && s.length > max) s = s.slice(0, max);
  return s;
}

function synthNumber(schema: JsonSchema, integer: boolean): number {
  const min = num(schema.minimum);
  const exclMin = num(schema.exclusiveMinimum);
  const max = num(schema.maximum);
  let v: number;
  if (min !== undefined) v = min;
  else if (exclMin !== undefined) v = exclMin + (integer ? 1 : 1);
  else if (max !== undefined) v = max;
  else v = integer ? 1 : 1;
  return integer ? Math.trunc(v) : v;
}

/** Direction controls origin handling: a "request" example omits server-`computed` fields a client never sends; a
 *  "response" example omits `writeOnly` fields. Default "request". */
export type SynthDirection = "request" | "response";
export interface SynthOptions {
  direction?: SynthDirection;
}

/**
 * A deterministic, schema-shaped example value. `const`/`enum`/`default`/explicit `examples` win (so a synthesized
 * object's fields respect pinned values); otherwise a fixed representative is chosen per type. Object fields are
 * filtered by origin/direction (see SynthOptions). A `sourced` field IS synthesized (a type-valid representative) — the
 * wiring layer overrides it via describeInputs/resolveSourced; it is never laundered as free input.
 */
export function synthesize(schema: JsonSchema, hint = "value", opts: SynthOptions = {}): unknown {
  return synthNode(schema ?? {}, hint, opts, 0);
}

function synthNode(schema: JsonSchema, hint: string, opts: SynthOptions, depth: number): unknown {
  if (!schema || typeof schema !== "object") return null;

  if ("const" in schema) return schema.const;
  if (Array.isArray(schema.enum) && schema.enum.length > 0) return schema.enum[0];
  if (Array.isArray(schema.examples) && schema.examples.length > 0) return schema.examples[0];
  if ("example" in schema) return schema.example;
  if ("default" in schema) return schema.default;

  // composition: merge allOf object branches; take the first anyOf/oneOf branch.
  if (Array.isArray(schema.allOf) && schema.allOf.length > 0) {
    const merged: JsonSchema = Object.assign({}, ...(schema.allOf as JsonSchema[]), schema);
    delete merged.allOf;
    return synthNode(merged, hint, opts, depth);
  }
  for (const key of ["anyOf", "oneOf"] as const) {
    const parts = schema[key];
    if (Array.isArray(parts) && parts.length > 0) return synthNode(parts[0] as JsonSchema, hint, opts, depth);
  }

  switch (pickType(schema)) {
    case "string":
      return synthString(schema, hint);
    case "integer":
      return synthNumber(schema, true);
    case "number":
      return synthNumber(schema, false);
    case "boolean":
      return true;
    case "null":
      return null;
    case "array": {
      if (depth >= MAX_DEPTH) return [];
      const items = (schema.items ?? {}) as JsonSchema;
      const count = Math.max(1, num(schema.minItems) ?? 1);
      const out: unknown[] = [];
      for (let i = 0; i < count; i++) out.push(synthNode(items, singular(hint), opts, depth + 1));
      return out;
    }
    case "object":
      return synthObject(schema, opts, depth);
    default:
      if (schema.properties) return synthObject(schema, opts, depth);
      return `<${hint}>`;
  }
}

/**
 * Synthesize the declared properties (a full example a tester can trim), filtered by origin/direction: a REQUEST example
 * drops `computed` (server-derived) fields a client never sends; a RESPONSE example drops `writeOnly` fields.
 */
function synthObject(schema: JsonSchema, opts: SynthOptions, depth: number): Record<string, unknown> {
  if (depth >= MAX_DEPTH) return {};
  const direction: SynthDirection = opts.direction ?? "request";
  const props = (schema.properties ?? {}) as Record<string, JsonSchema>;
  const out: Record<string, unknown> = {};
  for (const [key, sub] of Object.entries(props)) {
    if (direction === "request" && fieldOrigin(sub) === "computed") continue; // client never sends server-derived fields
    if (direction === "response" && sub.writeOnly === true) continue; // write-only never appears in a response
    out[key] = synthNode(sub, key, opts, depth + 1);
  }
  return out;
}
