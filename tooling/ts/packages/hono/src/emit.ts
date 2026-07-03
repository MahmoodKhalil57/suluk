/**
 * emitV4 — the keystone Derivation: render(contracts, principal, now) -> v4 Document.
 *
 * NOT a static file: the document is a pure function of the contracts × the requesting principal (scopes,
 * the "who") × time (now, the "when"). A public export is just emitV4(routes) with no principal/now.
 */
import { buildAda, PROBLEM_CONTENT_TYPE, PROBLEM_DETAILS_SCHEMA, PROBLEM_COMPONENT_BY_STATUS, problemSchemaFor, type ProblemStatus } from "@suluk/core";
import type {
  OpenAPIv4Document, PathItem, Request, Response, ParameterSchema, SecurityRequirement, Server, Info, SecurityScheme,
  Components, Schema,
} from "@suluk/core";
import { zodToV4 } from "@suluk/zod";
import { responseList, type RouteContract, type Method } from "./contract";

export interface EmitContext {
  info?: Partial<Info>;
  servers?: Server[];
  /** The "who": include only operations whose required scopes the principal holds. Omit ⇒ full public doc. */
  principal?: { scopes?: string[] };
  /** The "when": ISO date / Date. Drives deprecatedSince + removedSince. Omit ⇒ no time filtering. */
  now?: string | Date;
  /** Name of the security scheme that `scopes` map onto (e.g. "bearerAuth"). Enables scopes→security. */
  securityScheme?: string;
  /** Declared security schemes for components (C014). */
  securitySchemes?: Record<string, SecurityScheme>;
  /** Include operations flagged deprecated (default true; they are marked, not hidden). */
  includeDeprecated?: boolean;
  /**
   * Synthesize RFC-9457 error responses (401/403 from access, 429 from a rate-limit facet, always-500, plus any
   * `route.errors`) + a shared `components.schemas.ProblemDetails`. Default true — the SDK's `isApiError` guard and
   * testgen's error-conformance need declared non-2xx responses to check. Set false for a success-only projection.
   */
  synthesizeErrors?: boolean;
}

/** A human title per synthesized error status (RFC-9457 `description`). */
const ERROR_DESCRIPTION: Readonly<Record<number, string>> = {
  400: "Bad request", 401: "Unauthorized", 402: "Payment required", 403: "Forbidden",
  404: "Not found", 409: "Conflict", 429: "Too many requests", 500: "Internal server error", 502: "Bad gateway",
};

/**
 * Which error statuses an operation declares it can return: explicit `route.errors`, + 401/403 when the op is
 * auth-gated (it can deny), + 429 when it declares a rate-limit budget, + always-500 (any handler can fail).
 */
function errorStatusesFor(route: RouteContract, ctx: EmitContext): number[] {
  if (ctx.synthesizeErrors === false) return [];
  const set = new Set<number>(route.errors ?? []);
  if ((route.scopes && route.scopes.length > 0) || route.security) { set.add(401); set.add(403); }
  if (route.rateLimit) set.add(429);
  set.add(500);
  return [...set].sort((a, b) => a - b);
}

export interface EmitDiagnostic {
  kind: "collision" | "filtered" | "note";
  operation?: string;
  message: string;
}

export interface EmitResult {
  document: OpenAPIv4Document;
  diagnostics: EmitDiagnostic[];
}

function pascal(s: string): string {
  return s.replace(/(^|[-_])(\w)/g, (_, __, c: string) => c.toUpperCase());
}

/** Hono path "/pet/:petId" / "/files/*" → v4 uriTemplate "pet/{petId}" / "files/{+wildcard}" (no leading slash). */
function toUriTemplate(honoPath: string): { template: string; segments: string[] } {
  const segs = honoPath.replace(/^\//, "").split("/").filter(Boolean).map((s) => {
    if (s === "*") return "{+wildcard}";
    if (s.startsWith(":")) return `{${s.slice(1).replace(/\{.*$/, "")}}`; // strip Hono regex constraints
    return s;
  });
  return { template: segs.join("/"), segments: segs };
}

function deriveName(method: Method, segments: string[]): string {
  const parts = segments.map((s) =>
    s.startsWith("{+") ? "By" + pascal(s.slice(2, -1)) : s.startsWith("{") ? "By" + pascal(s.slice(1, -1)) : pascal(s),
  );
  return method + parts.join("");
}

function zParam(schema: unknown): Record<string, unknown> | undefined {
  if (!schema) return undefined;
  return zodToV4(schema as Parameters<typeof zodToV4>[0]).schema;
}

function toMs(d: string | Date): number {
  return (typeof d === "string" ? new Date(d) : d).getTime();
}

/** Build one v4 Request from a route contract. `segments` are the URI-template segments (a path param is `{name}` /
 *  `{+name}`) — used to AUTO-DERIVE path parameters even when `request.params` isn't declared. */
