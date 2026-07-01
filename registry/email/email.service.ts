/**
 * The Email service (Suluk registry: `email`) — an Effect-TS service over `@suluk/email` (the swappable EmailProvider
 * binding + the branded, localizable template set: the provider transport, the Resend/console impls, and the auth-lifecycle
 * templates all stay upstream, so a fix flows via npm). THIS layer is the owned wiring: read the provider config from env,
 * pick the provider (console in dev, Resend in prod), and expose `send` + the lifecycle senders. Email is a STATELESS
 * binding (no DB/provision) per the C052 boundary — audit sends via the `logs` module if you want a trail.
 *
 * The PROPER integration is Better Auth: pass `verify`/`reset` into `buildAuth`'s `emailVerification.sendVerificationEmail`
 * + `emailAndPassword.sendResetPassword`. The routes are the internal/ops surface.
 */
import { Context, Effect, Layer } from "effect";
import {
  pickProvider,
  verifyEmail,
  resetPasswordEmail,
  type EmailMessage,
  type SendResult,
  type EmailBrand,
  type TemplateContext,
} from "@suluk/email";

/** The env vars the provider binding needs (declare these in your `wrangler`/`.dev.vars`). */
export interface EmailEnv {
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  BRAND_NAME?: string;
  BASE_URL?: string;
  /** "production" ⇒ use Resend; anything else (or a missing key) ⇒ the console provider. */
  ENVIRONMENT?: string;
}

export interface EmailConfig {
  dev: boolean;
  apiKey?: string;
  from?: string;
  brand: EmailBrand;
}

/** Build the config from env — console provider unless production AND a key AND a from-address are all present. */
export function emailCfgFromEnv(env: EmailEnv): EmailConfig {
  return {
    dev: env.ENVIRONMENT !== "production" || !env.RESEND_API_KEY,
    apiKey: env.RESEND_API_KEY,
    from: env.EMAIL_FROM,
    brand: { brandName: env.BRAND_NAME ?? "Suluk", baseUrl: env.BASE_URL ?? "http://localhost:8787" },
  };
}

export class EmailCfg extends Context.Tag("EmailCfg")<EmailCfg, EmailConfig>() {}
export const EmailCfgLive = (env: EmailEnv): Layer.Layer<EmailCfg> => Layer.succeed(EmailCfg, emailCfgFromEnv(env));

export class Email extends Context.Tag("Email")<
  Email,
  {
    /** send a fully-formed message (internal/raw). */
    readonly send: (message: EmailMessage) => Effect.Effect<SendResult>;
    /** the account-verification email — wire into Better Auth's `sendVerificationEmail`. */
    readonly verify: (to: string, verifyUrl: string, userName?: string) => Effect.Effect<SendResult>;
    /** the password-reset email — wire into Better Auth's `sendResetPassword`. */
    readonly reset: (to: string, resetUrl: string, userName?: string) => Effect.Effect<SendResult>;
  }
>() {}

export const EmailLive = Layer.effect(
  Email,
  Effect.gen(function* () {
    const cfg = yield* EmailCfg;
    const provider = pickProvider({ dev: cfg.dev, apiKey: cfg.apiKey, from: cfg.from });
    const ctx: TemplateContext = { brand: cfg.brand };
    const sendRendered = (rendered: { subject: string; html: string; text?: string }, to: string) =>
      provider.send({ ...rendered, to, from: cfg.from });
    return {
      send: (message) => Effect.promise(() => provider.send(message)),
      verify: (to, verifyUrl, userName) => Effect.promise(() => sendRendered(verifyEmail({ verifyUrl, userName }, ctx), to)),
      reset: (to, resetUrl, userName) => Effect.promise(() => sendRendered(resetPasswordEmail({ resetUrl, userName }, ctx), to)),
    };
  }),
);
