# C058 — Single-source URLs + single-environment live-attach

> **Provenance.** A Suluk *candidate* decision (codename `asl-ojs`), authored by the single contributor, grounded in
> burhan/daftar/mizan — **not** a Moonwalk SIG decision. Operator-driven (2026-07-02). Builds on
> [C051](C051-platform-generator-autotoolfactory.md), [C052](C052-npm-vs-registry-boundary.md),
> [C053](C053-open-service-interface-and-composition.md), [C055](C055-encrypted-committed-env.md),
> [C056](C056-provisioning-env-ephemeral-master.md), [C057](C057-mock-provider-local-dev.md).

**Status:** BUILT + PROVEN E2E (local) + PUBLISHED + ADOPTED. Confidence ceiling **0.72** (the live-attach + www-redirect are
unit-tested but operator-gated for the real-Cloudflare run).

## Context

Two operator asks. **(1)** The manifest hand-authored the same URL 7× across 3 sites (`BASE_URL`, `BETTER_AUTH_URL`,
`TRUSTED_ORIGINS`, `EMAIL_FROM`, + the MCP `loginPage/consentPage/resource`), all with protocol. The operator wants **two bare
hosts declared once** — `LOCAL_BASE_URL` (local) + `LIVE_BASE_URL` (production), protocol-less — with everything else
*derived* (protocol added contextually; www redirect provisioned). **(2)** *Enforce a single environment*: the provisioned
code runs from a local machine **or** live Workers against the **same** services (a future "copy-paste" makes a production
env). Local may reach live services; a live Worker can't reach local mocks (fine). And mock oauth/payment/email must work
*even against live D1/KV*; recommend purging state on any mock↔real swap or provision migration.

## Decision

**Part 1 — one source, derived everywhere.** `src/urls.ts` (pure, generator-internal): `isLocal` (hostname-only, so
`example.com:8443` is not misclassified), `withProtocol` (local→http, domain→https, default ports stripped for exact
origin-match), `deriveUrls(runtimeHost, liveHost, {scopes})`. `resolve.ts` `deriveHosts` runs on the normalized manifest and
bakes the **LIVE**-derived vars into `wrangler.toml [vars]` + the entry's MCP mount, and the **LOCAL**-derived vars into
`src/dev.ts` (`localVars`, re-pointed at the actual PORT). Runtime-varying (`BASE_URL`/`BETTER_AUTH_URL`/`TRUSTED_ORIGINS`) vs
always-live (`EMAIL_FROM` domain + MCP OAuth identity). Gated on `LIVE_BASE_URL` present AND no hand-authored `BETTER_AUTH_URL`
→ a legacy full-URL manifest regenerates **byte-identical** (companion golden locks the two-host variant). `serviceOpts.auth.mcpScopes`
(typed) replaces the full MCP URL block. **www→apex 301** via a new `cloudflareWwwRedirect` broker + `resolveZoneId`/`ensureWwwRedirect`.

**Part 2 — genuinely one environment.** `@suluk/cloudflare/live` (new sqlite-free subpath): `d1FromHttp` (a `D1Database` over
`queryD1` HTTP) + `httpKvStore` (a `KVNamespace` over `kvGet`/`kvPut`). `src/dev.ts` attaches to the **same live D1+KV** as the
Worker once provisioned (CF token + account + binding ids parsed from `wrangler.toml`), else the C057 mock — **both-or-neither**
for state. The provider mocks (Google/Stripe/Resend) each stay mock-by-their-own-key **independently**, so a mock login/payment/
email works against **live** state too. `scripts/purge-state.ts` (+ startup recommendation) clears local mock state always and,
with `--yes`, DROPs live D1 tables + clears KV (R2 via the dashboard).

**C052: zero new packages** — `@suluk/platform` +`urls.ts`; `@suluk/cloudflare` +`/live` subpath +zone helpers; `@suluk/provision`
+1 broker.

## Proven (this session)

Two-host autotoolfactory manifest → `wrangler [vars]` all derived (apex + www), `src/index.ts` MCP derived from live, `src/dev.ts`
LOCAL vars `http://localhost:8787`; dev boots (22 tables), **dev-login mints a real session on the derived local URL**, PORT
override rebased the localhost URLs, `purge` cleared local state. 107 platform + 32 cloudflare tests. Published `cloudflare@0.4.0`,
`provision@0.2.0`, `platform@0.6.0`; adopted in autotoolfactory (tsc clean bar the pre-existing openapi-compat nit).

## Honestly-low ceiling (0.72)

The **live-attach** (local → real D1/KV over the CF HTTP API) and the **www-redirect broker** are **unit-tested against a
stubbed client**, NOT run end-to-end against a real Cloudflare account/zone (operator-gated, like C056's `provision apply`). The
D1-over-HTTP `/query` is auto-commit-per-call, so `batch()` is sequential-not-atomic (documented; the only wired local write —
signup-grant → `credits.grantOnce` — is idempotent-by-key), and `raw()`/`db.values()` maps by object-key order (D1 preserves
column order; no current consumer uses it). Prod-lockdown of the auth mock (dev-login off in a real production env) is deferred
to the future multi-env + feature-flags work; today the single environment's state is treated as disposable (purge on swap).
