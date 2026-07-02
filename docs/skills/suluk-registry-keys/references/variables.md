# Variables & Constants

## keys.service

### `KeysLive`
```ts
const KeysLive: any
```

## keys.schema

### `keyLineage`
The key-lineage schema (Suluk registry: `keys`) — re-exported from `@suluk/keys`, which owns the delegation-tree table
(the materialized path that makes the pooled-headroom cap + cascade revoke work). The `apikey` table itself is Better
Auth's (created by its apikey plugin in `auth`); this is only the lineage that hangs off it.
```ts
let keyLineage: any
```

## keys.provision

### `keysProvision`
```ts
const keysProvision: keyLineage[]
```

## keys.contract

### `keysOps`
```ts
const keysOps: ({ method: string; path: string; name: string; summary: string; tags: string[]; scopes: string[]; responses: { status: number; description: string }[]; request?: undefined } | { method: string; path: string; name: string; summary: string; tags: string[]; scopes: string[]; request: { json: ZodObject<{ userId: ZodString; parentKeyId: ZodOptional<ZodString>; parentCaps: ZodOptional<ZodObject<{ scopes: ZodArray<ZodString, "many">; creditLimit: ZodOptional<ZodNullable<(...)>>; rateLimitSharePct: ZodOptional<ZodNullable<(...)>>; expiresAt: ZodOptional<ZodNullable<(...)>> }, "strip", ZodTypeAny, { scopes: string[]; creditLimit?: number | null; rateLimitSharePct?: number | null; expiresAt?: number | null }, { scopes: string[]; creditLimit?: number | null; rateLimitSharePct?: number | null; expiresAt?: number | null }>>; requested: ZodObject<{ scopes: ZodArray<ZodString, "many">; creditLimit: ZodOptional<ZodNullable<ZodNumber>>; rateLimitSharePct: ZodOptional<ZodNullable<ZodNumber>>; expiresAt: ZodOptional<ZodNullable<ZodNumber>> }, "strip", ZodTypeAny, { scopes: string[]; creditLimit?: number | null; rateLimitSharePct?: number | null; expiresAt?: number | null }, { scopes: string[]; creditLimit?: number | null; rateLimitSharePct?: number | null; expiresAt?: number | null }> }, "strip", ZodTypeAny, { userId: string; requested: { scopes: string[]; creditLimit?: number | null; rateLimitSharePct?: number | null; expiresAt?: number | null }; parentKeyId?: string; parentCaps?: { scopes: string[]; creditLimit?: number | null; rateLimitSharePct?: number | null; expiresAt?: number | null } }, { userId: string; requested: { scopes: string[]; creditLimit?: number | null; rateLimitSharePct?: number | null; expiresAt?: number | null }; parentKeyId?: string; parentCaps?: { scopes: string[]; creditLimit?: number | null; rateLimitSharePct?: number | null; expiresAt?: number | null } }> }; responses: { status: number; description: string }[] })[]
```
