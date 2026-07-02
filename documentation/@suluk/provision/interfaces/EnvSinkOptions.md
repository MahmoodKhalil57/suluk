[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / EnvSinkOptions

# Interface: EnvSinkOptions

Defined in: [provision/src/env-sink.ts:13](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/provision/src/env-sink.ts#L13)

## Extends

- `Omit`\<`SetVarOpts`, `"plain"`\>

## Properties

### envPath?

> `optional` **envPath?**: `string`

Defined in: [env/src/node.ts:12](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/env/src/node.ts#L12)

#### Inherited from

`Omit.envPath`

***

### keysPath?

> `optional` **keysPath?**: `string`

Defined in: [env/src/node.ts:12](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/env/src/node.ts#L12)

#### Inherited from

`Omit.keysPath`

***

### plain?

> `optional` **plain?**: (`envVar`) => `boolean`

Defined in: [provision/src/env-sink.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/provision/src/env-sink.ts#L15)

predicate: which env vars are written PLAINTEXT (non-secret). Default: none — every binding is encrypted.

#### Parameters

##### envVar

`string`

#### Returns

`boolean`
