---
description: "Config + secrets as a single source of truth: declare each env var ONCE (typed, per-surface), encrypt secret values with POST-QUANTUM crypto (ML-KEM-768 + AES-256-GCM) so the .env is safe to commit to git and share over public channels, and project the manifest into every surface — local, Cloudflare, preview, a teammate's machine, the VS Code extension, the admin panel. dotenvx's commit-safely model, quantum-safe, Suluk-native. CANDIDATE tooling."
name: suluk-env
---

# @suluk/env

Config + secrets as a single source of truth: declare each env var ONCE (typed, per-surface), encrypt secret values with POST-QUANTUM crypto (ML-KEM-768 + AES-256-GCM) so the .env is safe to commit to git and share over public channels, and project the manifest into every surface — local, Cloudflare, preview, a teammate's machine, the VS Code extension, the admin panel. dotenvx's commit-safely model, quantum-safe, Suluk-native. CANDIDATE tooling.

## Configuration

2 configuration interfaces — see references/config.md for details.

## Quick Reference

**crypto:** `keygen` (Generate an ML-KEM-768 keypair), `encrypt` (Seal a plaintext value to a public key → an `encrypted:mlkem768:…` token), `decrypt` (Open an `encrypted:mlkem768:…` token with the private key), `isEncrypted` (Is this value an `encrypted:…` token (vs plaintext)), `publicFromPrivate` (Derive the public key string from a private key (so `set`/`encrypt` work given only the secret)), `Keypair` (`@suluk/env` — config + secrets as a single source of truth, made post-quantum-safe), `SCHEME` (The cipher/key scheme tag embedded in keys + tokens)
**envfile:** `parseEnv` (Parse ), `resolveEnv` (Resolve ), `encryptContent` (Encrypt every plaintext value in the content to `publicKey`, leaving already-encrypted values + the key vars +
comments untouched, and ensuring the SULUK_PUBLIC_KEY line is present), `decryptContent` (Decrypt every encrypted value in the content with `privateKey` → plaintext file content (for inspection)), `PUBLIC_KEY_NAME`, `PRIVATE_KEY_NAME`
**load:** `loadEnv` (Resolve + inject)
**schema:** `defineEnv`, `EnvSpec`, `VarSpec`, `Surface`, `DefinedEnv`, `ManifestEntry`, `HealthStatus`, `Parsed`, `EnvIssue`, `IssueSeverity`

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)