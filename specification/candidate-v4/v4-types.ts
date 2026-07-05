/**
 * OpenAPI v4.0 "Suluk" Candidate — TypeScript type definitions for the document model.
 *
 * Mirrors specification/candidate-v4/v4-meta-schema.json and the pinned canonical model (SPEC §1),
 * per ADRs C003/C004/C005/C009/C013/C019. CANDIDATE, not official OAS. Provisional (~0.55–0.65);
 * revisable with the ADRs.
 *
 * Inner Schema Objects are JSON Schema 2020-12. Through C013–C098 they were an OPAQUE type; C099 renders the
 * dialect as a PRECISE, TypeBox/JSON-Schema-aligned model ({@link SchemaObject} + {@link Static}) — the descriptive
 * source-of-truth for what an input/output can be — without changing what validates (the dialect stays authoritative)
 * and without a runtime dependency. {@link OpaqueSchema} keeps {@link Schema} a strict superset of the old type.
 *
 * For a TS library / vscode extension: import these as the parsed-document model; use {@link isReference}
 * to discriminate an OpenAPI Reference Object from an inline Schema (the C019 slot+token rule).
 */

/** Top-level OpenAPI v4 document. */
export interface OpenAPIv4Document {
  /** e.g. "4.0.0-candidate". */
  openapi: string;
  info: Info;
  servers?: Server[];
  /** Map keyed by tag name (C009). */
  tags?: Record<string, Tag>;
  /** Map keyed by RFC6570 parseable-profile uriTemplate (C005). */
  paths: Record<string, PathItem>;
  /** Document-level responses reusable across all operations (§5). */
  apiResponses?: Record<string, Response>;
  /** Incoming operations not hosted at the API's own paths (§14, C018). */
  webhooks?: Record<string, Request>;
  components?: Components;
  [ext: `x-${string}`]: unknown;
}

export interface Info {
  title: string;
  version: string;
  /** A short summary of the API (OpenAPI 3.1+ parity). */
  summary?: string;
  description?: string;
  termsOfService?: string;
  contact?: Contact;
  license?: License;
}

/** API contact information ({@link Info.contact}). */
export interface Contact {
  name?: string;
  url?: string;
  email?: string;
  [ext: `x-${string}`]: unknown;
}

/** API license ({@link Info.license}). `identifier` (an SPDX expression) and `url` are mutually exclusive. */
export interface License {
  /** REQUIRED license name. */
  name: string;
  identifier?: string;
  url?: string;
  [ext: `x-${string}`]: unknown;
}

/** Server IDENTITY — a by-name shape primitive (C015 #55); environment URL config is a deployment concern. */
export interface Server {
  url: string;
  description?: string;
  /** OAS server-variable map for `{var}` substitution in `url`. Advisory per C015 — never part of by-name identity. */
  variables?: Record<string, ServerVariable>;
}

/** A server-URL template variable ({@link Server.variables}). */
export interface ServerVariable {
  /** REQUIRED default substitution value. If `enum` is present, this MUST be one of its members. */
  default: string;
  enum?: string[];
  description?: string;
}

/** External documentation pointer — referenced from schemas, tags, and operations. */
export interface ExternalDocumentation {
  url: string;
  description?: string;
}

/** A tag definition (keyed by name in `OpenAPIv4Document.tags`, C009 — so it carries no `name` field). */
export interface Tag {
  summary?: string;
  description?: string;
  type?: string;
  externalDocs?: ExternalDocumentation;
}

/** A pathItem, keyed in `paths` by its uriTemplate. Each request *is* an operation (SPEC §1.3/1.4). */
export interface PathItem {
  summary?: string;
  description?: string;
  servers?: Server[];
  /** Optional per-level inheritance wrapper (C012 #116). */
  shared?: Shared;
  /** The operations at this path, keyed by stable name (C009). At least one required. */
  requests: Record<string, Request>;
  /** Responses reusable across this pathItem's requests (§5). */
  pathResponses?: Record<string, Response>;
}

/** Optional inheritance wrapper; its `parameterSchema` is allOf-composed into each request (C012 #116, @0.55). */
export interface Shared {
  parameterSchema?: ParameterSchema;
}

export type HttpMethod =
  | "get" | "GET" | "put" | "PUT" | "post" | "POST" | "patch" | "PATCH"
  | "delete" | "DELETE" | "head" | "HEAD" | "options" | "OPTIONS" | "trace" | "TRACE";

