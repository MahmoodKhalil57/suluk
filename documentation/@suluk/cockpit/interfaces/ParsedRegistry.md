[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / ParsedRegistry

# Interface: ParsedRegistry

Defined in: [builder/src/registry-remote.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/builder/src/registry-remote.ts#L19)

## Properties

### modules

> **modules**: [`ModuleEntry`](ModuleEntry.md)[]

Defined in: [builder/src/registry-remote.ts:22](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/builder/src/registry-remote.ts#L22)

only the well-formed module entries

***

### name

> **name**: `string`

Defined in: [builder/src/registry-remote.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/builder/src/registry-remote.ts#L20)

***

### rejected

> **rejected**: `object`[]

Defined in: [builder/src/registry-remote.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/builder/src/registry-remote.ts#L24)

malformed entries, surfaced (title + why) rather than hidden

#### reason

> **reason**: `string`

#### title

> **title**: `string`
