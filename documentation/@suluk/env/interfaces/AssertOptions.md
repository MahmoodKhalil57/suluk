[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/env](../README.md) / AssertOptions

# Interface: AssertOptions

Defined in: [schema.ts:43](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/env/src/schema.ts#L43)

## Properties

### allow?

> `optional` **allow?**: `string`[]

Defined in: [schema.ts:47](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/env/src/schema.ts#L47)

var names whose ERRORS are downgraded to allowed (an explicit, auditable override).

***

### onWarn?

> `optional` **onWarn?**: (`issue`) => `void`

Defined in: [schema.ts:49](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/env/src/schema.ts#L49)

called once per warning (e.g. console.warn) — assertEnv never throws on warnings.

#### Parameters

##### issue

[`EnvIssue`](EnvIssue.md)

#### Returns

`void`

***

### surface?

> `optional` **surface?**: [`Surface`](../type-aliases/Surface.md)

Defined in: [schema.ts:45](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/env/src/schema.ts#L45)

the surface being validated (gates requiredInSurface + forbidInSurface).
