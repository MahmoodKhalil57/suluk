/**
 * Error-envelope shapes (saastarter-parity Phase 0) — an RFC-9457 Problem Details body + the closed
 * typed-throw→HTTP-status table, as PURE DATA. Shared in core because the envelope is read ACROSS packages:
 * `@suluk/hono` renders + synthesizes it, @suluk/sdk's `isApiError` guard discriminates it, @suluk/testgen
 * asserts error-conformance against it, @suluk/reference panels display it. No throwing, no HTTP, no I/O here.
 *
 * The status table is ported verbatim from saastarter's Effect route-handler (src/lib/effect/route-handler.ts:24-86)
 * — the portable value extracted from the dropped Effect layer (roadmap Phase 0). The body is UPGRADED from
 * saastarter's ad-hoc `{ error, details }` to RFC-9457 (the roadmap's intentional improvement), retaining a
 * legacy `error` machine-code member during Phase 0 so the existing SDK + the @suluk/hono `deny()` body keep working.
 */

/** The closed set of domain-error tags that map to an HTTP status (saastarter src/lib/effect/errors.ts). */
export type ErrorTag =
  | "UnauthorizedError" | "ForbiddenError" | "InvalidApiKeyError" | "ValidationError"
  | "NotFoundError" | "ConflictError" | "PaymentError" | "InvalidDiscountError"
  | "ExternalServiceError" | "RateLimitedError" | "PayloadOperationError";

/** The HTTP statuses the error model can produce. */
export type ProblemStatus = 400 | 401 | 402 | 403 | 404 | 409 | 429 | 500 | 502;

/** RFC-9457 media type for a Problem Details body. */
export const PROBLEM_CONTENT_TYPE = "application/problem+json" as const;

/**
 * typed-throw → HTTP status, ported verbatim from saastarter route-handler.ts:24-86. Frozen — the single
 * source of the mapping every package shares. Note `ExternalServiceError` → 502 (route-handler.ts:62-67):
 * the roadmap's Phase-0 list abbreviated the codes and omitted it; the faithful port keeps it.
 */
export const PROBLEM_STATUS_TABLE: Readonly<Record<ErrorTag, ProblemStatus>> = Object.freeze({
  UnauthorizedError: 401,    // route-handler.ts:26-30
  ForbiddenError: 403,       // route-handler.ts:32-36
  InvalidApiKeyError: 401,   // route-handler.ts:38-39
  ValidationError: 400,      // route-handler.ts:41-45
  NotFoundError: 404,        // route-handler.ts:47-51
  ConflictError: 409,        // route-handler.ts:53-54
  PaymentError: 402,         // route-handler.ts:56-57
  InvalidDiscountError: 400, // route-handler.ts:59-60
  ExternalServiceError: 502, // route-handler.ts:62-67
  RateLimitedError: 429,     // route-handler.ts:69-78
  PayloadOperationError: 500, // route-handler.ts:80-85
});

/**
 * Human-readable `title` per tag (RFC-9457 §3.1.1: `title` is human, `type` is the machine id). The STATIC
 * saastarter strings are ported verbatim where one exists; the rest derive a sensible title (saastarter built
 * those messages from dynamic data — e.g. `${resource} not found` — so there is no static string to port).
 */
export const TITLE_BY_TAG: Readonly<Record<ErrorTag, string>> = Object.freeze({
  UnauthorizedError: "Unauthorized",                    // route-handler.ts:28 (verbatim)
  ForbiddenError: "Forbidden",                          // route-handler.ts:34 (verbatim)
  InvalidApiKeyError: "Unauthorized",                   // 401; the key reason is supplied as `detail`
  ValidationError: "Validation failed",
  NotFoundError: "Not found",
  ConflictError: "Conflict",
  PaymentError: "Payment failed",
  InvalidDiscountError: "Invalid discount",
  ExternalServiceError: "External service unavailable", // route-handler.ts:66 (verbatim)
  RateLimitedError: "Too many requests",                // route-handler.ts:71 (verbatim)
  PayloadOperationError: "Internal server error",       // route-handler.ts:83 (verbatim)
});

