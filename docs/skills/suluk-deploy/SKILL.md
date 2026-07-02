---
description: "Deploy a Suluk app behind a SWAPPABLE target interface. Cloudflare is the first provider (Workers + D1 + static assets) — an adapter, since the stack is already Cloudflare-native. CANDIDATE tooling."
name: suluk-deploy
---

# @suluk/deploy

Deploy a Suluk app behind a SWAPPABLE target interface. Cloudflare is the first provider (Workers + D1 + static assets) — an adapter, since the stack is already Cloudflare-native. CANDIDATE tooling.

## Quick Start

```ts
import { cloudflare, type DeployInput } from "@suluk/deploy";
import { zodToV4 } from "@suluk/zod";
import * as z from "zod";

const input: DeployInput = {
  name: "My Petshop",                 // slugified for resource names → "my-petshop"
  appModule: "./src/app",             // module exporting your Hono `app` (default "./src/app")
  assetsDir: "./dist/client",         // built frontend, served as static assets (default "./dist/client")
  entities: [
    { name: "Pet", schema: zodToV4(z.object({
        id: z.number().int().optional(), name: z.string(),
        status: z.enum(["available", "sold"]), price: z.number(),
      })).schema },
    { name: "Category", schema: zodToV4(z.object({ id: z.number().int().optional(), name: z.string() })).schema },
  ],
};

const plan = cloudflare.generate(input);

plan.files;   // [{ path: "wrangler.jsonc", content }, { path: "worker.ts", … }, { path: "schema.sql", … }]
plan.steps;   // ordered: wrangler login → d1 create → d1 execute schema.sql → wrangler deploy
plan.notes;   // human-facing caveats (auth-in-terminal, the database_id fill-in, swappable-by-design)

// The host writes plan.files into the project, then runs plan.steps in a terminal:
for (const f of plan.files) await Bun.write(f.path, f.content);
for (const s of plan.steps) console.log(`# ${s.note}\n${s.cmd}`);
```

## Quick Reference

**sql:** `schemaToSql` (A full schema), `createTable` (CREATE TABLE for one entity (or a manual-define comment for a $ref/boolean schema)), `entityColumns` (The columns of an entity, in DDL order (id is a synthesized autoincrement PK when absent)), `columnDdl` (The DDL fragment for one column), `tableName` (The SQLite table name for an entity), `ColumnDef` (One column, structured — shared by the full-schema emitter and the migration-delta)
**migrate:** `migrationSql` (The SQL to migrate from `prev` entities to `next` entities — additive only)
**secrets:** `secretPushPlan` (The steps to push the named secrets to a Worker), `durableBindings` (The durable bindings a contract needs, derived from its facets: a rate-limit budget (x-suluk-ratelimit) needs a
KV counter store; a declared cost (x-suluk-cost) needs a KV sink), `SecretPushPlan`, `BindingPlan`, `DurableBinding`
**storage:** `r2Storage` (Cloudflare R2 storage (the reference StorageProvider)), `memoryStorage` (A DEV in-memory storage (per-process; not durable) — the swap default for local/tests, never production), `StorageProvider` (The swappable storage binding (the builder `storage` slot)), `StoredObject` (A stored object — its key + the public URL to reach it), `R2BucketLike` (The minimal Workers R2 surface this binding calls — satisfied by the real `R2Bucket` and by a mock)
**types:** `DeployProvider` (A deployment target), `DeployPlan` (`@suluk/deploy` — ship a Suluk app behind a SWAPPABLE target interface), `DeployInput` (`@suluk/deploy` — ship a Suluk app behind a SWAPPABLE target interface), `DeployEntity` (`@suluk/deploy` — ship a Suluk app behind a SWAPPABLE target interface), `DeployFile` (A file the provider wants written into the project), `DeployStep` (One ordered shell step the host (the vscode extension) runs in a terminal AFTER the user authenticates), `DurableObjectBinding` (A Durable Object class to bind + migrate)
`providers` (The provider registry)
**cloudflare:** `cloudflare` (The Cloudflare deployment provider), `DEFAULT_COMPAT_DATE`

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)