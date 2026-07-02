# Variables & Constants

## `SCALAR_VERSION`
We OWN this version (the fork's first act): pin instead of riding `@latest`, so the UI never drifts under us.
```ts
const SCALAR_VERSION: "1.59.0"
```

## `SULUK_FORK_STANDALONE_VERSION`
The PINNED suluk-forked Scalar standalone (Scalar + the v4 patch-set), published as `@suluk/scalar-standalone` and
served from jsdelivr-npm. This is what makes the native-v4 view (`scalarV4Response`) work OUT OF THE BOX: vanilla
Scalar can't project v4 `requests`→operations, so a consumer who left `cdn` defaulted to `DEFAULT_CDN` (vanilla)
saw only Models. `scalarV4Html` now defaults to THIS fork instead. Override `opts.cdn` to self-host the bytes
(e.g. local-first: serve the bundle from your own origin) — the previous behaviour for those who want no CDN.
```ts
const SULUK_FORK_STANDALONE_VERSION: "0.1.0"
```

## `SULUK_FORK_CDN`
```ts
const SULUK_FORK_CDN: "https://cdn.jsdelivr.net/npm/@suluk/scalar-standalone@0.1.0/dist/standalone-suluk.js"
```
