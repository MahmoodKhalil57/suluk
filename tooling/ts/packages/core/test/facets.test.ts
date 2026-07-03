import { test, expect, describe } from "bun:test";
import {
  PROBLEM_STATUS_TABLE, TITLE_BY_TAG, PROBLEM_CONTENT_TYPE,
  isProblemDetails, toProblemDetails,
  rateLimitIndex, rateLimitCoverage, rateLimitOf, retryAfterSeconds, RATELIMIT_EXT,
  computeSignature, buildAda,
  type OpenAPIv4Document, type SulukApproval,
} from "../src/index";

describe("x-suluk-approval (HITL facet, Stage 1.4) is ADVISORY — it never perturbs ADA identity (the load-bearing D1 invariant)", () => {
  // an operation, with vs without the approval facet — every other identity input held equal.
  const reqOf = (approval?: SulukApproval) => ({
    method: "post" as const,
    contentSchema: { $ref: "#/components/schemas/CalcInput" },
    responses: { ok: { status: 200 } },
    ...(approval ? { "x-suluk-approval": approval } : {}),
  });

  test("computeSignature yields a byte-identical key with vs without x-suluk-approval", () => {
    const without = computeSignature("v1/calculate", reqOf()).key;
    const gated = computeSignature("v1/calculate", reqOf({ required: true, reason: "destructive" })).key;
    expect(gated).toBe(without); // the signature tuple is a closed field list — facets are structurally invisible to it
  });

  test("buildAda's match-relevant projection is identical with vs without the facet (the matcher never reads it — D1)", () => {
    const docOf = (approval?: SulukApproval): OpenAPIv4Document => ({
      openapi: "4.0.0-candidate", info: { title: "t", version: "1.0.0" },
      components: { schemas: { CalcInput: { type: "object", properties: { expression: { type: "string" } } } } },
      paths: { "v1/calculate": { requests: { calculate: reqOf(approval) } } },
    });
    // project to the match-relevant fields only (buildAda legitimately CARRIES the advisory facet on o.request; what
    // must be invariant is identity + matching — the signature keys, not the carried metadata).
    const project = (ada: ReturnType<typeof buildAda>) => ({
      ops: ada.operations.map((o) => ({ path: o.pathTemplate, name: o.name, method: o.request.method, key: o.signatureKey })),
      keys: [...ada.bySignature.keys()].sort(),
    });
    expect(project(buildAda(docOf({ required: true })))).toEqual(project(buildAda(docOf())));
  });
});