/**
 * The standard HTTP status vocabulary (C012) — every registered numeric status code mapped to its semantic name,
 * plus the two non-numeric tokens Suluk's response model accepts: `"5XX"` (a status-class wildcard) and `"default"`.
 * A VALUE lookup (code → name), not a map-key constraint — only {@link Response.status} is typed against it
 * (via {@link HttpStatus}).
 */
export interface HttpStatusCode {
  100: "continue"; 101: "switchingProtocols"; 103: "earlyHints";
  200: "ok"; 201: "created"; 202: "accepted"; 203: "nonAuthoritativeInformation"; 204: "noContent";
  205: "resetContent"; 206: "partialContent"; 207: "multiStatus"; 208: "alreadyReported"; 226: "imUsed";
  300: "multipleChoices"; 301: "movedPermanently"; 302: "found"; 303: "seeOther"; 304: "notModified";
  305: "useProxy"; 307: "temporaryRedirect"; 308: "permanentRedirect";
  400: "badRequest"; 401: "unauthorized"; 402: "paymentRequired"; 403: "forbidden"; 404: "notFound";
  405: "methodNotAllowed"; 406: "notAcceptable"; 407: "proxyAuthenticationRequired"; 408: "requestTimeout";
  409: "conflict"; 410: "gone"; 411: "lengthRequired"; 412: "preconditionFailed"; 413: "contentTooLarge";
  414: "uriTooLong"; 415: "unsupportedMediaType"; 416: "rangeNotSatisfiable"; 417: "expectationFailed";
  418: "imATeapot"; 421: "misdirectedRequest"; 422: "unprocessableContent"; 423: "locked";
  424: "failedDependency"; 425: "tooEarly"; 426: "upgradeRequired"; 428: "preconditionRequired";
  429: "tooManyRequests"; 431: "requestHeaderFieldsTooLarge"; 451: "unavailableForLegalReasons";
  500: "internalServerError"; 501: "notImplemented"; 502: "badGateway"; 503: "serviceUnavailable";
  504: "gatewayTimeout"; 505: "httpVersionNotSupported"; 506: "variantAlsoNegotiates";
  507: "insufficientStorage"; 508: "loopDetected"; 510: "notExtended"; 511: "networkAuthenticationRequired";
  "5XX": "undefinedServerError";
  "default": "default";
}

/**
 * A valid {@link Response.status} value: a numeric code (`200`), its EQUIVALENT string form (`"200"` — Suluk treats
 * the two as the same status, never a drift), the `"5XX"` status-class wildcard, or `"default"`. Derived from
 * {@link HttpStatusCode} so the vocabulary is declared exactly once.
 */
export type HttpStatus = keyof HttpStatusCode | `${Extract<keyof HttpStatusCode, number>}`;

/**
 * A Request *is* an operation (SPEC §1.4). DOM handle = its name (the key in `PathItem.requests`);
 * ADA identity = its signature (C003/C019 Appendix A — computed, not authored).
 */
export interface Request {
  method: HttpMethod;
  summary?: string;
  description?: string;
  /** Optional legacy handle; not the v4 primary identity (C009). */
  operationId?: string;
  tags?: string[];
  deprecated?: boolean;
  externalDocs?: ExternalDocumentation;
  /** Request body media type(s) — plain IANA media type; params via the content model (§6/§7). */
  contentType?: string | string[];
  contentSchema?: SchemaOrRef;
  parameterSchema?: ParameterSchema;
  /** Named responses (§5); each carries its own status. At least one required. */
  responses: Record<string, Response>;
  callbacks?: Record<string, Callback>;
  /** Applied security, referenced BY NAME (C014 #69). */
  security?: SecurityRequirement[];
  servers?: Server[];
}

/** Per-location typed parameter slots (C004 #20). Each slot is a JSON Schema 2020-12 over its instance. */
export interface ParameterSchema {
  query?: SchemaOrRef;
  path?: SchemaOrRef;
  header?: SchemaOrRef;
  cookie?: SchemaOrRef;
  body?: SchemaOrRef;
}

