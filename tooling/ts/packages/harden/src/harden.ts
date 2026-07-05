/**
 * The hardening TRANSFORM — the answer to {@link auditDocument}'s findings. It adds sensible default BOUNDS so
 * untrusted input can't be unboundedly large or carry control characters that break parsers: every string gets a
 * maxLength + a control-char-rejecting pattern, every number a maximum/minimum, every array a maxItems, every object
 * is closed (additionalProperties:false). Authors TIGHTEN per field (a slug isn't 1024 chars) — this is the floor
 * that turns an F/D contract into a B. The inverse of the audit: audit grades the gaps, harden fills them.
 */
import type { OpenAPIv4Document, SchemaOrRef } from "@suluk/core";

type S = Record<string, unknown>;

/** Overridable floors — defaults match the baseline (1024 chars / ±1e12 / 1000 items / no control chars). */
export interface HardenOptions {
  maxLength?: number;
  /** reject NUL + control chars (tab/newline/CR allowed). Pass null to skip adding a pattern. */
  textPattern?: string | null;
  numberMax?: number;
  numberMin?: number;
  maxItems?: number;
}

// Reject NUL + control chars that break parsers (tab/newline/CR are allowed by the range below).
const SAFE_TEXT = "^[^\\u0000-\\u0008\\u000b\\u000c\\u000e-\\u001f]*$";
const DEFAULTS: Required<HardenOptions> = { maxLength: 1024, textPattern: SAFE_TEXT, numberMax: 1_000_000_000_000, numberMin: -1_000_000_000_000, maxItems: 1000 };

/** Recursively add baseline bounds to a JSON Schema. Idempotent — never overrides an author-set bound. */
export function hardenSchema<T extends SchemaOrRef>(schema: T, opts: HardenOptions = {}): T {
  const o = { ...DEFAULTS, ...opts };
  const go = (sch: unknown): unknown => {
    if (sch == null || typeof sch !== "object") return sch;
    if (Array.isArray(sch)) return sch.map(go);
    const s: S = { ...(sch as S) };
    const t = Array.isArray(s.type) ? (s.type as string[])[0] : s.type;
    if (s.properties) { const p: S = {}; for (const [k, v] of Object.entries(s.properties as S)) p[k] = go(v); s.properties = p; if (s.additionalProperties === undefined) s.additionalProperties = false; }
    if (s.items) s.items = go(s.items);
    for (const key of ["oneOf", "anyOf", "allOf"] as const) if (Array.isArray(s[key])) s[key] = (s[key] as unknown[]).map(go);
    const bounded = s.enum !== undefined || s.const !== undefined || s.format !== undefined;
    if (t === "string" && !bounded) {
      if (s.maxLength === undefined) s.maxLength = o.maxLength;
      if (s.pattern === undefined && o.textPattern != null) s.pattern = o.textPattern;
    }
    if (t === "integer" || t === "number") {
      if (s.maximum === undefined && s.exclusiveMaximum === undefined) s.maximum = o.numberMax;
      if (s.minimum === undefined && s.exclusiveMinimum === undefined) s.minimum = o.numberMin;
    }
    if (t === "array" && s.maxItems === undefined) s.maxItems = o.maxItems;
    return s;
  };
  return go(schema) as T;
}

/** Harden EVERY input schema in a built v4 document IN PLACE — request bodies + all parameter slots (incl. the route
 *  generator's path params, otherwise unbounded strings). Idempotent. The transform that makes assertGrade pass. */
export function hardenDocument<T extends OpenAPIv4Document>(doc: T, opts: HardenOptions = {}): T {
  for (const pi of Object.values(doc.paths ?? {})) {
    for (const req of Object.values(pi.requests ?? {})) {
      if (req.contentSchema) req.contentSchema = hardenSchema(req.contentSchema, opts);
      const ps = req.parameterSchema;
      if (ps) for (const loc of ["query", "path", "header", "cookie", "body"] as const) if (ps[loc]) ps[loc] = hardenSchema(ps[loc], opts);
    }
  }
  return doc;
}
