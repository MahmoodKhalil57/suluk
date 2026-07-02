[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/env](../README.md) / DefinedEnv

# Interface: DefinedEnv\<S\>

Defined in: [schema.ts:63](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/env/src/schema.ts#L63)

## Type Parameters

### S

`S` *extends* [`EnvSpec`](../type-aliases/EnvSpec.md)

## Properties

### keys

> **keys**: keyof `S` & `string`[]

Defined in: [schema.ts:65](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/env/src/schema.ts#L65)

***

### spec

> **spec**: `S`

Defined in: [schema.ts:64](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/env/src/schema.ts#L64)

## Methods

### assertEnv()

> **assertEnv**(`source?`, `opts?`): [`Parsed`](../type-aliases/Parsed.md)\<`S`\>

Defined in: [schema.ts:74](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/env/src/schema.ts#L74)

FAIL-CLOSED gate: throw on any error-severity issue (warnings go to onWarn); else return the parsed config.
 Call at startup so a misconfigured/short/test secret in prod stops the process instead of shipping.

#### Parameters

##### source?

`Record`\<`string`, `string` \| `undefined`\>

##### opts?

[`AssertOptions`](AssertOptions.md)

#### Returns

[`Parsed`](../type-aliases/Parsed.md)\<`S`\>

***

### forSurface()

> **forSurface**(`surface`): keyof `S` & `string`[]

Defined in: [schema.ts:69](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/env/src/schema.ts#L69)

the var names a given surface needs (for the deploy planner / vscode).

#### Parameters

##### surface

[`Surface`](../type-aliases/Surface.md)

#### Returns

keyof `S` & `string`[]

***

### manifest()

> **manifest**(`raw?`, `runtime?`): [`ManifestEntry`](ManifestEntry.md)[]

Defined in: [schema.ts:79](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/env/src/schema.ts#L79)

config health, computed from the RAW .env record (raw = parseEnv(fileContent), so secret values are still
encrypted tokens). Pass the runtime env too if you want presence to also count vars set outside the file.

#### Parameters

##### raw?

`Record`\<`string`, `string` \| `undefined`\>

##### runtime?

`Record`\<`string`, `string` \| `undefined`\>

#### Returns

[`ManifestEntry`](ManifestEntry.md)[]

***

### parse()

> **parse**(`source?`): [`Parsed`](../type-aliases/Parsed.md)\<`S`\>

Defined in: [schema.ts:67](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/env/src/schema.ts#L67)

validate a source (process.env or a parsed .env), apply defaults, throw on a missing required var.

#### Parameters

##### source?

`Record`\<`string`, `string` \| `undefined`\>

#### Returns

[`Parsed`](../type-aliases/Parsed.md)\<`S`\>

***

### validate()

> **validate**(`source?`, `opts?`): [`EnvIssue`](EnvIssue.md)[]

Defined in: [schema.ts:71](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/env/src/schema.ts#L71)

validate VALUES (presence incl. requiredInSurface, minLength, pattern, forbidInSurface) → a graded issue list.

#### Parameters

##### source?

`Record`\<`string`, `string` \| `undefined`\>

##### opts?

[`AssertOptions`](AssertOptions.md)

#### Returns

[`EnvIssue`](EnvIssue.md)[]
