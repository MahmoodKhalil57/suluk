[**Suluk**](../../README.md)

***

[Suluk](../../packages.md) / @suluk/env

# @suluk/env

**Config + secrets as a single source of truth — made post-quantum-safe.**

Declare each variable **once**, encrypt the secret **values** with post-quantum crypto so the `.env`
is safe to commit to git and share over public channels, and project that one declaration into **every
surface**: local dev, Cloudflare Workers, preview, a teammate's machine, the VS Code extension, the
admin panel.

It's [dotenvx](https://github.com/dotenvx/dotenvx)'s commit-safely model (a public key encrypts, a
private key decrypts, the encrypted `.env` is committable), with two differences:

1. **Post-quantum.** Values are sealed with **ML-KEM-768** (FIPS-203 key-encapsulation) + **AES-256-GCM**,
   not elliptic-curve ECIES. Quantum-safe, and via [`@noble/post-quantum`](https://github.com/paulmillr/noble-post-quantum)
   it's pure JS — it runs the same in Node, Bun, the browser, **and a Cloudflare Worker**.
2. **Suluk-native.** `defineEnv` makes config a *declared* thing — typed access, a per-surface manifest,
   and a config-**health** view — the same "declare once, project everywhere" idea as the entity registry,
   applied to configuration.

## Why it's safe to commit

Each value is encrypted to a **public key** (embedded in the `.env` as `SULUK_PUBLIC_KEY`). Only the
**private key** (`SULUK_PRIVATE_KEY`, kept in a gitignored `.env.keys` or a secret binding) can decrypt.
So:

- the encrypted `.env` can live in git and be shared in a Slack message — the ciphertext reveals nothing;
- **anyone with just the public key can add or re-encrypt a variable** — a teammate can add a secret
  without ever holding the decryption key;
- the private key travels out-of-band (a password manager, a CI secret, `wrangler secret put`).

### Where the private key is read from

`readPrivateKey` (Node/Bun) resolves the key in precedence order:

1. **`SULUK_PRIVATE_KEY` env var** — wins; for CI/prod and secret bindings.
2. **`~/.suluk/settings.json`** — a centralized, machine-local store mapping each project to its key, so a
   new repo needs **no per-repo `.env.keys`** — just an entry here. The project is matched by the running
   directory (`SULUK_PROJECT_DIR` or cwd), by `path` prefix, falling back to the project `name` as a path
   segment (so worktrees resolve). Override the location with `SULUK_SETTINGS_PATH`. Shape:
   ```json
   { "projects": [ { "name": "my-app", "path": "/abs/path/my-app",
                     "env": [ { "key": "SULUK_PRIVATE_KEY", "value": "mlkem768:…" } ] } ] }
   ```
3. **`.env.keys`** — the legacy per-repo gitignored file (still honored for back-compat).

Both `~/.suluk/settings.json` and `.env.keys` hold the **plaintext** private key — guard them like any
secret (they live outside the repo / are gitignored, so neither is ever committed). A malformed or
unreadable `settings.json` is ignored, not fatal: resolution simply falls through to the next source.

## CLI

```bash
suluk-env keygen                 # ML-KEM-768 keypair → public in .env, private in .env.keys (auto-gitignored)
suluk-env set STRIPE_KEY=sk_live_…   # add/update a variable, encrypted (use --plain for non-secrets)
suluk-env encrypt --skip BASE_URL    # encrypt every plaintext value in .env in place
suluk-env ls                     # list variables (masked) + their encrypted/plaintext state
suluk-env get STRIPE_KEY         # decrypt + print one value
suluk-env decrypt                # print the whole .env decrypted (--out file to write)
suluk-env run -- bun start       # decrypt into the environment, then run a command
```

A committed `.env` ends up looking like:

```ini
SULUK_PUBLIC_KEY="mlkem768:EfIdiAi0Fy…"        # commit this — it can only encrypt
BASE_URL="http://localhost:3000"               # left plaintext (not a secret)
STRIPE_SECRET_KEY="encrypted:mlkem768:Alu+Ks…" # ciphertext — safe in git
```

## Library

The core (`@suluk/env`) is runtime-agnostic — Web Crypto + `@noble/post-quantum`, no `node:fs` — so it
imports cleanly inside a Worker. The `fs` helpers + CLI live in `@suluk/env/node`; the raw primitives
(`keygen` / `encrypt` / `decrypt` / `publicFromPrivate`) are also available standalone at `@suluk/env/crypto`
(and re-exported from the main entry).

```ts
import { keygen, encrypt, decrypt, loadEnv } from "@suluk/env";

// decrypt a committed .env at runtime — works in Node, Bun, AND a Cloudflare Worker
await loadEnv({ content: envFileText, privateKey: env.SULUK_PRIVATE_KEY }); // → injected into process.env
```

In a Worker, ship the encrypted `.env` text in the bundle and pass the private key from a secret binding —
the **same one source of truth** decrypts on every surface.

## Single source of truth — `defineEnv`

```ts
import { defineEnv } from "@suluk/env";

export const env = defineEnv({
  BASE_URL:          { default: "http://localhost:3000", surfaces: ["local", "cloudflare", "preview"] },
  STRIPE_SECRET_KEY: { secret: true, required: true,     surfaces: ["local", "cloudflare"], description: "Stripe API key" },
  RESEND_API_KEY:    { secret: true,                     surfaces: ["cloudflare"] },
});

env.parse(process.env).STRIPE_SECRET_KEY;  // typed + validated (required vars are non-null; throws if missing)
env.forSurface("cloudflare");              // which vars to `wrangler secret put` (the deploy planner reads this)
env.manifest(rawEnvRecord());              // config HEALTH: ok | missing | plaintext-secret | empty + encrypted?
```

`manifest()` is what the **admin panel** renders and the **VS Code extension** surfaces: which keys exist,
which are encrypted at rest, which required ones are **missing**, and — the high-value check — which secrets
are sitting in **plaintext** when they should be encrypted.

### Fail-closed startup gate — `assertEnv` / `validate`

Add per-var value rules (`minLength`, `pattern`, `requiredInSurface`, `forbidInSurface`) and validate the
config at boot. `assertEnv` throws on any **error**-severity issue so a misconfigured/short/test secret in prod
stops the process instead of shipping; warnings go to `onWarn` and never throw. `validate` returns the graded
issue list without throwing.

```ts
const env = defineEnv({
  STRIPE_SECRET_KEY: {
    secret: true, minLength: 20, pattern: /^sk_(test|live)_/,
    requiredInSurface: ["cloudflare", "preview"],
    forbidInSurface: [{ pattern: /^sk_test_/, surfaces: ["cloudflare"], message: "a TEST Stripe key in prod", severity: "warning" }],
  },
});

env.validate(process.env, { surface: "cloudflare" });   // → EnvIssue[] (graded; never throws)
const config = env.assertEnv(process.env, {             // throws on any error; warnings → onWarn
  surface: "cloudflare",
  onWarn: (issue) => console.warn(issue.message),
  allow: [],                                            // explicit, auditable per-var error downgrades
});
```

## Cryptographic construction

Per value: `encapsulate(publicKey) → (kemCiphertext, sharedSecret)`; `AES-256-GCM(sharedSecret, iv, plaintext)`.
The token is `encrypted:mlkem768:` + base64(`kemCiphertext[1088] | iv[12] | aesCiphertext+tag`). A fresh KEM
encapsulation per value is what lets you add one variable with only the public key. A wrong key or a tampered
token fails the GCM authentication tag → decryption throws.

> Candidate tooling for the Suluk (OpenAPI v4) ecosystem. Apache-2.0.

## Interfaces

- [AssertOptions](interfaces/AssertOptions.md)
- [DefinedEnv](interfaces/DefinedEnv.md)
- [EnvIssue](interfaces/EnvIssue.md)
- [Keypair](interfaces/Keypair.md)
- [LoadOptions](interfaces/LoadOptions.md)
- [ManifestEntry](interfaces/ManifestEntry.md)
- [VarSpec](interfaces/VarSpec.md)

## Type Aliases

- [EnvSpec](type-aliases/EnvSpec.md)
- [HealthStatus](type-aliases/HealthStatus.md)
- [IssueSeverity](type-aliases/IssueSeverity.md)
- [Parsed](type-aliases/Parsed.md)
- [Surface](type-aliases/Surface.md)

## Variables

- [PRIVATE\_KEY\_NAME](variables/PRIVATE_KEY_NAME.md)
- [PUBLIC\_KEY\_NAME](variables/PUBLIC_KEY_NAME.md)
- [SCHEME](variables/SCHEME.md)

## Functions

- [decrypt](functions/decrypt.md)
- [decryptContent](functions/decryptContent.md)
- [defineEnv](functions/defineEnv.md)
- [encrypt](functions/encrypt.md)
- [encryptContent](functions/encryptContent.md)
- [isEncrypted](functions/isEncrypted.md)
- [keygen](functions/keygen.md)
- [loadEnv](functions/loadEnv.md)
- [parseEnv](functions/parseEnv.md)
- [publicFromPrivate](functions/publicFromPrivate.md)
- [resolveEnv](functions/resolveEnv.md)
