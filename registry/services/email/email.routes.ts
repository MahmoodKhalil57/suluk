/**
 * Email routes (Suluk registry: `email`) — Hono over the {@link Email} Effect service, defined with `@suluk/effect`'s
 * `effectRoute`: each handler is an Effect whose ERROR CHANNEL bubbles up into the contract as DETAILED, typed responses
 * (a 502 ExternalServiceError { provider, detail } when the provider rejects the send) instead of a bare
 * `c.json(res, res.ok ? 200 : 502)` with no documented body. Each route's `contract` is spread into `./email.contract`
 * so the doc/Scalar/SDK show those exact shapes and the route + its contract can't drift.
 *
 * Mount: `app.route("/email", emailRoutes())`. These are the INTERNAL/ops surface (send a raw message; fire a
 * verification email); the primary integration is Better Auth's send hooks calling the service directly. GATE these in
 * production (internal-only). Yours to edit; the provider transport + templates stay in `@suluk/email`.
 */
import { Effect } from "effect";
import { z } from "zod";
import { effectRoute, routeGroup, ExternalServiceError } from "@suluk/effect";
import type { EmailMessage } from "@suluk/email";
import { type Bindings } from "../app";
import { Email, EmailLive, EmailCfgLive, type EmailEnv } from "../services/email";

type Env = { Bindings: Bindings };
type Bind = Env["Bindings"];

// The module's ENVELOPE — `send` is DOCUMENTED (its typed 502 bubbles into the contract), `verify` is MOUNTED-only (an ops
// surface the contract omits; its primary trigger is Better Auth's send hook). `.ops` replaces `email.contract.ts`;
// `.router()` replaces the hand-written mount. The single source is the route definitions below.
const email = routeGroup("/api/email");

/** Fully-provide an Email program against the request's env — the SAME layer stack the old `run` used, so the Effect's
 *  remaining requirements are discharged (`R = never`) before it reaches the effectRoute handler. */
const provide = <A, E>(env: Bind, program: Effect.Effect<A, E, Email>): Effect.Effect<A, E, never> =>
  program.pipe(Effect.provide(EmailLive), Effect.provide(EmailCfgLive(env as unknown as EmailEnv)));

// ── schemas ──
/** A sendable transactional message — rendered content ({@link @suluk/email}'s RenderedEmail) plus addressing. */
const EmailMessageSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  subject: z.string(),
  html: z.string(),
  text: z.string().optional(),
  from: z.string().email().optional(),
  replyTo: z.string().email().optional(),
});
/** The provider send outcome — @suluk/email's `SendResult` (ok flag + optional id/error + advisory µ$ cost). */
const SendResultSchema = z.object({
  ok: z.boolean(),
  id: z.string().optional(),
  error: z.string().optional(),
  costMicroUsd: z.number().optional(),
});

// ══════════════════════════════════════════════════════════════════════════════════════════
// INTERNAL ops surface — send a raw message; the provider-reject path (res.ok === false) is a TYPED 502.
// ══════════════════════════════════════════════════════════════════════════════════════════

// POST /email/send { to, subject, html, text? } — send a raw message (internal). The old `c.json(res, res.ok ? 200 : 502)`
// becomes a success 200 on accept, or a TYPED 502 ExternalServiceError { provider: "email", detail } when the provider rejects.
export const sendEmailRoute = email.route(effectRoute({
  method: "post", path: "/api/email/send", name: "sendEmail",
  summary: "Send a raw transactional message (INTERNAL ops surface — never hosted; call via internalFetch in tests).",
  tags: ["Email"], scopes: ["email:write"],
  // INTERNAL: grouped under "Internal" in the docs + 404'd over the wire in dev AND live (the contract's enforceInternal
  // guard), so it can't be accidentally exposed. Invoke it from tests via `internalFetch(app, req, env, ctx)` (@suluk/hono).
  internal: true,
  // ROUTE ECONOMICS declared INLINE (x-suluk-cost) — @suluk/scalar renders it (cost + settlement badges + detail),
  // @suluk/cost audits + records it. This route incurs a real EXTERNAL cost (one Resend API call per message); it's a
  // declared ESTIMATE (~$0.0004), settled `free` — an internal/ops surface, so the OPERATOR absorbs the provider cost.
  cost: {
    estimateMicroUsd: 400,
    components: [{ source: "resend", basis: "per-request", microUsd: 400, description: "one transactional email via the Resend API" }],
    settlement: { method: "rate-limited" },
  },
  request: { json: EmailMessageSchema },
  ok: { status: 200, schema: SendResultSchema, description: "The message was accepted by the provider." },
  errors: [ExternalServiceError],
  rateLimit: { windowMs: 60_000, maxRequests: 30, key: "principal" },
  run: (c) => Effect.gen(function* () {
    const msg = yield* Effect.promise(() => c.req.json<EmailMessage>());
    const s = yield* Email;
    const res = yield* s.send(msg);
    if (!res.ok) return yield* new ExternalServiceError({ provider: "email", detail: res.error ?? "the provider rejected the send" });
    return res;
  }).pipe((p) => provide(c.env, p)),
}));

// POST /email/verify { to, verifyUrl, userName? } — the account-verification email (also wired via Better Auth). Same
// provider-reject path → a TYPED 502 ExternalServiceError. MOUNTED-only (undocumented — the contract omits it), so it's
// registered with `mountOnly`: it serves over the wire but contributes nothing to `.ops`.
export const verifyEmailRoute = email.mountOnly(effectRoute({
  method: "post", path: "/api/email/verify", name: "verifyEmail",
  summary: "Send the account-verification email (INTERNAL ops surface; also wired via Better Auth's sendVerificationEmail).",
  tags: ["Email"], scopes: ["email:write"],
  internal: true,
  cost: {
    estimateMicroUsd: 400,
    components: [{ source: "resend", basis: "per-request", microUsd: 400, description: "one transactional email via the Resend API" }],
    settlement: { method: "rate-limited" },
  },
  request: { json: z.object({ to: z.string().email(), verifyUrl: z.string(), userName: z.string().optional() }) },
  ok: { status: 200, schema: SendResultSchema, description: "The verification email was accepted by the provider." },
  errors: [ExternalServiceError],
  rateLimit: { windowMs: 60_000, maxRequests: 30, key: "principal" },
  run: (c) => Effect.gen(function* () {
    const { to, verifyUrl, userName } = yield* Effect.promise(() => c.req.json<{ to: string; verifyUrl: string; userName?: string }>());
    const s = yield* Email;
    const res = yield* s.verify(to, verifyUrl, userName);
    if (!res.ok) return yield* new ExternalServiceError({ provider: "email", detail: res.error ?? "the provider rejected the send" });
    return res;
  }).pipe((p) => provide(c.env, p)),
}));

/** The `email` module's CONTRACT fragment — bubbled up from the routes above (replaces `email.contract.ts`). Only `send`
 *  is documented; `verify` was registered with `mountOnly`, so it isn't here. */
export const emailOps = email.ops;

/**
 * Mount every route's Effect handler at its sub-path — DERIVED from the envelope (`.router()` mounts each handler-backed
 * route at its `/api/email`-relative path), so the mount can't drift from the definitions and there's no per-route list.
 */
export function emailRoutes() {
  return email.router();
}