function buildRequest(route: RouteContract, deprecated: boolean, ctx: EmitContext, segments: string[] = [], named: Record<string, Schema> = {}): Request {
  const req: Request = { method: route.method, responses: {} };
  if (route.summary) req.summary = route.summary;
  if (route.description) req.description = route.description;
  if (route.tags) req.tags = route.tags;
  if (deprecated) req.deprecated = true;

  if (route.request?.json) {
    req.contentType = route.request.contentType ?? "application/json";
    req.contentSchema = zodToV4(route.request.json as Parameters<typeof zodToV4>[0]).schema;
  }

  const ps: ParameterSchema = {};
  const q = zParam(route.request?.query); if (q) ps.query = q;
  const p = zParam(route.request?.params); if (p) ps.path = p;
  const h = zParam(route.request?.header); if (h) ps.header = h;
  // AUTO-DERIVE path parameters from the URI template: every `:name` segment MUST be a path parameter (a templated path
  // with no parameter definition is a malformed operation — Scalar/Swagger render nothing for it). A declared
  // `request.params` schema wins for a param; an UNDECLARED one gets a default `string`. Path params are always required.
  const pathNames = segments.filter((s) => s.startsWith("{")).map((s) => s.slice(1, -1).replace(/^\+/, ""));
  if (pathNames.length) {
    const cur = (ps.path && typeof ps.path === "object" ? ps.path : {}) as { properties?: Record<string, unknown>; required?: string[] };
    const properties: Record<string, unknown> = { ...(cur.properties ?? {}) };
    const required = new Set(cur.required ?? []);
    for (const n of pathNames) {
      if (!properties[n]) properties[n] = { type: "string" };
      required.add(n);
    }
    ps.path = { type: "object", properties, required: [...required], additionalProperties: false };
  }
  if (Object.keys(ps).length) req.parameterSchema = ps;

  const responses: Record<string, Response> = {};
  for (const r of responseList(route.responses)) {
    const resp: Response = { status: r.status };
    if (r.description) resp.description = r.description;
    if (r.schema) {
      resp.contentType = r.contentType ?? "application/json";
      const converted = zodToV4(r.schema as Parameters<typeof zodToV4>[0]).schema;
      if (r.schemaName) {
        // HOIST the body to a named component + $ref it — so a docs renderer shows the TYPE NAME (e.g. "PaymentError"),
        // not an anonymous "object", and the schema is REUSABLE. Deduped by name (the same error class → one component);
        // a title is stamped so the name shows even where a renderer doesn't resolve the $ref.
        named[r.schemaName] ??= { title: r.schemaName, ...converted } as Schema;
        resp.contentSchema = { $ref: `#/components/schemas/${r.schemaName}` };
      } else {
        resp.contentSchema = converted as Schema;
      }
    }
    responses[String(r.status)] = resp;
  }
  if (Object.keys(responses).length === 0) responses["200"] = { status: 200 };
  // synthesize RFC-9457 error responses — but never clobber a user-declared one for the same status. Each references a
  // PRECISE per-status problem component (`Unauthorized`/`Forbidden`/… with `const` status/title/type); an unknown status
  // falls back to the generic `ProblemDetails`. The component is hoisted into components.schemas by emitV4.
  for (const status of errorStatusesFor(route, ctx)) {
    const key = String(status);
    if (responses[key]) continue;
    const component = PROBLEM_COMPONENT_BY_STATUS[status as ProblemStatus] ?? "ProblemDetails";
    responses[key] = {
      status,
      description: ERROR_DESCRIPTION[status] ?? "Error",
      contentType: PROBLEM_CONTENT_TYPE,
      contentSchema: { $ref: `#/components/schemas/${component}` },
    };
  }
  req.responses = responses;

  // stamp the declared rate-limit facet so rateLimitIndex/coverage + the middleware can read it off the document.
  if (route.rateLimit) req["x-suluk-ratelimit"] = route.rateLimit;
  // stamp the declared route ECONOMICS (cost/settlement/triggers/dynamic) so @suluk/cost audits + @suluk/scalar renders it.
  // x-suluk-cost is a passthrough facet (@suluk/cost owns the type + reads it via the same cast) — not a declared Request key.
  if (route.cost) (req as Request & Record<string, unknown>)["x-suluk-cost"] = route.cost;
  // INTERNAL ops: stamp the facet (@suluk/scalar badges it) + group under the "Internal" tag (Scalar's sidebar sections it).
  if (route.internal) {
    (req as Request & Record<string, unknown>)["x-suluk-internal"] = true;
    req.tags = [...new Set([...(req.tags ?? []), "Internal"])];
  }

  // security: explicit wins; else synthesize from scopes if a scheme name is configured.
  const security: SecurityRequirement[] | undefined =
    route.security ?? (route.scopes && ctx.securityScheme ? [{ [ctx.securityScheme]: route.scopes }] : undefined);
  if (security) req.security = security;
  return req;
}

