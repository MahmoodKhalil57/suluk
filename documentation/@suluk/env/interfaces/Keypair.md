[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/env](../README.md) / Keypair

# Interface: Keypair

Defined in: [crypto.ts:39](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/env/src/crypto.ts#L39)

`@suluk/env` — config + secrets as a single source of truth, made post-quantum-safe.

Declare each variable ONCE with defineEnv (typed, per-surface, secret-aware); encrypt secret VALUES with
ML-KEM-768 + AES-256-GCM so the .env is safe to commit to git and share over public channels; and project the
one declaration into every surface — local, Cloudflare, preview, a teammate's machine, the VS Code extension,
the admin panel. dotenvx's commit-safely model, quantum-safe, Suluk-native.

This entry is RUNTIME-AGNOSTIC (Web Crypto + @noble/post-quantum only — no node:fs), so it imports cleanly in
a Cloudflare Worker. Filesystem helpers + the CLI live in `@suluk/env/node`.

## Properties

### privateKey

> **privateKey**: `string`

Defined in: [crypto.ts:43](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/env/src/crypto.ts#L43)

`mlkem768:<base64>` — keep secret (.env.keys / a secret binding); it can DECRYPT.

***

### publicKey

> **publicKey**: `string`

Defined in: [crypto.ts:41](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/env/src/crypto.ts#L41)

`mlkem768:<base64>` — commit/share this; it can only ENCRYPT.
