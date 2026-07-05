/**
 * tools.ts — project an OpenAPI v4 document's operations into MCP tool descriptors. PURE: no transport, no fetch.
 * Each `Request` (an operation; the key in `pathItem.requests` is its name/identity, C009) becomes one tool whose
 * `inputSchema` is the operation's path + query params (flattened) plus, for mutations, a nested `body`. The op
 * metadata (`McpOp`) is what the executor needs to turn a tool call back into an HTTP request.
 */
import type { OpenAPIv4Document, Request, ObjectSchema, SchemaOrRef } from "@suluk/core";

export interface McpOp {
  /** Tool name (sanitized to MCP rules) — also how the executor finds the operation. */
  name: string;
  method: string;
  /** Path template with a leading slash, e.g. `/product/{id}`. */
  path: string;
  /** Path-template variable names, in template order — all required. */
  pathParams: string[];
  /** Query parameter names. */
  queryParams: string[];
  /** Whether this op carries a request body (the tool exposes it under `body`). */
  hasBody: boolean;
  /** GET/HEAD — safe, side-effect-free. The default projection only exposes these. */
  readOnly: boolean;
}

export interface McpTool {
  name: string;
  description: string;
  /** `toolsFrom` always builds `properties`/`additionalProperties` (never omits them, even when empty) — narrower
   *  than the general {@link ObjectSchema} (where every keyword is optional) to match that invariant. */
  inputSchema: ObjectSchema & { properties: Record<string, SchemaOrRef>; additionalProperties: boolean };
  op: McpOp;
}

export interface ToolsOptions {
  /** `"read"` (default) exposes only GET/HEAD operations; `"all"` also exposes mutations. */
  include?: "read" | "all";
  /** Operation names to omit. */
  hide?: string[];
  /** If set, expose ONLY these operation names (after hide). */
  only?: string[];
  /** Include `deprecated` operations (default: skip them). */
  includeDeprecated?: boolean;
}

const RESERVED_BODY = "body";

/** MCP tool names must be `[A-Za-z0-9_-]{1,64}`. Operation names usually already comply; sanitize defensively. */
function toolName(raw: string): string {
  const cleaned = raw.replace(/[^A-Za-z0-9_-]/g, "_").replace(/^_+|_+$/g, "") || "op";
  return cleaned.slice(0, 64);
}

function deref(node: unknown, doc: OpenAPIv4Document, seen = new Set<string>()): Record<string, unknown> | undefined {
  if (!node || typeof node !== "object") return undefined;
  const ref = (node as { $ref?: string }).$ref;
  if (typeof ref === "string") {
    if (seen.has(ref)) return undefined; // cycle guard
    seen.add(ref);
    const m = /^#\/components\/schemas\/(.+)$/.exec(ref);
    const name = m?.[1];
    const target = name ? (doc.components?.schemas as Record<string, unknown> | undefined)?.[name] : undefined;
    return target ? deref(target, doc, seen) : undefined;
  }
  return node as Record<string, unknown>;
}

/** Pull `{properties, required}` out of an (object) schema, dereferencing a top-level $ref first. */
function objectShape(schema: unknown, doc: OpenAPIv4Document): { properties: Record<string, SchemaOrRef>; required: string[] } {
  const s = deref(schema, doc);
  const properties = (s?.properties && typeof s.properties === "object" ? (s.properties as Record<string, SchemaOrRef>) : {});
  const required = Array.isArray(s?.required) ? (s!.required as string[]) : [];
  return { properties, required };
}

/** Extract `{name}` template variables from a path, in order. */
function templateVars(path: string): string[] {
  return Array.from(path.matchAll(/\{([^}]+)\}/g), (m) => m[1]);
}

export function toolsFrom(doc: OpenAPIv4Document, opts: ToolsOptions = {}): McpTool[] {
  const include = opts.include ?? "read";
  const hide = new Set(opts.hide ?? []);
  const only = opts.only ? new Set(opts.only) : null;
  const out: McpTool[] = [];
  const used = new Set<string>();

  for (const [rawPath, pathItem] of Object.entries(doc.paths ?? {})) {
    const requests = pathItem.requests ?? {};
    const path = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
    const pathVars = templateVars(path);

    for (const [opName, req] of Object.entries(requests) as [string, Request][]) {
      const method = String(req.method ?? "GET").toUpperCase();
      const readOnly = method === "GET" || method === "HEAD";

      if (req.deprecated && !opts.includeDeprecated) continue;
      if (include === "read" && !readOnly) continue;
      if (hide.has(opName)) continue;
      if (only && !only.has(opName)) continue;

      const ps = req.parameterSchema ?? {};
      const pathShape = objectShape(ps.path, doc);
      const queryShape = objectShape(ps.query, doc);
      const bodySchema = ps.body ?? req.contentSchema;
      const hasBody = !readOnly && bodySchema != null;

      const properties: Record<string, SchemaOrRef> = {};
      const required: string[] = [];
      // Every template var IS a path param (the uriTemplate is authoritative, C019); the path schema only adds types.
      // Union them — using one OR the other drops a var the other side declares, yielding an unsubstitutable {var}.
      const pathNames = Array.from(new Set([...pathVars, ...Object.keys(pathShape.properties)]));
      for (const p of pathNames) { properties[p] = pathShape.properties[p] ?? { type: "string" }; required.push(p); }
      for (const [q, schema] of Object.entries(queryShape.properties)) { if (q in properties) continue; properties[q] = schema; if (queryShape.required.includes(q)) required.push(q); }
      if (hasBody) { properties[RESERVED_BODY] = deref(bodySchema, doc) ?? bodySchema; required.push(RESERVED_BODY); }

      // Dedup colliding names while keeping inside MCP's 64-char limit: RESERVE room for the suffix rather than
      // re-truncating it away (which would loop forever when two ops share an already-64-char sanitized prefix).
      const base = toolName(opName);
      let name = base;
      for (let i = 1; used.has(name); i++) { const sfx = `_${i}`; name = base.slice(0, 64 - sfx.length) + sfx; }
      used.add(name);

      out.push({
        name,
        description: req.summary || req.description || `${method} ${path}`,
        inputSchema: { type: "object", properties, ...(required.length ? { required } : {}), additionalProperties: false },
        op: { name, method, path, pathParams: pathNames, queryParams: Object.keys(queryShape.properties), hasBody, readOnly },
      });
    }
  }
  return out;
}
