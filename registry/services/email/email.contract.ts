/** The `email` module's CONTRACT fragment — its `/api/email/*` op. Composed via `src/contract.ops.ts`. */
import type { RouteContract } from "@suluk/hono";

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
    responses: [{ status: 200, description: "The message was accepted by the provider." }],
  },
] satisfies readonly RouteContract[];
