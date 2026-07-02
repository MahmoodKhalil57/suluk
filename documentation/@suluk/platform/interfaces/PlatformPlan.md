[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / PlatformPlan

# Interface: PlatformPlan

Defined in: [plan.ts:11](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/plan.ts#L11)

## Properties

### adds

> **adds**: `string`[]

Defined in: [plan.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/plan.ts#L14)

shadcn refs to add, in order (e.g. "MahmoodKhalil57/suluk/credits").

***

### componentsJson

> **componentsJson**: `string`

Defined in: [plan.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/plan.ts#L25)

the generated `components.json` content (so `shadcn add` resolves the file targets).

***

### devEntry?

> `optional` **devEntry?**: `string`

Defined in: [plan.ts:54](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/plan.ts#L54)

the generated `src/dev.ts` — the bun MOCK-PROVIDER dev server (bun:sqlite DB + JSON KV + mocked providers when keys
 absent). Present ONLY when the manifest sets `local: true`; undefined otherwise (so the golden path is unchanged).

***

### entry

> **entry**: `string`

Defined in: [plan.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/plan.ts#L16)

the generated `src/index.ts` content.

***

### envCheck

> **envCheck**: `string`

Defined in: [plan.ts:33](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/plan.ts#L33)

the generated `scripts/env-check.ts` — the encrypted-env preflight (keypair present? required secrets set + encrypted?).

***

### envExample

> **envExample**: `string`

Defined in: [plan.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/plan.ts#L27)

the generated `.env.example` — the SECRET keys the selected services need (non-secrets live in the manifest `vars`).

***

### envScaffold

> **envScaffold**: `string`

Defined in: [plan.ts:51](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/plan.ts#L51)

the generated `.env` SCAFFOLD (committed) — a header + the setup steps, NO values. `generate` writes it only if absent
 (never clobbering the operator's encrypted secrets). Secret VALUES are added encrypted via `suluk-env set`.

***

### envTemp

> **envTemp**: `string`

Defined in: [plan.ts:43](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/plan.ts#L43)

the generated `.env.temp` SCAFFOLD — the PLAINTEXT bootstrap for `bun run provision` (gitignored; consumed + deleted).

***

### envTs

> **envTs**: `string`

Defined in: [plan.ts:35](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/plan.ts#L35)

the generated `src/env.ts` — the @suluk/env `defineEnv` declaration (declare-once: the app's secrets, surfaced).

***

### gitignore

> **gitignore**: `string`

Defined in: [plan.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/plan.ts#L31)

the generated `.gitignore` — ignores `.env.keys` (the private key) + `.env.temp`, but NOT `.env` (committed ENCRYPTED).

***

### linkKey

> **linkKey**: `string`

Defined in: [plan.ts:41](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/plan.ts#L41)

the generated `scripts/link-key.ts` — register the private key into the centralized `~/.suluk/settings.json` (the store
 `@suluk/env` reads by default for local dev/deploy/CI), the toolfactory model.

***

### mintTokens

> **mintTokens**: `string`

Defined in: [plan.ts:48](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/plan.ts#L48)

the generated `scripts/mint-tokens.ts` — mint scoped least-privilege CF tokens from the master, encrypted into `.env`.

***

### packageJson

> **packageJson**: `string`

Defined in: [plan.ts:21](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/plan.ts#L21)

the generated `package.json` content (the FRAMEWORK baseline — `generate` merges it with any existing so app-added
 deps/scripts survive). @suluk/* on "latest" so fixes flow via `bun update`; ecosystem deps on pinned ranges.

***

### provisionConfig

> **provisionConfig**: `string`

Defined in: [plan.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/plan.ts#L18)

the generated `provision.config.ts` content.

***

### provisionScript

> **provisionScript**: `string`

Defined in: [plan.ts:46](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/plan.ts#L46)

the generated `scripts/provision.ts` — the credential lifecycle: source `.env.temp`/`.env` → provision → mint scoped
 tokens → encrypt keepers → DELETE the ephemeral master token → stage the encrypted `.env`.

***

### purgeScript?

> `optional` **purgeScript?**: `string`

Defined in: [plan.ts:57](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/plan.ts#L57)

the generated `scripts/purge-state.ts` — clears dev/live state (recommended on a mock↔real swap or a provision
 migration). Present ONLY when `local: true`.

***

### services

> **services**: `string`[]

Defined in: [plan.ts:12](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/plan.ts#L12)

***

### syncSecrets

> **syncSecrets**: `string`

Defined in: [plan.ts:38](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/plan.ts#L38)

the generated `scripts/sync-secrets.ts` — decrypt the cloudflare-surfaced secrets from the committed .env and push them
 as `wrangler secret`s (the toolfactory-exact deploy path; the alternative is the entry's runtime `loadEnv`).

***

### tsconfig

> **tsconfig**: `string`

Defined in: [plan.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/plan.ts#L23)

the generated `tsconfig.json` content (the Workers + TS config; test files excluded from the build).

***

### wranglerToml

> **wranglerToml**: `string`

Defined in: [plan.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/plan.ts#L29)

the generated `wrangler.toml` — `[vars]` from the manifest's non-secret config + the D1/KV binding placeholders.
