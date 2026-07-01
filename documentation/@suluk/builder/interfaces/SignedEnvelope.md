[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / SignedEnvelope

# Interface: SignedEnvelope

Defined in: [signing.ts:10](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/builder/src/signing.ts#L10)

A signed registry payload: the registry value + a detached base64 signature over its canonical bytes.

## Properties

### publisher?

> `optional` **publisher?**: `string`

Defined in: [signing.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/builder/src/signing.ts#L14)

***

### registry

> **registry**: `unknown`

Defined in: [signing.ts:11](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/builder/src/signing.ts#L11)

***

### signature

> **signature**: `string`

Defined in: [signing.ts:13](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/builder/src/signing.ts#L13)

base64 ECDSA-P256/SHA-256 signature over canonicalBytes(registry)
