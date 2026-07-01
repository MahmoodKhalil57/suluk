# Email — swappable provider binding + auth lifecycle

An Effect-TS `Email` service over [`@suluk/email`](../../tooling/ts/packages/email) — a stateless binding that reads the provider from env (console in dev, Resend in prod) and hands you `send` + `verify` + `reset` to wire straight into Better Auth.

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for OpenAPI
> Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative. This is that candidate's
> ecosystem, distributed as [own-the-code shadcn modules](../README.md).

## Install

```sh
pnpm dlx shadcn@latest add MahmoodKhalil57/suluk/email
# or: npx shadcn@latest add MahmoodKhalil57/suluk/email
# registryDependencies (app) are pulled in automatically
```

## What you get

Two files land in your app — both yours to edit:

- **`src/services/email.ts`** — the `Email` Effect service (`Context.Tag` + `Layer`) over `@suluk/email`.
  - `EmailCfg` / `EmailCfgLive(env)` — builds config from env via `emailCfgFromEnv`: `RESEND_API_KEY`,
    `EMAIL_FROM`, `BRAND_NAME`, `BASE_URL`, `ENVIRONMENT`. It falls back to the **console provider** unless
    `ENVIRONMENT === "production"` **and** a Resend key is present.
  - `Email` / `EmailLive` — the service resolves the provider once via `pickProvider` and exposes:
    - `send(message)` — send a fully-formed `EmailMessage` (the internal/raw path).
    - `verify(to, verifyUrl, userName?)` — the branded account-verification email.
    - `reset(to, resetUrl, userName?)` — the branded password-reset email.
- **`src/routes/email.ts`** — `emailRoutes()`, a Hono router over the service. Mount with
  `app.route("/email", emailRoutes())`. Exposes `POST /email/send` and `POST /email/verify` as the
  **internal/ops** surface — gate these in production.

**No schema, no provision fragment.** Email is a stateless binding (C052) — it owns no tables and needs no
infra. Want an audit trail of sends? Compose the [`logs`](../logs) module.

### The proper integration — Better Auth

The routes are the ops surface; the real wiring is Better Auth's send hooks calling the service directly.
In your `buildAuth` config, pass the lifecycle senders through:

```ts
emailVerification: { sendVerificationEmail: ({ user, url }) =>
  run(Effect.flatMap(Email, (s) => s.verify(user.email, url, user.name))) },
emailAndPassword: { sendResetPassword: ({ user, url }) =>
  run(Effect.flatMap(Email, (s) => s.reset(user.email, url, user.name))) },
```

## Dependencies

- **npm** (`dependencies`): `@suluk/email`, `effect`, `hono`
- **registry** (`registryDependencies`): [`app`](../app) — the base Hono app + the shared Effect runtime seam

## Own the wiring, npm the logic

This module **owns** the wiring: how the provider is selected from env, the config/brand shape, the Effect
service surface, and the ops routes — all yours to edit. What flows from **`@suluk/email`** on npm is the
correctness-critical transport + presentation: the `EmailProvider` binding, the `consoleProvider` /
`resendProvider` (Workers-safe) implementations picked by `pickProvider`, and the branded, localizable
lifecycle templates (`verifyEmail`, `resetPasswordEmail`, and the wider set). Fix a template or a provider
quirk once upstream and it reaches every consumer via a version bump — your binding never forks.
