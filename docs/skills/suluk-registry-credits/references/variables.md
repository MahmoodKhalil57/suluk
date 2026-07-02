# Variables & Constants

## credits.service

### `CreditsLive`
```ts
const CreditsLive: any
```

## credits.schema

### `creditTransaction`
The credit-ledger schema (Suluk registry: `credits`) — re-exported from `@suluk/credits`, which OWNS the table
definitions (the append-only `credit_transaction` + the `credit_amount`/`credit_key` sidecars). Your drizzle config +
migrations import from here; the definitions stay upstream so a schema change ships as a package update, not a manual
edit. `userId` is a plain column — add the FK to your `user` table in your migration if you want the cascade.
```ts
let creditTransaction: any
```

## credits.provision

### `creditsProvision`
```ts
const creditsProvision: creditTransaction[]
```

## credits.contract

### `creditsOps`
```ts
const creditsOps: ({ method: string; path: string; name: string; summary: string; tags: string[]; scopes: string[]; responses: { status: number; description: string }[]; errors?: undefined; request?: undefined } | { method: string; path: string; name: string; summary: string; tags: string[]; scopes: string[]; errors: number[]; request: { json: ZodObject<{ userId: ZodString; amount: ZodNumber; reason: ZodOptional<ZodString> }, "strip", ZodTypeAny, { userId: string; amount: number; reason?: string }, { userId: string; amount: number; reason?: string }> }; responses: { status: number; description: string }[] } | { method: string; path: string; name: string; summary: string; tags: string[]; scopes: string[]; request: { json: ZodObject<{ userId: ZodString; amount: ZodNumber; idemKey: ZodString; reason: ZodOptional<ZodString> }, "strip", ZodTypeAny, { userId: string; amount: number; idemKey: string; reason?: string }, { userId: string; amount: number; idemKey: string; reason?: string }> }; responses: { status: number; description: string }[]; errors?: undefined })[]
```
