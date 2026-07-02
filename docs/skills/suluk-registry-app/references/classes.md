# Classes

## app

### `Db`
The database as an Effect service — every feature service depends on it; the app provides it per-request from the
 D1 binding, so services never reach for a global.
*extends `any`*
```ts
constructor(): Db
```