describe("error-envelope facet (saastarter-parity Phase 0)", () => {
  test("PROBLEM_STATUS_TABLE ports the saastarter route-handler mapping verbatim (incl. 502)", () => {
    // src/lib/effect/route-handler.ts:24-86
    expect(PROBLEM_STATUS_TABLE).toEqual({
      UnauthorizedError: 401,
      ForbiddenError: 403,
      InvalidApiKeyError: 401,
      ValidationError: 400,
      NotFoundError: 404,
      ConflictError: 409,
      PaymentError: 402,
      InvalidDiscountError: 400,
      ExternalServiceError: 502,
      RateLimitedError: 429,
      PayloadOperationError: 500,
    });
  });

  test("the table is frozen — the mapping is the single source of truth", () => {
    expect(Object.isFrozen(PROBLEM_STATUS_TABLE)).toBe(true);
    expect(Object.isFrozen(TITLE_BY_TAG)).toBe(true);
  });

  test("the 4 verbatim saastarter titles are ported exactly", () => {
    expect(TITLE_BY_TAG.UnauthorizedError).toBe("Unauthorized");
    expect(TITLE_BY_TAG.ForbiddenError).toBe("Forbidden");
    expect(TITLE_BY_TAG.ExternalServiceError).toBe("External service unavailable");
    expect(TITLE_BY_TAG.RateLimitedError).toBe("Too many requests");
  });

  test("toProblemDetails fills status/title/type (per-status URI, no legacy code) and passes detail/errors through", () => {
    const pd = toProblemDetails({ tag: "ValidationError", detail: "bad body", errors: { name: "required" } });
    expect(pd.status).toBe(400);
    expect(pd.title).toBe("Validation failed");
    expect(pd.type).toBe("https://suluk.dev/problems/bad-request"); // per-status type URI (matches the stub's `const`)
    expect("error" in pd).toBe(false);                              // the deprecated legacy machine code is GONE
    expect(pd.detail).toBe("bad body");
    expect(pd.errors).toEqual({ name: "required" });
  });

  test("type is the canonical per-status URI (so the body matches the per-status stub's `const type`)", () => {
    expect(toProblemDetails({ tag: "UnauthorizedError" }).type).toBe("https://suluk.dev/problems/unauthorized");
    expect(toProblemDetails({ tag: "ForbiddenError" }).type).toBe("https://suluk.dev/problems/forbidden");
    expect(toProblemDetails({ tag: "RateLimitedError" }).type).toBe("https://suluk.dev/problems/too-many-requests");
    expect(toProblemDetails({ tag: "InvalidApiKeyError" }).type).toBe("https://suluk.dev/problems/unauthorized"); // 401
    expect(toProblemDetails({ tag: "ExternalServiceError" }).type).toBe("https://suluk.dev/problems/bad-gateway"); // 502
  });

  test("isProblemDetails discriminates on title+status; rejects a bare {error}", () => {
    expect(isProblemDetails(toProblemDetails({ tag: "NotFoundError" }))).toBe(true);
    expect(isProblemDetails({ error: "nope" })).toBe(false);
    expect(isProblemDetails(null)).toBe(false);
    expect(isProblemDetails("500")).toBe(false);
  });

  test("PROBLEM_CONTENT_TYPE is the RFC-9457 media type", () => {
    expect(PROBLEM_CONTENT_TYPE).toBe("application/problem+json");
  });
});

describe("rate-limit facet (saastarter-parity Phase 0, advisory vendor extension)", () => {
  const doc = {
    openapi: "4.0.0-candidate",
    info: { title: "t", version: "1" },
    paths: {
      "/discount/validate": {
        requests: {
          validateDiscount: { method: "post", [RATELIMIT_EXT]: { windowMs: 60_000, maxRequests: 10, key: "ip" } },
        },
      },
      "/payment-amount": {
        requests: {
          quotePayment: { method: "post", [RATELIMIT_EXT]: { windowMs: 60_000, maxRequests: 20, key: "ip" } },
          unlimited: { method: "get" },
        },
      },
    },
  } as unknown as OpenAPIv4Document;

  test("retryAfterSeconds = ceil(windowMs/1000), poison-guarded", () => {
    expect(retryAfterSeconds({ windowMs: 60_000 })).toBe(60); // route-handler.ts:75
    expect(retryAfterSeconds({ windowMs: 1500 })).toBe(2);
    expect(retryAfterSeconds({ windowMs: NaN })).toBe(0);
    expect(retryAfterSeconds({ windowMs: Infinity })).toBe(0);
  });

  test("rateLimitOf reads the declared budget off an operation", () => {
    const op = { [RATELIMIT_EXT]: { windowMs: 60_000, maxRequests: 20, key: "ip" as const } };
    expect(rateLimitOf(op)?.maxRequests).toBe(20);
    expect(rateLimitOf({})).toBeUndefined();
  });

  test("rateLimitIndex lists only the operations that declare a budget, sorted", () => {
    const idx = rateLimitIndex(doc);
    expect(idx.map((g) => g.operation)).toEqual(["validateDiscount", "quotePayment"]);
    expect(idx.find((g) => g.operation === "quotePayment")).toMatchObject({
      path: "/payment-amount", method: "post", maxRequests: 20, windowMs: 60_000, key: "ip",
    });
  });

  test("rateLimitCoverage counts limited vs total operations", () => {
    expect(rateLimitCoverage(doc)).toEqual({ limited: 2, total: 3 });
  });
});
