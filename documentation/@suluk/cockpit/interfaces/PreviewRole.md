[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / PreviewRole

# Interface: PreviewRole

Defined in: [cockpit/src/crosscut.ts:99](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/cockpit/src/crosscut.ts#L99)

A principal you can preview the running app AS — derived from the contract, never hardcoded.

## Properties

### authenticated

> **authenticated**: `boolean`

Defined in: [cockpit/src/crosscut.ts:105](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/cockpit/src/crosscut.ts#L105)

***

### label

> **label**: `string`

Defined in: [cockpit/src/crosscut.ts:100](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/cockpit/src/crosscut.ts#L100)

***

### role

> **role**: `string`

Defined in: [cockpit/src/crosscut.ts:102](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/cockpit/src/crosscut.ts#L102)

the role token passed to the preview deploy's /preview/login?role=… (or "anonymous").

***

### scopes

> **scopes**: `string`[]

Defined in: [cockpit/src/crosscut.ts:104](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/cockpit/src/crosscut.ts#L104)

the scopes this role implies in the cross-cut (here, just the role itself; the runtime maps role→scopes).
