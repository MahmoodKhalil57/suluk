# C057 — Mock-provider local dev (mock-until-keyed, single environment)

> **Provenance.** A Suluk *candidate* decision (substrate codename `asl-ojs`), authored by the single contributor, grounded
> in burhan/daftar/mizan — **not** a Moonwalk SIG decision. Operator-driven (2026-07-02). Builds on [C051](C051-platform-generator-autotoolfactory.md)
> (generator), [C052](C052-npm-vs-registry-boundary.md) (the npm/registry/manifest split), [C053](C053-open-service-interface-and-composition.md)
> (system/brand manifest), [C055](C055-encrypted-committed-env.md) + [C056](C056-provisioning-env-ephemeral-master.md) (env/provision lifecycle).

**Status:** BUILT + PROVEN END-TO-END + PUBLISHED + LIVE-ADOPTED (autotoolfactory `local:true`). Confidence ceiling **0.8**.

## Context

A generated Suluk app is a Cloudflare Worker (D1 + KV bindings) that needs real external services (Cloudflare, Google OAuth,
Stripe/Hyperswitch, Resend) to run. The operator wanted it to run **fully local** with those providers *mocked*, so a fresh
app works with zero accounts — then `bun run provision` + real keys swaps to real services.

The operator **clarified the framing**: this is **not** "local vs prod environments". It is a **single environment,
mock-until-keyed** — *no key → mock; key present (after provision/mint) → real*. So the selection is **env/binding-presence
autodetect**, and the mock DB is a plain `bun:sqlite` file (explicitly **not** miniflare). (A design panel's dual-entrypoint +
positive-signal `SULUK_LOCAL` scheme was **rejected** as overkill: its fail-open worry assumed a *separate prod env to
protect*, which does not exist yet. Future multi-env + feature-flags is the proper prod-lockdown.)

## Decision

Opt-in via the manifest `local: true` (default false → the C051/C053 golden stays **byte-identical**; a companion golden
locks the variant). It emits `src/dev.ts` — a **bun server that runs the SAME wired app** (`src/index.ts` gains
`export const app`) under bun with mock bindings. The **deployed Worker (`src/index.ts`) imports none of the mocks** (so
`bun:sqlite`/mock code never enters the bundle — grep-verified 0).

**C052 split — zero new packages.** Every mock extends an *existing* owner + registry wiring:

| Provider | Mock | npm (logic) | registry / manifest |
|---|---|---|---|
| Cloudflare D1 | `bun:sqlite` file | `d1FromSqlite` in **@suluk/cloudflare/local** (new bun-only subpath) — a D1Database facade over bun:sqlite | `DbLive` unchanged |
| Cloudflare KV | JSON file | `jsonFileKvStore` in @suluk/cloudflare/local | dev entry injects `RATE_CREDIT_KV` |
| schema | CREATE TABLE from drizzle objects | `applyLocalSchema`/`tableDDL` (via `getTableConfig`) — there are no `.sql` migrations | — |
| Google OAuth | any-email login | `devLoginHandler` in **@suluk/better-auth** — mints a REAL session via public `signUp`+`signIn(asResponse)`; fail-closed `armed` gate | `registry/auth` arms it in dev-mock; `POST /api/auth/dev-login` |
| Stripe | generic responses | `mockStripeFetch` in **@suluk/billing** (owns the shapes) | dev entry injects `STRIPE_FETCH` |
| Resend | local mailbox | `storeProvider` in **@suluk/email** + `jsonFileMailbox` in @suluk/cloudflare/local | `registry/email` threads `SULUK_MAILBOX_SINK`; `GET /api/email/dev/mailbox` |

**Auth safety.** The any-email login is armed only in **dev-mock** (`ENVIRONMENT !== "production"` AND no `GOOGLE_CLIENT_ID`);
a deployed Worker sets `ENVIRONMENT="production"` (a committed wrangler `[var]`) → the endpoint **404s** (proven). The gate
lives in the npm handler (checked before any input is read), so an app can't weaken it by editing its wiring.

## What was proven (this session)

- `d1FromSqlite` satisfies drizzle-orm/d1 end-to-end (insert…returning / where / update / project); `applyLocalSchema`
  creates all 22 autotoolfactory tables from the drizzle schema.
- The full 18-service app **boots under bun** with the mock env (no mount throws) and serves `/health`.
- Any-email dev-login → real session token + cookie → `get-session` resolves the user; `ENVIRONMENT=production` → 404.
- `mockStripeFetch` drives @suluk/billing's real transport (createCustomer/checkout/subscription/prices); mailbox route live.
- Published `email@0.2.0 cloudflare@0.3.1 billing@0.2.0 better-auth@0.2.0 platform@0.5.2`; adopted in autotoolfactory.

## Honestly-low ceiling (0.8, not higher)

The Stripe mock returns **generic** responses (not a stateful simulator) — a webhook-driven credit grant needs the webhook
fired manually. The "**local connects to REAL D1/KV after provision**" path is **deferred**: a bun process can't bind a remote
D1/KV (it needs the D1 HTTP API). Real *HTTP* providers (Google/Stripe/Resend) DO work locally post-provision via the
decrypted `.env`. Future multi-env + feature-flags is the proper prod-lockdown for the auth mock.