/**
 * An RFC-9457 Problem Details object. `type` is the machine identifier (a stable URI reference), `title` is
 * human-readable, `status` is the HTTP status. `detail` is the human explanation for THIS occurrence; `instance`
 * identifies the occurrence; `errors` carries structured, per-field validation details.
 */
export interface ProblemDetails {
  type: string;
  title: string;
  status: ProblemStatus;
  detail?: string;
  instance?: string;
  /** structured validation errors (saastarter's `details`). */
  errors?: Record<string, unknown>;
  [ext: `x-${string}`]: unknown;
}

/** RFC-9457 problem-type identifier base (a stable machine id per §3.1.1; may not be dereferenceable). One base so a
 *  rebrand is a single edit. Each status appends its slug → the `type` URI (a `const` in the per-status stub). */
export const PROBLEM_TYPE_BASE = "https://suluk.dev/problems/" as const;

const PROBLEM_SLUG_BY_STATUS: Readonly<Record<ProblemStatus, string>> = Object.freeze({
  400: "bad-request", 401: "unauthorized", 402: "payment-required", 403: "forbidden",
  404: "not-found", 409: "conflict", 429: "too-many-requests", 500: "internal-server-error", 502: "bad-gateway",
});

/** The canonical `type` URI per HTTP status — the `const` a SYNTHESIZED problem stub (and {@link toProblemDetails}) use. */
export const PROBLEM_TYPE_BY_STATUS: Readonly<Record<ProblemStatus, string>> = Object.freeze(
  Object.fromEntries(
    (Object.keys(PROBLEM_SLUG_BY_STATUS).map(Number) as ProblemStatus[]).map((s) => [s, PROBLEM_TYPE_BASE + PROBLEM_SLUG_BY_STATUS[s]]),
  ) as Record<ProblemStatus, string>,
);

/** The canonical error TAG a synthesized (cross-cutting) problem for `status` derives its `title` from (via {@link TITLE_BY_TAG},
 *  the single source of truth), so the stub's `const title` always matches the body {@link toProblemDetails} produces. */
export const PROBLEM_TAG_BY_STATUS: Readonly<Record<ProblemStatus, ErrorTag>> = Object.freeze({
  400: "ValidationError", 401: "UnauthorizedError", 402: "PaymentError", 403: "ForbiddenError",
  404: "NotFoundError", 409: "ConflictError", 429: "RateLimitedError", 500: "PayloadOperationError", 502: "ExternalServiceError",
});

/** The v4 component NAME a synthesized problem for `status` is hoisted under, so a renderer shows a precise, per-status stub
 *  (e.g. `Unauthorized` with `status: const 401`) instead of one loose generic `ProblemDetails`. Distinct from the typed
 *  domain-error names (`UnauthorizedError`, …) so they never collide. */
export const PROBLEM_COMPONENT_BY_STATUS: Readonly<Record<ProblemStatus, string>> = Object.freeze({
  400: "BadRequest", 401: "Unauthorized", 402: "PaymentRequired", 403: "Forbidden",
  404: "NotFound", 409: "Conflict", 429: "TooManyRequests", 500: "InternalServerError", 502: "BadGateway",
});

/** A realistic `detail` example per status — rendered as the field's example so the stub reads like a real response. */
const PROBLEM_DETAIL_EXAMPLE: Readonly<Record<ProblemStatus, string>> = Object.freeze({
  400: "The request body does not satisfy the operation's contract.",
  401: "Authentication is required to access this resource.",
  402: "Payment is required to complete this request.",
  403: 'This API key is missing the "credits:write" scope.',
  404: "The requested resource was not found.",
  409: "The request conflicts with the current state of the resource.",
  429: "Rate limit exceeded — retry after the window resets.",
  500: "An unexpected error occurred while processing the request.",
  502: "An upstream service returned an error.",
});

/**
 * The PER-STATUS RFC-9457 Problem schema (2020-12) — a PRECISE stub: its fixed members are LITERALS (`const` type / title /
 * status) and its free members carry an example + description, so a renderer shows the exact shape for THAT status instead of
 * one loose generic body (no more `status: integer` / `title: string` with no values). `@suluk/hono`'s emit hoists these into
 * `components.schemas[PROBLEM_COMPONENT_BY_STATUS[status]]` and `$ref`s them; the `const` values MATCH what
 * {@link toProblemDetails} produces at runtime, so the body still conforms.
 */