/** Named in its containing map. Precedence: request > pathResponses > apiResponses (C012 #17b). */
export interface Response {
  /** HTTP status ("200"/200), a wildcard ("5XX"), or "default". */
  status: HttpStatus;
  contentType?: string | string[];
  contentSchema?: SchemaOrRef;
  description?: string;
  /** Response headers, keyed by header name (OAS parity). */
  headers?: Record<string, Header | Reference>;
  /** Operation links, keyed by name (OAS parity). */
  links?: Record<string, Link | Reference>;
}

/** A response Header (OAS parity) — like a parameter minus name/in; its value is typed by `schema`. */
export interface Header {
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  schema?: SchemaOrRef;
  [ext: `x-${string}`]: unknown;
}

/** A design-time Link to another operation (OAS parity). */
export interface Link {
  operationRef?: string;
  operationId?: string;
  parameters?: Record<string, unknown>;
  requestBody?: unknown;
  description?: string;
  server?: Server;
}

/** A named Example object (OAS parity). `value` and `externalValue` are mutually exclusive. */
export interface Example {
  summary?: string;
  description?: string;
  value?: unknown;
  externalValue?: string;
}

/**
 * A runtime-expression-keyed map of pathItem-shaped definitions (§14, C018).
 * The enclosing `Request.callbacks` is name-keyed, so `callbacks[name][expression]` is a {@link PathItem}.
 */
export type Callback = Record<string, PathItem>;

/** Reusable definitions; the referencing anchor (C013). Keyed by name (C009). */
export interface Components {
  schemas?: Record<string, Schema>;
  requests?: Record<string, Request>;
  responses?: Record<string, Response>;
  securitySchemes?: Record<string, SecurityScheme>;
  links?: Record<string, Link | Reference>;
  examples?: Record<string, Example | Reference>;
  headers?: Record<string, Header | Reference>;
  callbacks?: Record<string, Callback | Reference>;
  pathItems?: Record<string, PathItem>;
}

/** Map of securityScheme name → array of scope strings (referenced BY NAME, C014 #69). */
export type SecurityRequirement = Record<string, string[]>;

/** The permissive Security Scheme carried by the document interfaces. For the exhaustive model, see {@link SecuritySchemeObject} (C099). */
export interface SecurityScheme {
  type: "apiKey" | "http" | "oauth2" | "openIdConnect" | "mutualTLS";
  name?: string;
  in?: "query" | "header" | "cookie";
  scheme?: string;
  bearerFormat?: string;
  flows?: OAuthFlows | Record<string, unknown>;
  openIdConnectUrl?: string;
  description?: string;
}

/** The PRECISE, discriminated Security Scheme model (C099) — narrow by `type` for a variant's required fields. */
export type SecuritySchemeObject =
  | ApiKeySecurityScheme | HttpSecurityScheme | OAuth2SecurityScheme
  | OpenIdConnectSecurityScheme | MutualTLSSecurityScheme;

/** An `apiKey` scheme — a key carried in a named header, query param, or cookie. */
export interface ApiKeySecurityScheme { type: "apiKey"; name: string; in: "query" | "header" | "cookie"; description?: string; }
/** An `http` scheme — an RFC 7235 Authorization scheme (e.g. `basic`, `bearer`). */
export interface HttpSecurityScheme { type: "http"; scheme: string; bearerFormat?: string; description?: string; }
/** An `oauth2` scheme — one or more OAuth2 flows. */
export interface OAuth2SecurityScheme { type: "oauth2"; flows: OAuthFlows; description?: string; }
/** An `openIdConnect` scheme — an OIDC discovery URL. */
export interface OpenIdConnectSecurityScheme { type: "openIdConnect"; openIdConnectUrl: string; description?: string; }
/** A `mutualTLS` scheme — mutual-TLS client certificate authentication. */
export interface MutualTLSSecurityScheme { type: "mutualTLS"; description?: string; }

/** The four OAuth2 flow configurations ({@link OAuth2SecurityScheme.flows}). */
export interface OAuthFlows {
  implicit?: OAuthFlow;
  password?: OAuthFlow;
  clientCredentials?: OAuthFlow;
  authorizationCode?: OAuthFlow;
}
/** One OAuth2 flow — which URLs apply depends on the flow. */
export interface OAuthFlow {
  authorizationUrl?: string;
  tokenUrl?: string;
  refreshUrl?: string;
  /** REQUIRED scope name → description map (MAY be empty). */
  scopes: Record<string, string>;
}

/**
 * An OpenAPI Reference Object (C013 #49). `$ref` is a JSON-Pointer "#/components/<type>/<name>"
 * resolved BY NAME (C009; the resolve algorithm is C019 Appendix A).
 */
