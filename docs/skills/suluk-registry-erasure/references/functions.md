# Functions

## erasure.service

### `sulukCascade`
The default hard-DELETE cascade over the core Suluk tables — EDIT to match the modules you installed + your posture.
Every core table keys on `userId`. Swap a `del(...)` for an `anonymizeStep` where an FK must survive. Ordered
leaf-first (logs/cost before the money rows) so a partial failure aborts before the load-bearing rows are touched.
```ts
sulukCascade(db: DrizzleD1Database): CascadeStep<ErasureUser>[]
```
**Parameters:**
- `db: DrizzleD1Database`
**Returns:** `CascadeStep<ErasureUser>[]`

### `erasureHook`
The Better Auth `user.deleteUser.beforeDelete` hook — pass it to `buildAuth`'s `deleteUser.beforeDelete` so the cascade
fires whenever a user is deleted THROUGH auth (the proper integration). The service's `erase` is the manual/admin path.
```ts
erasureHook(db: DrizzleD1Database, opts?: any): (user: ErasureUser) => Promise<void>
```
**Parameters:**
- `db: DrizzleD1Database`
- `opts: any` (optional)
**Returns:** `(user: ErasureUser) => Promise<void>`

## erasure.routes

### `erasureRoutes`
```ts
erasureRoutes(): any
```
**Returns:** `any`
