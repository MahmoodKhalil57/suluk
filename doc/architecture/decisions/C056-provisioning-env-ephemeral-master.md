# C56. Provisioning env completeness + the ephemeral-master credential lifecycle

> **Provenance:** Candidate-fork ADR (Suluk), not a SIG decision. Operator-surfaced across five turns: *"autotoolfactory has a
> ton less env variables than toolfactory … we didn't provision + set up everything properly"* → *"CLOUDFLARE_API_TOKEN and
> other sensitive keys added unencrypted first in .env.temp, after encrypted + provisioned to .env, ones needed for
> provisioning other keys can be deleted before being pushed"* → *"provisioning consumes a .env.temp if it exists (deletes it
> after) or uses existing .env"* → *"master token shouldn't be pushed to git, only provisioned scoped tokens; decryption token
> pushed to cloudflare env keys directly + stored in ~/.suluk/settings.json"* → *"instruct the user to delete the master CF
> token from cloudflare after minting"*. Grounded in a full map of toolfactory's `env.ts`/`.env`/provision/mint scripts.
> Extends [C055](C055-encrypted-committed-env.md); governed by [C052](C052-npm-vs-registry-boundary.md).

Date: 2026-07-01

## Status

**BUILT + PUBLISHED** (`@suluk/platform@0.4.0`). Ceiling **0.62** (the env-declaration completeness + the credential-lifecycle
scripts are BUILT + `92 tests pass` + tsc clean + all 4 generated scripts transpile/typecheck against `@suluk/env/node`, but
the CF-calling steps — `suluk-provision apply`, token minting, `wrangler secret put` — are OPERATOR-RUN and not yet executed
end-to-end against a real Cloudflare account). Ledger: [`0platform-generator.bn`](../../../plan/facts/0platform-generator.bn)
(burhan True).

## Context — the generated app under-declared its env

C055 committed the `.env` encrypted, but the generated app only declared the RUNTIME app secrets (auth/stripe/resend/google).
toolfactory declares **24 vars** — including the **Cloudflare provisioning creds** (`CLOUDFLARE_API_TOKEN` master +
`CLOUDFLARE_ACCOUNT_ID` + ~11 scoped least-privilege tokens) surfaced `local` — that actually stand the app up + deploy it. So
a generated app couldn't provision like toolfactory. Two decisions followed.

## Decision A — declare the provisioning env (the completeness fix)

`EnvVar` gains three fields: **`surface`** (`"local"` = provision/deploy-only, never shipped to the Worker · `"cloudflare"` =
a Worker runtime secret), **`provisioning`** (an EPHEMERAL master cred, deleted before commit), and **`minted`** (a scoped
token minted during provisioning). The catalog's `app` service now declares `CLOUDFLARE_API_TOKEN` (master, `provisioning`),
`CLOUDFLARE_ACCOUNT_ID` (a KEEPER — routine scoped-token ops need it), and the scoped `CLOUDFLARE_D1/WORKERS/KV_TOKEN`
(`minted`); `admin` declares `SUPERADMIN_EMAILS`. `src/env.ts` (`defineEnv`) emits every secret with its surface.

## Decision B — the ephemeral-master credential lifecycle (diverges from toolfactory)

toolfactory keeps **all** creds encrypted in git (including the master, as a deploy fallback). The operator chose a more
conservative posture: the master token is **ephemeral** — used once, then deleted, never committed. The generator emits:

- **`.env.temp`** — the PLAINTEXT bootstrap (gitignored). The operator drops the raw provisioning creds + runtime secrets here.
- **`scripts/provision.ts`** — the lifecycle: (1) ensure a keypair centralized in `~/.suluk/settings.json` (`link-key`); (2)
  **source the creds** — CONSUME `.env.temp` if present (stage into `.env`), else decrypt the existing `.env`; (3)
  `suluk-provision apply` (D1/KV); (4) `mint-tokens` — mint the scoped least-privilege tokens from the master via the CF API,
  each encrypted into `.env`; (5) `suluk-env encrypt` the keepers; (6) **DELETE the ephemeral master** from `.env` (never
  committed); (7) delete `.env.temp`; (8) `git add -f .env`. It then **instructs the operator to REVOKE the master token in the
  Cloudflare dashboard** — it minted the scoped tokens and is no longer needed (a fresh one is generated to provision/mint/
  teardown later).
- **`scripts/mint-tokens.ts`** — `POST /accounts/{id}/tokens` per scoped token (toolfactory's pattern), idempotent, value never printed.
- **The decryption key (`SULUK_PRIVATE_KEY`)** lives in `~/.suluk/settings.json` (local) AND is pushed to the Worker by
  `sync-secrets` (`wrangler secret put SULUK_PRIVATE_KEY`) so `loadEnv` decrypts the committed `.env` at runtime.
- **`.env.example`** splits provisioning-creds (→ `.env.temp`) from runtime secrets; **env-check** understands the
  `.env.temp`→`provision`→sealed-`.env` flow (a lingering `.env.temp` → "run `bun run provision`").

## Credential homes (the end state)

| Credential | git (`.env`) | `~/.suluk/settings.json` | CF Worker secret | CF dashboard |
|---|---|---|---|---|
| `CLOUDFLARE_API_TOKEN` (master) | ❌ deleted | ❌ | ❌ | ⚠ operator revokes after minting |
| scoped `D1`/`WORKERS`/`KV` tokens | ✅ encrypted | ❌ | ❌ (local surface) | live (revocable) |
| `SULUK_PRIVATE_KEY` (decryption) | ❌ never | ✅ local decrypt | ✅ Worker decrypt (loadEnv) | — |
| `CLOUDFLARE_ACCOUNT_ID` (keeper) | ✅ encrypted | — | ❌ | — |
| runtime secrets | ✅ encrypted | — | via loadEnv/sync-secrets | — |

## Consequences

- **The generated app is now provisioning-complete** — its env declares the same shape toolfactory needs to stand up + deploy.
- **The master token never touches git and is revoked after use** — a smaller blast radius than toolfactory's keep-encrypted
  posture; routine deploy/migrate use the minted least-privilege tokens (no master fallback, by design).
- **One decryption key, two homes** (local `~/.suluk`, the Worker secret) — the committed encrypted `.env` decrypts everywhere.
- **Honest boundary:** the CF-calling steps are operator-run + not yet executed against a real account (hence the modest
  ceiling); the generator produces the faithful scripts (transpile + typecheck-verified against `@suluk/env/node`).
- Extends C055 (which established the committed-encrypted `.env`); this adds the provisioning creds + the master-ephemeral flow.
