[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / ClaimDb

# Interface: ClaimDb

Defined in: [cas.ts:21](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/drizzle/src/cas.ts#L21)

Minimal drizzle handle for a conditional update (bun:sqlite sync or D1 async — both awaited).

## Properties

### update

> **update**: (`table`) => `object`

Defined in: [cas.ts:21](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/drizzle/src/cas.ts#L21)

#### Parameters

##### table

`unknown`

#### Returns

`object`

##### set

> **set**: (`values`) => `object`

###### Parameters

###### values

`Record`\<`string`, `unknown`\>

###### Returns

`object`

###### where

> **where**: (`cond`) => `object`

###### Parameters

###### cond

`SQL`

###### Returns

`object`

###### returning

> **returning**: () => `unknown`

###### Returns

`unknown`

###### run

> **run**: () => `unknown`

###### Returns

`unknown`
