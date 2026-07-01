# C55. Encrypted-committed `.env` — secrets pushed with the code via @suluk/env

> **Provenance:** Candidate-fork ADR (Suluk), not a SIG decision. Operator-surfaced: *"env should be encrypted and decrypted
> like toolfactory with @suluk/env and pushed with the code."* Grounded in the real `@suluk/env` package (post-quantum
> commit-safely secrets) + toolfactory's `env.ts`/`.env`/sync-secrets wiring. Revises the C051-build-#8 env lifecycle
> (secrets in a gitignored `.env`); governed by [C052](C052-npm-vs-registry-boundary.md); extends the [C051](C051-platform-generator-autotoolfactory.md)/[C053](C053-open-service-interface-and-composition.md) generator.

Date: 2026-07-01

## Status

**BUILT + PUBLISHED + LIVE-ADOPTED** (`@suluk/platform@0.3.2`). Ceiling **0.8**. `@suluk/platform` 88 tests pass, tsc clean;
the generated env code typechecks against autotoolfactory's real modules; an encrypt→`loadEnv` round-trip decrypts correctly;
the `link-key` → `~/.suluk/settings.json` round-trip is proven (register, `rm .env.keys`, `readPrivateKey` still resolves);
autotoolfactory adopted it (its `.env` is committed with 3 encrypted secrets; the private key lives in `~/.suluk/settings.json`
out of git). Ledger: [`0platform-generator.bn`](../../../plan/facts/0platform-generator.bn) (burhan True).

## Context — the C051-build-#8 model was "never commit `.env`"

Build #8 split config by sensitivity: SECRETS → a **gitignored** `.env` (with a `.env.temp` preflight), NON-SECRETS → the
manifest `vars` → `wrangler.toml [vars]`. That means a fresh clone has *no* secrets — they must be re-supplied out-of-band.
The operator asked for toolfactory's model instead: the `.env` is **committed**, with its secret values **encrypted**, so the
secrets travel *with the code* and one master key decrypts them.

`@suluk/env` provides exactly this: each secret value is sealed with **ML-KEM-768 + AES-256-GCM** (dotenvx's commit-safely
model, made post-quantum). The **public key + the encrypted `.env` are safe to commit**; only the **private key**
(`SULUK_PRIVATE_KEY` / `.env.keys`) decrypts. NON-secret config is unchanged (still `vars` → `[vars]`).

## Decision — the generator emits the encrypted-committed model

For each generated app's SECRETS (the catalog's `secret` env vars):

1. **`src/env.ts`** — a `defineEnv({...})` DECLARE-ONCE: every secret `{ secret: true, required?, surfaces: ["cloudflare"],
   description }`. The single typed source of truth; `sync-secrets` reads `forSurface("cloudflare")`.
2. **`.env` — COMMITTED, values ENCRYPTED.** The operator runs `suluk-env keygen` (once: `SULUK_PUBLIC_KEY` → `.env`, private
   → `.env.keys`), **`bun run link-key`** (registers the private key into the centralized `~/.suluk/settings.json` keyed by the
   repo path — then `.env.keys` can be removed), then `suluk-env set KEY=value` (encrypts each). The generator writes a
   **values-free scaffold** *only if absent*, so a regenerate never clobbers the encrypted secrets.
   - **Private-key store (0.3.2, toolfactory-exact):** `@suluk/env`'s `readPrivateKey` resolves the key by precedence
     `SULUK_PRIVATE_KEY` env > **`~/.suluk/settings.json`** (by project path) > legacy `.env.keys`. `scripts/link-key.ts` (a
     generated, verbatim-from-toolfactory script) populates that central store, so local dev / deploy / a CI worktree (which
     checks out the encrypted `.env` but not `.env.keys`, using `SULUK_PROJECT_DIR`) all decrypt from one out-of-git place.
3. **`.gitignore` FLIPPED** — `.env` is NO LONGER ignored (committed, encrypted); **`.env.keys` (the private key) is ignored**.
   `mergeGitignore` performs the transition on an existing app (removes the plaintext-era `.env` ignore when the new baseline
   ignores `.env.keys`) — reversing build #8's "always ignore `.env`" now that the values are encrypted.
4. **BOTH runtime paths** (operator chose "both"):
   - **runtime `loadEnv`** — `src/index.ts` wraps `app.fetch`; if `SULUK_PRIVATE_KEY` is a wrangler secret, it decrypts the
     committed `.env` (bundled as text) into the request env on first use. One secret to provision; self-contained.
   - **deploy `sync-secrets`** — `scripts/sync-secrets.ts` decrypts the cloudflare-surfaced secrets and `wrangler secret
     put`s each (toolfactory-exact). The runtime then uses normal secret bindings.
   The `loadEnv` wrapper is a no-op when `SULUK_PRIVATE_KEY` is unset, so the two coexist in one entry.
5. **env-check preflight** rewritten: keypair present? required secrets set? **any secret sitting in plaintext is flagged**
   (never commit a plaintext secret). `package.json` deps `@suluk/env` + `env:keygen`/`env:set`/`sync-secrets` scripts.

## Consequences

- **Secrets travel with the code, safely.** A clone has the (encrypted) secrets; a teammate/CI/preview decrypts with the one
  private key. No out-of-band secret hand-off. The public key can *add* secrets without ever seeing the others.
- **The private key is the one thing outside git.** `.env.keys` is gitignored; losing it loses decryptability (the operator
  keeps it in `~/.suluk` / a secret manager, per toolfactory).
- **Security posture is INVERTED from build #8 but SAFER** — committing an *encrypted* `.env` is safe *because* it's
  encrypted; the env-check fails closed on any plaintext secret.
- **Non-secret config is untouched** (manifest `vars` → `[vars]`). Only the secret path changed.
- **Honest boundary:** the runtime `loadEnv` path bundles the `.env` as a text import (`@ts-ignore`'d for tsc; bun + wrangler
  load it at runtime) — apps on a wrangler without text-import support use the `sync-secrets` path (both are generated).
- Two live-adoption bugs were caught by regenerating autotoolfactory (not by unit tests): `generatePlatform` dropped
  `system.wire` (fixed in 0.2.1) and `mergeGitignore` couldn't un-ignore `.env` (fixed in 0.3.1) — both now regression-tested.
