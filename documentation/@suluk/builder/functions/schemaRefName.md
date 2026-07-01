[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / schemaRefName

# Function: schemaRefName()

> **schemaRefName**(`ref`): `string` \| `null`

Defined in: [module.ts:87](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/builder/src/module.ts#L87)

The ROOT schema NAME a $ref targets, or null if it isn't a components/schemas reference. Parses the
JSON-Pointer by tokens (RFC 6901, matching @suluk/core's resolveRef) so a DEEP ref (.../Order/properties/id)
still resolves to its root "Order", and an escaped name (.../v2~1Order) unescapes to the real key "v2/Order"
— a flat /(.+)/ regex would mis-capture the whole tail and false-flag a legitimate ref as dangling.

## Parameters

### ref

`string`

## Returns

`string` \| `null`
