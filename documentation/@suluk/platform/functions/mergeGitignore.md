[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / mergeGitignore

# Function: mergeGitignore()

> **mergeGitignore**(`generated`, `existing`): `string`

Defined in: [plan.ts:480](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/platform/src/plan.ts#L480)

Merge the generated .gitignore into an existing one — APPEND any missing entries (never skip-if-present, so an app's
 minimal .gitignore can't leave `.env.keys`/`.env.temp` UNIGNORED and risk committing the private key). Dedup, preserve app
 entries. ENCRYPTED-ENV TRANSITION: if the new baseline ignores `.env.keys` (the private key) but NOT `.env`, a plaintext-era
 `.env` ignore is REMOVED — the .env is now COMMITTED with its values encrypted, so ignoring it is wrong (and safe to undo).

## Parameters

### generated

`string`

### existing

`string` \| `null`

## Returns

`string`
