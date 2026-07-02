[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / BASE\_DEPS

# Variable: BASE\_DEPS

> `const` **BASE\_DEPS**: `string`[]

Defined in: [catalog.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/platform/src/catalog.ts#L29)

The always-present framework deps (every generated app: the Effect services + Hono entry + the merged provision.config
that imports mergeProvision from @suluk/platform + defineProvision from @suluk/provision). Union'd with each service's
`deps` to build package.json.
