[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/harden](../README.md) / ReadinessOptions

# Interface: ReadinessOptions

Defined in: [readiness.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/harden/src/readiness.ts#L25)

## Properties

### ignore?

> `optional` **ignore?**: (`uri`, `name`) => `boolean`

Defined in: [readiness.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/harden/src/readiness.ts#L27)

skip operations (e.g. third-party/ingested surfaces) — they don't count toward the readiness grade.

#### Parameters

##### uri

`string`

##### name

`string`

#### Returns

`boolean`
