[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / SulukModule

# Interface: SulukModule

Defined in: [builder/src/module.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/builder/src/module.ts#L23)

## Properties

### cost?

> `optional` **cost?**: `Record`\<`string`, [`ModuleCost`](../../builder/interfaces/ModuleCost.md)\>

Defined in: [builder/src/module.ts:37](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/builder/src/module.ts#L37)

x-suluk-cost per operation name (e.g. createOrder).

***

### crud?

> `optional` **crud?**: `boolean`

Defined in: [builder/src/module.ts:35](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/builder/src/module.ts#L35)

Auto-generate CRUD operations for each provided entity (default true).

***

### name

> **name**: `string`

Defined in: [builder/src/module.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/builder/src/module.ts#L24)

***

### paths?

> `optional` **paths?**: `Record`\<`string`, [`PathItem`](../../core/interfaces/PathItem.md)\>

Defined in: [builder/src/module.ts:33](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/builder/src/module.ts#L33)

Explicit operations beyond the auto-CRUD (e.g. checkout); keyed by v4 path.

***

### providerSlots?

> `optional` **providerSlots?**: `Record`\<`string`, `string`\>

Defined in: [builder/src/module.ts:41](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/builder/src/module.ts#L41)

Declared provider slots a developer can swap (e.g. { payments: "stripe" }).

***

### provides

> **provides**: `string`[]

Defined in: [builder/src/module.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/builder/src/module.ts#L27)

Entity names this module OWNS (each must have a schema in `schemas`).

***

### requires?

> `optional` **requires?**: `string`[]

Defined in: [builder/src/module.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/builder/src/module.ts#L29)

Entity names this module REFERENCES but does not own — must already be present at install time.

***

### schemas

> **schemas**: `Record`\<`string`, [`SchemaOrRef`](../../core/type-aliases/SchemaOrRef.md)\>

Defined in: [builder/src/module.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/builder/src/module.ts#L31)

components.schemas fragment (the provided entities; may $ref a required entity like User).

***

### securitySchemes?

> `optional` **securitySchemes?**: `Record`\<`string`, `unknown`\>

Defined in: [builder/src/module.ts:39](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/builder/src/module.ts#L39)

securitySchemes to merge.

***

### version

> **version**: `string`

Defined in: [builder/src/module.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/builder/src/module.ts#L25)
