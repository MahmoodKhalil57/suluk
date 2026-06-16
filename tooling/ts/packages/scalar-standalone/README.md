# @suluk/scalar-standalone

The **suluk-forked Scalar API Reference** standalone bundle — vanilla Scalar `@scalar/api-reference@1.59.0` plus the
suluk OpenAPI **v4** patch-set (see `@suluk/scalar`'s `FORK.md`):

- `0003` native v4 ingest — `projectV4ToStore` maps `paths[uri].requests` (keyed by name) → method-keyed ops at the
  parser boundary, so Scalar renders v4 operations natively (version badge reads `OpenAPI 4.0.0-candidate`);
- `0006` multi-request-per-method — the one v4 capability a 3.1 view can't express;
- `0001` v4 facet content panel + `0007` subtle badges — cost/access facets in Scalar's own chrome.

This package ships **only the built browser bundle** (`dist/standalone-suluk.js`, ~3.6 MB, self-contained). It exists
so the bundle has a **stable, versioned, jsdelivr-npm URL**:

```
https://cdn.jsdelivr.net/npm/@suluk/scalar-standalone@<version>/dist/standalone-suluk.js
```

You normally don't depend on this directly — **`@suluk/scalar`** points its native-v4 renderer (`scalarV4Response`)
at this URL by default, so native v4 works out of the box. Rebuilt by `tooling/ts/scalar-fork/build.sh`.
