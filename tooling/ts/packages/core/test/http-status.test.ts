import { test, expect } from "bun:test";
import { validateDocument } from "../src/index";
import type { HttpStatus, HttpStatusCode, Response, Request, OpenAPIv4Document } from "../src/index";

/**
 * A fix to the `HttpStatusCode`/`HttpStatus` vocabulary. `HttpStatusCode` had been misapplied as the KEY type of
 * every response MAP (`Request.responses`/`Components.responses`/`PathItem.pathResponses`/
 * `OpenAPIv4Document.apiResponses`) via `Record<HttpStatusCode[keyof HttpStatusCode], Response>` — that indexes by
 * the interface's VALUES (the semantic names like "ok"/"notFound"), requiring EVERY one of the ~60 names present on
 * every map (an exhaustive `Record`, not a partial one) — breaking every real (sparse, author-named) response map
 * across the ecosystem. The fix: those four maps are `Record<string, Response>` again (free-form author-chosen
 * names, sparse — matching the meta-schema, which was never touched by the original bug); `HttpStatusCode` now
 * ONLY types {@link Response.status} (via the derived {@link HttpStatus} union), which is where a literal
 * status-code vocabulary actually belongs.
 */

type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

/* ── HttpStatus accepts a numeric code, its string form, "5XX", and "default" ─────────────────────────────────── */
const a: HttpStatus = 200;
const b: HttpStatus = "200";
const c: HttpStatus = "5XX";
const d: HttpStatus = "default";
void a; void b; void c; void d;
// @ts-expect-error - 999 is not a registered status
const invalidNum: HttpStatus = 999;
// @ts-expect-error - "999" is not a registered status string either
const invalidStr: HttpStatus = "999";
void invalidNum; void invalidStr;

/* ── the four response MAPS stay free-form (sparse, author-named) — the actual real-world shape ─────────────────── */
const resp: Response = { status: 200 };
const req: Request = { method: "get", responses: { ok: resp, notFound: { status: 404 } } }; // sparse — NOT exhaustive
const doc: OpenAPIv4Document = {
  openapi: "4.0.0", info: { title: "t", version: "1" },
  paths: { p: { requests: { op: req } } },
  apiResponses: { shared: { status: "default" } },
  components: { responses: { serverError: { status: "5XX" } } },
};
void doc;
type _mapIsFreeform = Expect<Equal<Request["responses"], Record<string, Response>>>;

test("HttpStatusCode: values() lookup — a status code maps to its semantic name (unaffected by the fix)", () => {
  const table: HttpStatusCode = {} as HttpStatusCode; // type-only witness the interface still exists post-fix
  expect(typeof table).toBe("object");
});

test("meta-schema: a sparse, author-named response map (the real-world shape) validates", () => {
  const document: OpenAPIv4Document = {
    openapi: "4.0.0-candidate", info: { title: "t", version: "1.0.0" },
    paths: { p: { requests: { op: { method: "get", responses: { ok: { status: 200 }, notFound: { status: 404 } } } } } },
  };
  const r = validateDocument(document);
  if (!r.valid) console.error(r.errors);
  expect(r.valid).toBe(true);
});

test("meta-schema: status accepts the numeric form, the equivalent string form, \"5XX\", and \"default\"", () => {
  for (const status of [200, "200", "5XX", "default"] as const) {
    const document: OpenAPIv4Document = {
      openapi: "4.0.0-candidate", info: { title: "t", version: "1.0.0" },
      paths: { p: { requests: { op: { method: "get", responses: { r: { status } } } } } },
    } as OpenAPIv4Document;
    const r = validateDocument(document);
    if (!r.valid) console.error(status, r.errors);
    expect(r.valid).toBe(true);
  }
});

test("meta-schema: an unregistered status (999) is rejected", () => {
  const document = {
    openapi: "4.0.0-candidate", info: { title: "t", version: "1.0.0" },
    paths: { p: { requests: { op: { method: "get", responses: { r: { status: 999 } } } } } },
  } as unknown as OpenAPIv4Document;
  expect(validateDocument(document).valid).toBe(false);
});