export interface Reference {
  $ref: string;
  summary?: string;
  description?: string;
}

/* ────────────────────────────────────────────────────────────────────────────
 * JSON Schema 2020-12 — the Schema Object model (C099). The 2020-12 dialect rendered as a precise, TypeBox/
 * JSON-Schema-aligned type model — WITHOUT changing what validates (the dialect stays authoritative) and WITHOUT a
 * runtime dependency. {@link OpaqueSchema} keeps {@link Schema} a strict superset of the old opaque type.
 * ──────────────────────────────────────────────────────────────────────────── */

/** The seven JSON Schema 2020-12 primitive type names (the `type` keyword vocabulary). */
export type JsonSchemaType = "null" | "boolean" | "object" | "array" | "number" | "string" | "integer";

/** Common `format` tokens (2020-12 + OpenAPI). `format` stays open to any string. */
export type StringFormat =
  | "date-time" | "date" | "time" | "duration"
  | "email" | "idn-email" | "hostname" | "idn-hostname"
  | "ipv4" | "ipv6" | "uri" | "uri-reference" | "iri" | "iri-reference" | "uuid" | "uri-template"
  | "json-pointer" | "relative-json-pointer" | "regex"
  | "int32" | "int64" | "float" | "double" | "byte" | "binary" | "password";

/** Keywords valid on ANY Schema Object regardless of `type` — core, annotations, enumeration, applicators, and the
 *  OpenAPI schema flavor. A `$ref` HERE is the JSON-Schema ref keyword (C019 slot rule), not an OpenAPI {@link Reference}. */
export interface SchemaBase {
  $schema?: string;
  $id?: string;
  $anchor?: string;
  $ref?: string;
  $dynamicRef?: string;
  $dynamicAnchor?: string;
  $vocabulary?: Record<string, boolean>;
  $defs?: Record<string, SchemaOrRef>;
  $comment?: string;
  title?: string;
  description?: string;
  default?: unknown;
  deprecated?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  examples?: unknown[];
  /** OpenAPI singular example — deprecated by 2020-12 in favor of `examples`. */
  example?: unknown;
  enum?: unknown[];
  const?: unknown;
  allOf?: SchemaOrRef[];
  anyOf?: SchemaOrRef[];
  oneOf?: SchemaOrRef[];
  not?: SchemaOrRef;
  if?: SchemaOrRef;
  then?: SchemaOrRef;
  else?: SchemaOrRef;
  dependentSchemas?: Record<string, SchemaOrRef>;
  discriminator?: Discriminator;
  xml?: XmlObject;
  externalDocs?: ExternalDocumentation;
  [ext: `x-${string}`]: unknown;
}

/** `type: "string"` validation keywords. */
export interface StringKeywords {
  format?: StringFormat | (string & {});
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  contentMediaType?: string;
  contentEncoding?: string;
  contentSchema?: SchemaOrRef;
}
/** `type: "number" | "integer"` validation keywords. */
export interface NumericKeywords {
  format?: string;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
}
/** `type: "object"` validation keywords. */
export interface ObjectKeywords {
  properties?: Record<string, SchemaOrRef>;
  required?: string[];
  additionalProperties?: SchemaOrRef | boolean;
  patternProperties?: Record<string, SchemaOrRef>;
  propertyNames?: SchemaOrRef;
  minProperties?: number;
  maxProperties?: number;
  dependentRequired?: Record<string, string[]>;
  unevaluatedProperties?: SchemaOrRef | boolean;
}
/** `type: "array"` validation keywords. */
export interface ArrayKeywords {
  items?: SchemaOrRef;
  prefixItems?: SchemaOrRef[];
  contains?: SchemaOrRef;
  minContains?: number;
  maxContains?: number;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  unevaluatedItems?: SchemaOrRef | boolean;
}

/** Every 2020-12 constraint keyword, all optional. Per the dialect, a keyword that doesn't apply to an instance's
 *  `type` is IGNORED, not forbidden — so any of these MAY appear on any schema; `type` discriminates the instance type. */
export type SchemaConstraints = Partial<StringKeywords & NumericKeywords & ObjectKeywords & ArrayKeywords>;

