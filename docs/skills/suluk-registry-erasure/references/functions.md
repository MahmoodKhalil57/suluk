# Functions

## erasure.service

### `sulukCascade`
The default cascade is now EMPTY — the steps are DISTRIBUTED: each installed data module OWNS its own `eraseStep` (over
ITS table) and the generator composes only the installed ones into `extraSteps` (no central table list → a subset never
DELETEs a table it didn't install, and a GDPR build-guard warns if an installed module isn't wired). Kept for a manual/
community cascade an author writes by hand (`step`/`deleteStep`/`anonymizeStep` are re-exported above).
```ts
sulukCascade(_db: DrizzleD1Database): CascadeStep<ErasureUser>[]
```
**Parameters:**
- `_db: DrizzleD1Database`
**Returns:** `CascadeStep<ErasureUser>[]`

### `erasureHook`
The Better Auth `user.deleteUser.beforeDelete` hook — pass it to `buildAuth`'s `deleteUser.beforeDelete` so the cascade
fires whenever a user is deleted THROUGH auth. Thread the COMPOSED `extraSteps` (the same the admin route uses).
```ts
erasureHook(db: DrizzleD1Database, opts?: any, extraSteps?: ExtraSteps): (user: ErasureUser) => Promise<void>
```
**Parameters:**
- `db: DrizzleD1Database`
- `opts: any` (optional)
- `extraSteps: ExtraSteps` (optional)
**Returns:** `(user: ErasureUser) => Promise<void>`

### `ErasureLive`
ErasureLive is a FACTORY — pass the COMPOSED `extraSteps` (the generator wires them from each installed data module's
 `eraseStep`). Omit → the empty cascade (a manual author supplies steps directly, or a subset erases nothing extra).
```ts
ErasureLive(extraSteps?: ExtraSteps): any
```
**Parameters:**
- `extraSteps: ExtraSteps` (optional)
**Returns:** `any`

## erasure.routes

### `erasureRoutes`
```ts
erasureRoutes(opts?: MountErasureOptions): any
```
**Parameters:**
- `opts: MountErasureOptions` (optional)
**Returns:** `any`
