[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / Viewer

# Interface: Viewer

Defined in: [cockpit/src/crosscut.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/cockpit/src/crosscut.ts#L15)

A viewer to project for. `scopes: undefined` ⇒ the full/operator view; `[]` ⇒ no scopes.
 `authenticated` distinguishes a logged-in viewer from a truly anonymous one — an auth-only operation
 (`security: [{ bearer: [] }]`, a requirement with zero scopes) is reachable by any AUTHENTICATED viewer but
 NOT by anonymous. (This is more precise than the cockpit's single-principal "View as", which keys on scopes
 alone; the cross-cut is the purpose-built security view.)

## Properties

### authenticated?

> `optional` **authenticated?**: `boolean`

Defined in: [cockpit/src/crosscut.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/cockpit/src/crosscut.ts#L19)

does this viewer hold a credential? defaults to "holds at least one scope".

***

### label

> **label**: `string`

Defined in: [cockpit/src/crosscut.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/cockpit/src/crosscut.ts#L16)

***

### scopes

> **scopes**: `string`[] \| `undefined`

Defined in: [cockpit/src/crosscut.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/cockpit/src/crosscut.ts#L17)
