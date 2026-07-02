/** The `email` module's CONTRACT fragment — its `/api/email/*` op. Composed via `src/contract.ops.ts`. */
import { z } from "zod";
import type { RouteContract } from "@suluk/hono";

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

export const emailOps = [
  {
    method: "post", path: "/api/email/send", name: "sendEmail",
    summary: "Send a raw transactional message (INTERNAL ops surface — never hosted; call via internalFetch in tests).",
    tags: ["Email"], scopes: ["email:write"], errors: [502],
    // INTERNAL: grouped under "Internal" in the docs + 404'd over the wire in dev AND live (the contract's enforceInternal
    // guard), so it can't be accidentally exposed. Invoke it from tests via `internalFetch(app, req, env, ctx)` (@suluk/hono).
    internal: true,
    // ROUTE ECONOMICS declared INLINE (x-suluk-cost) — @suluk/scalar renders it (cost + settlement badges + detail),
    // @suluk/cost audits + records it. This route incurs a real EXTERNAL cost (one Resend API call per message); it's a
    // declared ESTIMATE (~$0.0004), settled `free` — an internal/ops surface, so the OPERATOR absorbs the provider cost.
    cost: {
      estimateMicroUsd: 400,
      components: [{ source: "resend", basis: "per-request", microUsd: 400, description: "one transactional email via the Resend API" }],
      settlement: { method: "free" },
    },
    // BODY: the route reads `c.req.json<EmailMessage>()` — the fully-formed message handed to the provider.
    request: { json: EmailMessageSchema },
    // The route returns the provider's `SendResult` as JSON on 200; a failed send (res.ok === false) surfaces as 502.
    responses: [{ status: 200, description: "The message was accepted by the provider.", schema: SendResultSchema }],
    rateLimit: { windowMs: 60_000, maxRequests: 30, key: "principal" },
  },
] satisfies readonly RouteContract[];