export type StringSchema = SchemaBase & SchemaConstraints & { type: "string" };
export type NumberSchema = SchemaBase & SchemaConstraints & { type: "number" | "integer" };
export type ObjectSchema = SchemaBase & SchemaConstraints & { type: "object" };
export type ArraySchema = SchemaBase & SchemaConstraints & { type: "array" };
export type BooleanSchema = SchemaBase & SchemaConstraints & { type: "boolean" };
export type NullSchema = SchemaBase & SchemaConstraints & { type: "null" };
export type MultiTypeSchema = SchemaBase & SchemaConstraints & { type: JsonSchemaType[] };
export type UntypedSchema = SchemaBase & SchemaConstraints & { type?: undefined };
/** The 2020-12 opaque escape hatch — preserves the pre-C099 openness so any object a validator accepts, or a generator
 *  emits, stays a valid Schema Object. The precise variants are strictly ADDITIVE narrowings. */
export type OpaqueSchema = Record<string, unknown>;

/** A JSON Schema 2020-12 Schema Object — discriminated over `type`, plus composition-only and opaque fallback. */
export type SchemaObject =
  | StringSchema | NumberSchema | ObjectSchema | ArraySchema
  | BooleanSchema | NullSchema | MultiTypeSchema | UntypedSchema | OpaqueSchema;

/** A JSON Schema 2020-12 value: a Schema Object, or a boolean schema (`true` = accept all, `false` = reject all). */
export type Schema = SchemaObject | boolean;

/** A polymorphism discriminator (OpenAPI Schema flavor). */
export interface Discriminator {
  propertyName: string;
  mapping?: Record<string, string>;
}
/** XML serialization metadata for a schema or property (OpenAPI Schema flavor). */
export interface XmlObject {
  name?: string;
  namespace?: string;
  prefix?: string;
  attribute?: boolean;
  wrapped?: boolean;
}

/** Either an inline Schema Object (incl. a boolean schema) or an OpenAPI Reference Object. */
export type SchemaOrRef = Schema | Reference;

type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

/**
 * COMPILE-TIME inference from a Schema Object to the TypeScript type of its valid instances — TypeBox's `Static<>`
 * without the dependency. Correct for boolean schemas, `const`, `enum`, the six primitive `type`s, arrays (`items`),
 * objects (`properties` + `required`, precise when `required` is `as const`), and `allOf`/`anyOf`/`oneOf`. Unmodeled
 * constructs resolve to `unknown` — under-narrowed, never falsely narrowed. For a narrow authored literal, not {@link Schema}.
 */
export type Static<S> =
  S extends boolean ? unknown :
  S extends { const: infer C } ? C :
  S extends { enum: readonly (infer E)[] } ? E :
  S extends { allOf: readonly (infer A)[] } ? UnionToIntersection<Static<A>> :
  S extends { anyOf: readonly (infer A)[] } ? Static<A> :
  S extends { oneOf: readonly (infer A)[] } ? Static<A> :
  S extends { type: "string" } ? string :
  S extends { type: "integer" | "number" } ? number :
  S extends { type: "boolean" } ? boolean :
  S extends { type: "null" } ? null :
  S extends { type: "array" } ? StaticArray<S> :
  S extends { type: "object" } ? StaticObject<S> :
  unknown;

type StaticArray<S> = S extends { items: infer I } ? Static<I>[] : unknown[];
type StaticObject<S> =
  S extends { properties: infer P }
    ? S extends { required: readonly (infer R extends string)[] }
      ? StaticRequired<P, R> & StaticOptional<P, R>
      : { [K in keyof P]?: Static<P[K]> }
    : Record<string, unknown>;
type StaticRequired<P, R extends string> = { [K in keyof P as K extends R ? K : never]: Static<P[K]> };
type StaticOptional<P, R extends string> = { [K in keyof P as K extends R ? never : K]?: Static<P[K]> };

/**
 * Discriminate an OpenAPI Reference Object from an inline Schema.
 * NOTE: a JSON Schema may *also* contain a `$ref` keyword; per C019 Appendix A the slot+token rule
 * decides the kind — a `$ref` lexically inside a Schema Object is the JSON-Schema kind, not a Reference.
 * This guard is the structural check; callers in Schema-Object position MUST apply the slot rule.
 */
export function isReference(x: SchemaOrRef | undefined): x is Reference {
  return typeof x === "object" && x !== null && "$ref" in x && typeof (x as Reference).$ref === "string";
}
