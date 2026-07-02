[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/deploy](../README.md) / DeployInput

# Interface: DeployInput

Defined in: [types.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/deploy/src/types.ts#L31)

`@suluk/deploy` — ship a Suluk app behind a SWAPPABLE target interface. A DeployProvider turns the app into
the files + ordered steps that deploy it; the host (the vscode extension) runs the steps in a terminal
after the user authenticates. Cloudflare is the first provider (Workers + D1 + static assets) — an adapter,
since the stack is already Cloudflare-native (Hono=Workers, sqlite-core=D1, frontend=assets). CANDIDATE.

## Properties

### appModule?

> `optional` **appModule?**: `string`

Defined in: [types.ts:37](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/deploy/src/types.ts#L37)

Path, in the user's project, to the module exporting the Hono `app` (default "./src/app").

***

### assetsDir?

> `optional` **assetsDir?**: `string`

Defined in: [types.ts:39](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/deploy/src/types.ts#L39)

Built frontend assets directory served as static files (default "./dist/client").

***

### compatibilityDate?

> `optional` **compatibilityDate?**: `string`

Defined in: [types.ts:41](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/deploy/src/types.ts#L41)

Worker runtime compatibility date (default DEFAULT_COMPAT_DATE). Pass today's date in production.

***

### durableObjectMigrationTag?

> `optional` **durableObjectMigrationTag?**: `string`

Defined in: [types.ts:64](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/deploy/src/types.ts#L64)

the migration tag for the DO classes above. Default "v1" on first deploy, "v2" when `prevDurableObjects` is given.

***

### durableObjects?

> `optional` **durableObjects?**: [`DurableObjectBinding`](DurableObjectBinding.md)[]

Defined in: [types.ts:54](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/deploy/src/types.ts#L54)

Durable Object classes to bind + migrate (the Cloudflare Agents SDK runtime surface). When present, the
generated wrangler.jsonc gains a `durable_objects.bindings` block and an additive `migrations` entry that
creates the SQLite-backed classes. Same-script classes only are migrated; a cross-script class (with
`scriptName`) is bound but migrated by its OWNING script. Empty/absent ⇒ no DO output (unchanged plan).

***

### entities

> **entities**: [`DeployEntity`](DeployEntity.md)[]

Defined in: [types.ts:35](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/deploy/src/types.ts#L35)

The data entities (for the database schema).

***

### name

> **name**: `string`

Defined in: [types.ts:33](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/deploy/src/types.ts#L33)

App name (slugified by the provider for resource names).

***

### prevDurableObjectMigrationTag?

> `optional` **prevDurableObjectMigrationTag?**: `string`

Defined in: [types.ts:66](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/deploy/src/types.ts#L66)

the tag the `prevDurableObjects` set was created under (default "v1") — the first step of the reconstructed history.

***

### prevDurableObjects?

> `optional` **prevDurableObjects?**: [`DurableObjectBinding`](DurableObjectBinding.md)[]

Defined in: [types.ts:62](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/deploy/src/types.ts#L62)

The previously-deployed DO class set. When given, the generated `migrations` become an ADDITIVE 2-step history
(recreate prev under `prevDurableObjectMigrationTag`, then create only the classes added since under the new tag)
instead of a from-scratch first-deploy entry; a removed class is flagged in `notes` (never auto-dropped), and a
class that changed storage backend (sqlite↔legacy) throws. Omit on a first deploy. NB this reconstructs at most a
2-step history — beyond one evolution the user owns the append-only `migrations` array.

***

### preview?

> `optional` **preview?**: `boolean`

Defined in: [types.ts:45](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/deploy/src/types.ts#L45)

Emit a PREVIEW deployment variant (charter-bounded role-preview): a `${slug}-preview` Worker with the
 two fail-closed locks — a `SULUK_PREVIEW="1"` var + a `PREVIEW_DB` D1 binding on an isolated
 `${slug}-preview-db` — plus a seed.sql with one throwaway demo user per role. Prod plans never set these.

***

### previewRoles?

> `optional` **previewRoles?**: `string`[]

Defined in: [types.ts:47](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/deploy/src/types.ts#L47)

The roles to seed for a preview deployment (from the contract's User.role enum; cockpit threads them in).
