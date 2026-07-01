[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / BindingSink

# Interface: BindingSink

Defined in: [provision/src/types.ts:137](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/provision/src/types.ts#L137)

Where bound credentials LAND. The default sink writes the @suluk/env manifest (typed + post-quantum-encrypted +
 commit-safe); a test passes an in-memory sink. `mapping` is the instance's `bind` (output key → env var name).

## Methods

### write()

> **write**(`outputs`, `mapping`): `void` \| `Promise`\<`void`\>

Defined in: [provision/src/types.ts:138](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/provision/src/types.ts#L138)

#### Parameters

##### outputs

`Record`\<`string`, `string`\>

##### mapping

`Record`\<`string`, `string`\>

#### Returns

`void` \| `Promise`\<`void`\>