/**
 * Project a list of route contracts into a v4 document for a given principal + time.
 * - WHEN: removedSince ≤ now ⇒ hidden; deprecatedSince ≤ now ⇒ marked deprecated.
 * - WHO: if a principal is supplied, an operation requiring scopes the principal lacks is omitted.
 */
export function emitV4(routes: readonly RouteContract[], ctx: EmitContext = {}): EmitResult {
  const diagnostics: EmitDiagnostic[] = [];
  const nowMs = ctx.now != null ? toMs(ctx.now) : undefined;
  const principalScopes = ctx.principal ? new Set(ctx.principal.scopes ?? []) : undefined;

  const paths: Record<string, PathItem> = {};
  // named response bodies (from RouteResponse.schemaName — @suluk/effect sets it from the error tag / route) → hoisted to
  // components.schemas so a renderer shows the TYPE NAME (docs generated FROM the code), not an anonymous "object".
  const named: Record<string, Schema> = {};
  for (const route of routes) {
    const { template, segments } = toUriTemplate(route.path);
    const name = route.name ?? deriveName(route.method, segments);

    // WHEN filter
    if (nowMs != null && route.removedSince && toMs(route.removedSince) <= nowMs) {
      diagnostics.push({ kind: "filtered", operation: name, message: `hidden: removed since ${route.removedSince}` });
      continue;
    }
    // WHO filter
    if (principalScopes && route.scopes && !route.scopes.every((s) => principalScopes.has(s))) {
      diagnostics.push({ kind: "filtered", operation: name, message: `hidden: principal lacks scope(s) ${route.scopes.join(", ")}` });
      continue;
    }
    const deprecated =
      !!route.deprecated || (nowMs != null && !!route.deprecatedSince && toMs(route.deprecatedSince) <= nowMs);
    if (deprecated && ctx.includeDeprecated === false) {
      diagnostics.push({ kind: "filtered", operation: name, message: "hidden: deprecated (includeDeprecated=false)" });
      continue;
    }

    const pi = (paths[template] ??= { requests: {} });
    if (pi.requests[name]) {
      diagnostics.push({ kind: "collision", operation: name, message: `duplicate operation name '${name}' at '${template}'` });
      pi.requests[`${name}_${route.method}`] = buildRequest(route, deprecated, ctx, segments, named);
    } else {
      pi.requests[name] = buildRequest(route, deprecated, ctx, segments, named);
    }
  }

  const document: OpenAPIv4Document = {
    openapi: "4.0.0-candidate",
    info: { title: ctx.info?.title ?? "API", version: ctx.info?.version ?? "0.0.0", ...ctx.info },
    paths,
  };
  if (ctx.servers) document.servers = ctx.servers;

  // components: securitySchemes (C014) + a PRECISE per-status problem component for EACH synthesized error status present
  // (`Unauthorized`/`Forbidden`/… with `const` status/title/type + examples), so a renderer shows the exact stub instead of
  // one loose generic `ProblemDetails`. An unknown status (a raw `errors: [<n>]` outside the known set) falls back to the
  // generic base. Collected by scanning the built responses for problem+json.
  const problemStatuses = new Set<number>();
  for (const pi of Object.values(paths))
    for (const r of Object.values(pi.requests))
      for (const resp of Object.values(r.responses)) if (resp.contentType === PROBLEM_CONTENT_TYPE) problemStatuses.add(Number(resp.status));
  const components: Components = {};
  if (ctx.securitySchemes) components.securitySchemes = ctx.securitySchemes;
  // the hoisted named response bodies (effectRoute error/success types) + the per-status problem stubs.
  const schemas: Record<string, Schema> = { ...named };
  let usesGenericProblem = false;
  for (const status of problemStatuses) {
    const component = PROBLEM_COMPONENT_BY_STATUS[status as ProblemStatus];
    if (component) schemas[component] = problemSchemaFor(status as ProblemStatus) as unknown as Schema;
    else usesGenericProblem = true; // an unrecognized status → the generic base
  }
  if (usesGenericProblem) schemas.ProblemDetails = PROBLEM_DETAILS_SCHEMA as unknown as Schema;
  if (Object.keys(schemas).length > 0) components.schemas = schemas;
  if (Object.keys(components).length > 0) document.components = components;

  // static collision audit over the ADA (detect-and-tolerate; surfaced as diagnostics, never a gate).
  for (const c of buildAda(document).collisions) {
    if (c.verdict === "provable-collision") {
      diagnostics.push({ kind: "collision", operation: `${c.a.name} / ${c.b.name}`, message: `provable signature collision at '${c.a.pathTemplate}'` });
    }
  }
  return { document, diagnostics };
}
