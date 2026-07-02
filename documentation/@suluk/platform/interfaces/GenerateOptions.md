[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / GenerateOptions

# Interface: GenerateOptions

Defined in: [generate.ts:10](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/platform/src/generate.ts#L10)

## Properties

### log?

> `optional` **log?**: (`msg`) => `void`

Defined in: [generate.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/platform/src/generate.ts#L19)

#### Parameters

##### msg

`string`

#### Returns

`void`

***

### read?

> `optional` **read?**: (`path`) => `Promise`\<`string` \| `null`\>

Defined in: [generate.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/platform/src/generate.ts#L18)

read a file (null when absent) — used to MERGE the generated package.json with the app's existing one (so app-added
 deps/scripts survive a regenerate) and to leave an existing tsconfig/components.json untouched. Optional: without it,
 the config files are written as the fresh baseline.

#### Parameters

##### path

`string`

#### Returns

`Promise`\<`string` \| `null`\>

***

### run

> **run**: (`cmd`, `args`) => `Promise`\<`void`\>

Defined in: [generate.ts:12](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/platform/src/generate.ts#L12)

run a command — the CLI spawns `bunx shadcn add <ref>`; a test records.

#### Parameters

##### cmd

`string`

##### args

`string`[]

#### Returns

`Promise`\<`void`\>

***

### write

> **write**: (`path`, `content`) => `Promise`\<`void`\>

Defined in: [generate.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/platform/src/generate.ts#L14)

write a file (path relative to the target cwd).

#### Parameters

##### path

`string`

##### content

`string`

#### Returns

`Promise`\<`void`\>
