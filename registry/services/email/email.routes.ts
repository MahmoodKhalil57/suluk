/**
 * Email routes (Suluk registry: `email`) — Hono over the {@link Email} Effect service. Mount: `app.route("/email",
 * emailRoutes())`. These are the INTERNAL/ops surface (send a raw message; fire a verification/reset email); the primary
 * integration is Better Auth's send hooks calling the service directly. GATE these in production (internal-only). Yours to
 * edit; the provider transport + templates stay in `@suluk/email`.
 */
import { Hono } from "hono";
import { Effect } from "effect";
import type { EmailMessage } from "@suluk/email";
import { type Bindings } from "../app";
import { Email, EmailLive, EmailCfgLive, type EmailEnv } from "../services/email";

export function emailRoutes() {
  const r = new Hono<{ Bindings: Bindings }>();
  const run = <A>(env: Bindings, program: Effect.Effect<A, never, Email>): Promise<A> =>
    program.pipe(Effect.provide(EmailLive), Effect.provide(EmailCfgLive(env as unknown as EmailEnv)), Effect.runPromise);

  // POST /email/send { to, subject, html, text? } — send a raw message (internal).
  r.post("/send", async (c) => {
    const msg = await c.req.json<EmailMessage>();
    const res = await run(c.env, Effect.flatMap(Email, (s) => s.send(msg)));
    return c.json(res, res.ok ? 200 : 502);
  });

  // POST /email/verify { to, verifyUrl, userName? } — the account-verification email (also wired via Better Auth).
  r.post("/verify", async (c) => {
    const { to, verifyUrl, userName } = await c.req.json<{ to: string; verifyUrl: string; userName?: string }>();
    const res = await run(c.env, Effect.flatMap(Email, (s) => s.verify(to, verifyUrl, userName)));
    return c.json(res, res.ok ? 200 : 502);
  });

  return r;
}
