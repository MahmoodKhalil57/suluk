[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / AppSpec

# Interface: AppSpec

Defined in: [fullstack.ts:104](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/builder/src/fullstack.ts#L104)

## Properties

### baseUrl?

> `optional` **baseUrl?**: `string`

Defined in: [fullstack.ts:109](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/builder/src/fullstack.ts#L109)

***

### entities

> **entities**: [`Entity`](Entity.md)[]

Defined in: [fullstack.ts:105](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/builder/src/fullstack.ts#L105)

***

### info?

> `optional` **info?**: `object`

Defined in: [fullstack.ts:108](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/builder/src/fullstack.ts#L108)

#### title?

> `optional` **title?**: `string`

#### version?

> `optional` **version?**: `string`

***

### pages?

> `optional` **pages?**: [`DslDocument`](DslDocument.md)[]

Defined in: [fullstack.ts:107](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/builder/src/fullstack.ts#L107)

Optional explicit pages; if omitted, one "App" page composing every entity's CRUD section is generated.
