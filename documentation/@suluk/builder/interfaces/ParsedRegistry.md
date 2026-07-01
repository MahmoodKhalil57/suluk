[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / ParsedRegistry

# Interface: ParsedRegistry

Defined in: [registry-remote.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/builder/src/registry-remote.ts#L19)

## Properties

### modules

> **modules**: [`ModuleEntry`](ModuleEntry.md)[]

Defined in: [registry-remote.ts:22](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/builder/src/registry-remote.ts#L22)

only the well-formed module entries

***

### name

> **name**: `string`

Defined in: [registry-remote.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/builder/src/registry-remote.ts#L20)

***

### rejected

> **rejected**: `object`[]

Defined in: [registry-remote.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/builder/src/registry-remote.ts#L24)

malformed entries, surfaced (title + why) rather than hidden

#### reason

> **reason**: `string`

#### title

> **title**: `string`
