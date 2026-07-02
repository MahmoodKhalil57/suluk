[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / GatedOp

# Interface: GatedOp

Defined in: [cockpit/src/crosscut.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cockpit/src/crosscut.ts#L27)

## Properties

### detail

> **detail**: `string`

Defined in: [cockpit/src/crosscut.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cockpit/src/crosscut.ts#L29)

***

### operation

> **operation**: `string`

Defined in: [cockpit/src/crosscut.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cockpit/src/crosscut.ts#L28)

***

### requiredScopes

> **requiredScopes**: `string`[][]

Defined in: [cockpit/src/crosscut.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cockpit/src/crosscut.ts#L31)

the scope requirements (OR of AND-groups); empty ⇒ public

***

### visibleTo

> **visibleTo**: `string`[]

Defined in: [cockpit/src/crosscut.ts:33](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cockpit/src/crosscut.ts#L33)

the labels of the viewers who CAN see it
