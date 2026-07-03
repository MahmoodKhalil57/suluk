/**
 * COMMON typed HTTP errors — reusable {@link httpError} classes for the failure modes routes share, mapped to the same tags +
 * statuses as @suluk/core's `PROBLEM_STATUS_TABLE`. Reach for these so error shapes are CONSISTENT across a codebase; define a
 * route-specific `httpError(...)` only when the body needs extra fields. Failing with one bubbles it into the route's contract
 * as a DETAILED, typed response (its status + these fields) instead of a generic ProblemDetails.
 *
 *   run: (c) => Effect.gen(function* () {
 *     const row = yield* db.find(id);
 *     if (!row) return yield* new NotFound({ resource: "user", id });   // → a typed 404 { resource, id }
 *     ...
 *   })
 */
import { z } from "zod";
import { httpError } from "./errors";

/** 400 — the input failed validation. `issues` is the list of human-readable problems (e.g. zod issue messages). */
export const ValidationError = httpError("ValidationError", 400, z.object({ issues: z.array(z.string()) }));

/** 401 — authentication is required / the credential is invalid. */
export const UnauthorizedError = httpError("UnauthorizedError", 401, z.object({ reason: z.string() }));

/** 403 — authenticated but not allowed (missing scope / not the owner). */
export const ForbiddenError = httpError("ForbiddenError", 403, z.object({ reason: z.string(), scope: z.string().optional() }));

/** 402 — a charge can't be covered (credits/subscription). Carries what was needed vs. available so the client can react. */
export const PaymentError = httpError("PaymentError", 402, z.object({ required: z.number().int(), balance: z.number().int() }));

/** 404 — the addressed resource doesn't exist. `resource` names the kind; `id` is the missing identifier when known. */
export const NotFoundError = httpError("NotFoundError", 404, z.object({ resource: z.string(), id: z.string().optional() }));

/** 409 — the request conflicts with current state (e.g. a duplicate, or an already-cancelled subscription). */
export const ConflictError = httpError("ConflictError", 409, z.object({ resource: z.string(), reason: z.string() }));

/** 502 — an upstream/third-party call failed (Stripe, Resend, …). `provider` names it; `detail` is the upstream message. */
export const ExternalServiceError = httpError("ExternalServiceError", 502, z.object({ provider: z.string(), detail: z.string() }));
