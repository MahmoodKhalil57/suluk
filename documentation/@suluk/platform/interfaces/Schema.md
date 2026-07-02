[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / Schema

# Interface: Schema\<Out\>

Defined in: [service.ts:62](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/service.ts#L62)

Standard-Schema v1 shape (zod v4 implements it). Declared LOCALLY so the Service interface can carry the typed-opts slots
with NO runtime validator dependency in Phase 1; Phase 2 replaces this with `@standard-schema/spec` and populates
`serviceOpts`/`brandOpts` with real zod schemas (zod as a peerDependency). `Out` carries the inferred value type.

## Type Parameters

### Out

`Out` = `unknown`

## Properties

### ~standard

> `readonly` **~standard**: `object`

Defined in: [service.ts:63](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/service.ts#L63)

#### validate

> `readonly` **validate**: (`value`) => \{ `value`: `Out`; \} \| \{ `issues`: readonly `unknown`[]; \} \| `Promise`\<`unknown`\>

##### Parameters

###### value

`unknown`

##### Returns

\{ `value`: `Out`; \} \| \{ `issues`: readonly `unknown`[]; \} \| `Promise`\<`unknown`\>

#### vendor

> `readonly` **vendor**: `string`

#### version

> `readonly` **version**: `1`
