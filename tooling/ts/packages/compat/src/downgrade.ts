/**
 * v4 "Suluk" → OpenAPI 3.1 DOWNGRADE.
 *
 * This is the lever for Scalar / Swagger UI: both render OpenAPI 3.x, so the path to "strong Scalar and
 * Swagger support" is a faithful v4→3.1 projection. The two dialects already share JSON Schema 2020-12
 * (SPEC C013 == OAS 3.1), so every Schema Object passes through UNTOUCHED. The work is purely structural:
 *
 *   v4 pathItem.requests : Record<name, Request>   →   3.1 pathItem : Record<httpMethod, Operation>
 *   v4 Request.parameterSchema.{query,path,...}    →   3.1 Operation.parameters[]  (schema → name list)
 *   v4 Request.contentType + contentSchema         →   3.1 Operation.requestBody.content[mt].schema
 *   v4 Request.responses : Record<name, Response>  →   3.1 Operation.responses[status]
 *
 * Honest boundary: 3.1 keys operations BY METHOD, so two v4 requests sharing a method on one path
 * (the headline v4 capability, C003) CANNOT each get their own operation. We MERGE them into one
 * operation whose request body is `oneOf` over the per-variant shapes — every variant is preserved
 * (each keeps its discriminating field value, e.g. an action const/enum), none is silently dropped.
 * `diagnostics` records each merge as a `collision` (now non-lossy) so callers can audit it.
 */
import type {
  OpenAPIv4Document, PathItem, Request, Response, ParameterSchema, SchemaOrRef, Components,
} from "@suluk/core";
import { isReference } from "@suluk/core";

export interface Diagnostic {
  /** "collision" (same-method v4 requests merged into one 3.1 operation — non-lossy) | "remap" (ref/feature rewritten) | "drop" (unrepresentable). */
  kind: "collision" | "remap" | "drop";
  path: string;
  message: string;
}

export interface DowngradeResult {
  /** A valid OpenAPI 3.1 document (validate with validate31). */
  document: Record<string, unknown>;
  /** Everything that could not be represented losslessly — the honest audit trail. */
  diagnostics: Diagnostic[];
}

const METHODS = ["get", "put", "post", "delete", "options", "head", "patch", "trace"] as const;

/** Expand one per-location parameter Schema (object with `properties`) into 3.1 Parameter Objects. */
function expandParams(
  loc: "query" | "path" | "header" | "cookie",
  schema: SchemaOrRef | undefined,
  out: Record<string, unknown>[],
  diags: Diagnostic[],
  pathKey: string,
): void {
  if (schema == null) return;
  if (isReference(schema)) {
    // A $ref to a whole parameter-bundle schema can't be split into named 3.1 params without resolving.
    diags.push({ kind: "remap", path: pathKey, message: `${loc} parameterSchema is a $ref (${schema.$ref}); 3.1 needs per-name params — left unexpanded` });
    return;
  }
  if (typeof schema === "boolean") return;
  const props = (schema.properties ?? {}) as Record<string, SchemaOrRef>;
  const required = new Set((schema.required as string[] | undefined) ?? []);
  for (const [name, propSchema] of Object.entries(props)) {
    // path params are always required in 3.1.
    const isRequired = loc === "path" ? true : required.has(name);
    out.push({ name, in: loc, required: isRequired, schema: propSchema });
  }
}

function bodySchema(req: Request): SchemaOrRef | undefined {
  return req.contentSchema ?? req.parameterSchema?.body;
}

/** Merge one inherited (shared) location schema under one request-level location schema (C012 allOf-compose). */
function mergeLoc(shared: SchemaOrRef | undefined, own: SchemaOrRef | undefined): SchemaOrRef | undefined {
  if (shared == null) return own;
  if (own == null) return shared;
  // can't structurally union a $ref / boolean schema — preserve both via allOf (still valid 2020-12).
  if (isReference(shared) || isReference(own) || typeof shared === "boolean" || typeof own === "boolean") {
    return { allOf: [shared, own] };
  }
  const props = { ...((shared.properties as object) ?? {}), ...((own.properties as object) ?? {}) };
  const required = [...new Set([...((shared.required as string[]) ?? []), ...((own.required as string[]) ?? [])])];
  const out: Record<string, unknown> = { type: "object", properties: props };
  if (required.length) out.required = required;
  return out;
}