export function problemSchemaFor(status: ProblemStatus): Record<string, unknown> {
  const type = PROBLEM_TYPE_BY_STATUS[status];
  const title = TITLE_BY_TAG[PROBLEM_TAG_BY_STATUS[status]];
  const properties: Record<string, unknown> = {
    type: { type: "string", format: "uri-reference", const: type, description: "The problem-type identifier — a stable URI (may not be dereferenceable)." },
    title: { type: "string", const: title, description: "A short, human-readable summary of the problem type (constant for this status)." },
    status: { type: "integer", const: status, description: "The HTTP status code (constant for this problem type)." },
    detail: { type: "string", examples: [PROBLEM_DETAIL_EXAMPLE[status]], description: "A human-readable explanation specific to THIS occurrence." },
    instance: { type: "string", format: "uri-reference", examples: [`/api/example#${status}`], description: "A URI reference identifying the specific occurrence." },
  };
  // 400 carries structured, per-field validation errors (the validator's output); the other statuses don't.
  if (status === 400) {
    properties.errors = { type: "object", additionalProperties: true, examples: [{ amount: ["must be a positive integer"] }], description: "Structured, per-field validation errors." };
  }
  return {
    type: "object",
    title: PROBLEM_COMPONENT_BY_STATUS[status],
    description: `RFC-9457 Problem Details (${PROBLEM_CONTENT_TYPE}) for HTTP ${status} — ${title}.`,
    properties,
    required: ["type", "title", "status"],
  };
}

/**
 * The GENERIC JSON Schema (2020-12) form of {@link ProblemDetails} — the base shape (a `status` ENUM, not a per-status
 * `const`). A synthesized error uses the precise per-status specialization ({@link problemSchemaFor}); this remains exported
 * as the union base for any consumer that wants the whole-family type. Frozen; mirrors the type above.
 */
export const PROBLEM_DETAILS_SCHEMA = Object.freeze({
  type: "object",
  title: "ProblemDetails",
  description: "RFC-9457 Problem Details (application/problem+json) — the base shape; a synthesized error uses a precise per-status specialization.",
  properties: {
    type: { type: "string", format: "uri-reference", default: "about:blank", description: "The problem-type identifier (a URI reference)." },
    title: { type: "string", description: "A short, human-readable summary of the problem type." },
    status: { type: "integer", enum: [400, 401, 402, 403, 404, 409, 429, 500, 502], description: "The HTTP status code." },
    detail: { type: "string", description: "A human-readable explanation specific to this occurrence." },
    instance: { type: "string", format: "uri-reference", description: "A URI reference identifying the specific occurrence." },
    errors: { type: "object", additionalProperties: true, description: "Structured, per-field validation errors." },
  },
  required: ["type", "title", "status"],
});

/**
 * Structural guard — discriminates a Problem Details body (parallel to saastarter's `isApiError` and core's
 * `isReference`). Checks the two always-present RFC-9457 members `title` (string) + `status` (number).
 */
export function isProblemDetails(body: unknown): body is ProblemDetails {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return typeof b.title === "string" && typeof b.status === "number";
}

/**
 * Pure constructor: a tag (+ optional detail/instance/errors/type) → the canonical Problem Details body. Fills `status` +
 * `title` from the frozen tables and `type` from {@link PROBLEM_TYPE_BY_STATUS} (so the body MATCHES the per-status stub's
 * `const type`). No legacy machine code, no I/O, no throwing.
 */
export function toProblemDetails(args: {
  tag: ErrorTag;
  detail?: string;
  instance?: string;
  errors?: Record<string, unknown>;
  type?: string;
}): ProblemDetails {
  const status = PROBLEM_STATUS_TABLE[args.tag];
  const pd: ProblemDetails = {
    type: args.type ?? PROBLEM_TYPE_BY_STATUS[status],
    title: TITLE_BY_TAG[args.tag],
    status,
  };
  if (args.detail !== undefined) pd.detail = args.detail;
  if (args.instance !== undefined) pd.instance = args.instance;
  if (args.errors !== undefined) pd.errors = args.errors;
  return pd;
}
