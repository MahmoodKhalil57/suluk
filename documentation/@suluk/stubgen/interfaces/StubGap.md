[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/stubgen](../README.md) / StubGap

# Interface: StubGap

Defined in: [index.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/stubgen/src/index.ts#L26)

The input: a gap the contract cannot back, optionally with the Examples columns that hint the request shape.

## Properties

### fields?

> `optional` **fields?**: `object`[]

Defined in: [index.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/stubgen/src/index.ts#L30)

the Examples columns (request field names) + an optional sample cell for type inference.

#### name

> **name**: `string`

#### sample?

> `optional` **sample?**: `string`

***

### intent

> **intent**: `string`

Defined in: [index.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/stubgen/src/index.ts#L28)

the authored intent — the When step text, e.g. "I refund a charge".

***

### method?

> `optional` **method?**: `string`

Defined in: [index.ts:33](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/stubgen/src/index.ts#L33)

***

### name?

> `optional` **name?**: `string`

Defined in: [index.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/stubgen/src/index.ts#L32)

explicit overrides (else inferred from `intent`).

***

### path?

> `optional` **path?**: `string`

Defined in: [index.ts:34](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/stubgen/src/index.ts#L34)