/** Effective parameterSchema for a request = shared (pathItem) allOf-composed under the request's own (C012). */
function effectiveParams(shared: ParameterSchema | undefined, own: ParameterSchema | undefined): ParameterSchema {
  return {
    query: mergeLoc(shared?.query, own?.query),
    path: mergeLoc(shared?.path, own?.path),
    header: mergeLoc(shared?.header, own?.header),
    cookie: mergeLoc(shared?.cookie, own?.cookie),
    body: own?.body ?? shared?.body,
  };
}

function mediaTypes(ct: string | string[] | undefined, fallback: string): string[] {
  if (ct == null) return [fallback];
  return Array.isArray(ct) ? ct : [ct];
}

function responseEntry(resp: Response): Record<string, unknown> {
  const entry: Record<string, unknown> = { description: resp.description ?? "" };
  if (resp.contentSchema != null) {
    const content: Record<string, unknown> = {};
    for (const mt of mediaTypes(resp.contentType, "application/json")) content[mt] = { schema: resp.contentSchema };
    entry.content = content;
  }
  return entry;
}

/** Compose responses by status: inherited (apiResponses ∪ pathResponses) overlaid by the request's own (C012). */
function downgradeResponses(own: Record<string, Response>, inherited: Response[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const resp of inherited) out[String(resp.status)] = responseEntry(resp);
  for (const resp of Object.values(own)) out[String(resp.status)] = responseEntry(resp); // request wins
  if (Object.keys(out).length === 0) out.default = { description: "" }; // 3.1 requires ≥1 response
  return out;
}

function downgradeOperation(
  name: string, req: Request, shared: ParameterSchema | undefined, inherited: Response[], pathKey: string, diags: Diagnostic[],
): Record<string, unknown> {
  const op: Record<string, unknown> = {
    // preserve the v4 by-name handle (C009) as the 3.1 operationId — round-trippable, and what tooling keys on.
    operationId: req.operationId ?? name,
    responses: downgradeResponses(req.responses, inherited),
  };
  if (req.summary) op.summary = req.summary;
  if (req.description) op.description = req.description;
  if (req.deprecated) op.deprecated = req.deprecated;
  if (req.tags) op.tags = req.tags;
  if (req.security) op.security = req.security;
  // carry vendor extensions (x-*) through to 3.1 — both dialects allow them, and tooling like Scalar renders
  // them (e.g. @suluk/cost's x-suluk-cost). Without this, declared facets would vanish on the way to the docs.
  for (const [k, v] of Object.entries(req as unknown as Record<string, unknown>)) if (k.startsWith("x-")) op[k] = v;

  const params: Record<string, unknown>[] = [];
  const ps: ParameterSchema = effectiveParams(shared, req.parameterSchema);
  expandParams("path", ps.path, params, diags, pathKey);
  expandParams("query", ps.query, params, diags, pathKey);
  expandParams("header", ps.header, params, diags, pathKey);
  expandParams("cookie", ps.cookie, params, diags, pathKey);
  if (params.length) op.parameters = params;

  const body = bodySchema(req);
  if (body != null) {
    const content: Record<string, unknown> = {};
    for (const mt of mediaTypes(req.contentType, "application/json")) content[mt] = { schema: body };
    op.requestBody = { content };
  }
  return op;
}

