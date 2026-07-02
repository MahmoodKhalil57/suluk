[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/env](../README.md) / resolveEnv

# Function: resolveEnv()

> **resolveEnv**(`content`, `privateKey?`): `Promise`\<`Record`\<`string`, `string`\>\>

Defined in: [envfile.ts:99](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/env/src/envfile.ts#L99)

Resolve .env content to a plain { KEY: value } record with every encrypted value DECRYPTED. The runtime
primitive: a Worker calls this with the committed .env text + the private key from a secret binding; a CLI
calls it with the file + .env.keys. The key vars (SULUK_PUBLIC_KEY/PRIVATE_KEY) are never emitted.

## Parameters

### content

`string`

### privateKey?

`string`

## Returns

`Promise`\<`Record`\<`string`, `string`\>\>
