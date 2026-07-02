/** The `email` module's CONTRACT fragment — its `/api/email/*` op. Composed via `src/contract.ops.ts`. */
import type { RouteContract } from "@suluk/hono";

export const emailOps = [
  { method: "post", path: "/api/email/send", name: "sendEmail", summary: "Send a raw transactional message (internal/ops surface — gate in production).", tags: ["Email"], scopes: ["email:write"], errors: [502], responses: [{ status: 200, description: "The message was accepted by the provider." }] },
] satisfies readonly RouteContract[];
