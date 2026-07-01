[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/env](../README.md) / AssertOptions

# Interface: AssertOptions

Defined in: [schema.ts:43](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/env/src/schema.ts#L43)

## Properties

### allow?

> `optional` **allow?**: `string`[]

Defined in: [schema.ts:47](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/env/src/schema.ts#L47)

var names whose ERRORS are downgraded to allowed (an explicit, auditable override).

***

### onWarn?

> `optional` **onWarn?**: (`issue`) => `void`

Defined in: [schema.ts:49](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/env/src/schema.ts#L49)

called once per warning (e.g. console.warn) — assertEnv never throws on warnings.

#### Parameters

##### issue

[`EnvIssue`](EnvIssue.md)

#### Returns

`void`

***

### surface?

> `optional` **surface?**: [`Surface`](../type-aliases/Surface.md)

Defined in: [schema.ts:45](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/env/src/schema.ts#L45)

the surface being validated (gates requiredInSurface + forbidInSurface).
