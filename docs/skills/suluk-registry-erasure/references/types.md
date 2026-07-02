# Types & Enums

## erasure.service

### `ErasureUser`
The minimal user shape the cascade needs (Better Auth passes the full user; we only read the id).

### `ExtraSteps`
A factory that, given the request `db`, builds the per-module erase-steps — COMPOSED by the generator from each installed
 data module's `eraseStep` capability (platform.config.ts wires `erasure.cascade → <module>.eraseStep`, leaf-first).
```ts
(db: step) => step<ErasureUser>[]
```
