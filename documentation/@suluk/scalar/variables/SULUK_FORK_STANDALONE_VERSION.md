[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/scalar](../README.md) / SULUK\_FORK\_STANDALONE\_VERSION

# Variable: SULUK\_FORK\_STANDALONE\_VERSION

> `const` **SULUK\_FORK\_STANDALONE\_VERSION**: `"0.1.0"` = `"0.1.0"`

Defined in: [index.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/scalar/src/index.ts#L29)

The PINNED suluk-forked Scalar standalone (Scalar + the v4 patch-set), published as `@suluk/scalar-standalone` and
served from jsdelivr-npm. This is what makes the native-v4 view (`scalarV4Response`) work OUT OF THE BOX: vanilla
Scalar can't project v4 `requests`→operations, so a consumer who left `cdn` defaulted to `DEFAULT_CDN` (vanilla)
saw only Models. `scalarV4Html` now defaults to THIS fork instead. Override `opts.cdn` to self-host the bytes
(e.g. local-first: serve the bundle from your own origin) — the previous behaviour for those who want no CDN.