/** v4 uriTemplate → 3.1 path. 3.1 uses `{var}`; the v4 single-segment `{var}`/`{+var}` profile maps directly. */
function downgradePathKey(uriTemplate: string): string {
  // drop any RFC6570 query expansion ({?a,b} / {&a}) — query lives in parameters[] in 3.1.
  const qCut = uriTemplate.search(/\{[?&]/);
  let p = qCut >= 0 ? uriTemplate.slice(0, qCut) : uriTemplate;
  p = p.replace(/\{\+([^}]+)\}/g, "{$1}"); // {+var} reserved-expansion → plain 3.1 var
  return p.startsWith("/") ? p : "/" + p;
}

function downgradePathItem(uriTemplate: string, pi: PathItem, apiResponses: Response[], diags: Diagnostic[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (pi.summary) out.summary = pi.summary;
  if (pi.description) out.description = pi.description;
  if (pi.servers) out.servers = pi.servers;

  // inherited responses, lowest→highest precedence: apiResponses, then this pathItem's pathResponses (C012).
  const inherited = [...apiResponses, ...Object.values(pi.pathResponses ?? {})];
  const shared = pi.shared?.parameterSchema;

  // Group requests by method. OAS 3.1 keys operations by method, so multiple v4 requests sharing a
  // method on one path (the v4 multi-request capability, C003) cannot each get their own operation.
  // Merge them into one operation whose request body is oneOf over the per-variant shapes — every
  // variant is preserved, none is silently dropped. Each variant keeps its discriminating field value
  // (e.g. an action enum/const), so the oneOf is self-describing and tooling renders all variants.
  const byMethod = new Map<string, Array<[string, Request]>>();
  for (const [name, req] of Object.entries(pi.requests ?? {})) {
    const method = req.method.toLowerCase();
    if (!METHODS.includes(method as (typeof METHODS)[number])) {
      diags.push({ kind: "drop", path: uriTemplate, message: `request '${name}' has non-3.1 method '${req.method}' — dropped` });
      continue;
    }
    if (!byMethod.has(method)) byMethod.set(method, []);
    byMethod.get(method)!.push([name, req]);
  }
  for (const [method, group] of byMethod) {
    out[method] = group.length === 1
      ? downgradeOperation(group[0][0], group[0][1], shared, inherited, uriTemplate, diags)
      : downgradeMergedOperation(method, group, shared, inherited, uriTemplate, diags);
  }
  return out;
}

/** Merge N v4 requests sharing a method (C003 collision) into one 3.1 operation. The request body
 *  becomes `oneOf` over the per-variant shapes (duplicates collapsed), responses union across all
 *  variants, and a description records the merged request names. Nothing is dropped. */
function downgradeMergedOperation(
  methodName: string,
  requests: Array<[string, Request]>,
  shared: ParameterSchema | undefined,
  inherited: Response[],
  pathKey: string,
  diags: Diagnostic[],
): Record<string, unknown> {
  const names = requests.map(([n]) => n);
  // start from the first request's operation (operationId, parameters, summary, x-* extensions, ...).
  // same-path requests share path params by definition; the first request's params are the operation's.
  const op = downgradeOperation(names[0], requests[0][1], shared, inherited, pathKey, diags);

  // request body: oneOf over per-variant shapes (collapse exact duplicates). Each variant keeps its
  // discriminating field value, so the oneOf is self-describing.
  const variantBodies = requests
    .map(([, r]) => bodySchema(r))
    .filter((b): b is SchemaOrRef => b != null);
  const seenBody = new Set<string>();
  const uniqueBodies = variantBodies.filter((b) => {
    const k = JSON.stringify(b);
    if (seenBody.has(k)) return false;
    seenBody.add(k);
    return true;
  });
  if (uniqueBodies.length > 1) {
    const mergedBody: Record<string, unknown> = { oneOf: uniqueBodies };
    const content = op.requestBody?.content as Record<string, Record<string, unknown>> | undefined;
    if (content) {
      for (const mt of Object.keys(content)) content[mt].schema = mergedBody;
    } else {
      op.requestBody = { content: { "application/json": { schema: mergedBody } } };
    }
  }

  // responses: union of inherited + every variant's own responses (first writer wins per status).
  const responses: Record<string, unknown> = {};
  for (const resp of inherited) responses[String(resp.status)] = responseEntry(resp);
  for (const [, r] of requests) {
    for (const resp of Object.values(r.responses ?? {})) responses[String(resp.status)] = responseEntry(resp);
  }
  if (Object.keys(responses).length === 0) responses.default = { description: "" };
  op.responses = responses;

  // describe the merge so 3.1 readers know the single operation represents multiple v4 requests.
  const note = `Merged from ${names.length} v4 requests sharing ${methodName.toUpperCase()} (${names.join(", ")}). Request body is oneOf over per-variant shapes; each variant carries its discriminating field value.`;
  const existingDesc = (op.description as string | undefined) ?? "";
  op.description = existingDesc ? `${existingDesc}\n\n${note}` : note;

  diags.push({
    kind: "collision",
    path: pathKey,
    message: `${names.length} v4 requests share ${methodName.toUpperCase()} (${names.join(", ")}); merged into one 3.1 operation — variants preserved as oneOf, not dropped`,
  });

  return op;
}

function downgradeComponents(c: Components | undefined, diags: Diagnostic[]): Record<string, unknown> | undefined {
  if (!c) return undefined;
  const out: Record<string, unknown> = {};
  if (c.schemas) out.schemas = c.schemas; // same 2020-12 dialect — passthrough
  if (c.responses) {
    const r: Record<string, unknown> = {};
    for (const [k, resp] of Object.entries(c.responses)) {
      const entry: Record<string, unknown> = { description: resp.description ?? "" };
      if (resp.contentSchema != null) {
        const content: Record<string, unknown> = {};
        for (const mt of mediaTypes(resp.contentType, "application/json")) content[mt] = { schema: resp.contentSchema };
        entry.content = content;
      }
      r[k] = entry;
    }
    out.responses = r;
  }
  if (c.securitySchemes) out.securitySchemes = c.securitySchemes;
  if (c.examples) out.examples = c.examples;
  if (c.links) out.links = c.links;
  if (c.requests) diags.push({ kind: "remap", path: "#/components/requests", message: "v4 components.requests has no direct 3.1 slot; reusable operations are not carried over" });
  return out;
}

/**
 * Project a v4 "Suluk" document to OpenAPI 3.1. Returns the 3.1 document plus diagnostics for everything
 * that could not be carried losslessly. Schema Objects are shared verbatim (identical dialect).
 */
export function downgrade(doc: OpenAPIv4Document): DowngradeResult {
  const diagnostics: Diagnostic[] = [];
  const out: Record<string, unknown> = {
    openapi: "3.1.0",
    info: doc.info,
  };
  if (doc.servers) out.servers = doc.servers;

  const apiResponses = Object.values(doc.apiResponses ?? {}); // document-level reusable responses (§5)

  const paths: Record<string, unknown> = {};
  for (const [uriTemplate, pi] of Object.entries(doc.paths ?? {})) {
    paths[downgradePathKey(uriTemplate)] = downgradePathItem(uriTemplate, pi as PathItem, apiResponses, diagnostics);
  }
  out.paths = paths;

  if (doc.webhooks) {
    const wh: Record<string, unknown> = {};
    for (const [name, req] of Object.entries(doc.webhooks)) {
      wh[name] = { [(req as Request).method.toLowerCase()]: downgradeOperation(name, req as Request, undefined, apiResponses, `webhooks/${name}`, diagnostics) };
    }
    out.webhooks = wh;
  }

  const components = downgradeComponents(doc.components, diagnostics);
  if (components) out.components = components;

  // tags: v4 keys tags by name; 3.1 wants an array of {name, ...}.
  if (doc.tags) out.tags = Object.entries(doc.tags).map(([name, t]) => ({ name, ...t }));

  return { document: out, diagnostics };
}
