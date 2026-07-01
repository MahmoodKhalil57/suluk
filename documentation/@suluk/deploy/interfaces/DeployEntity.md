[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/deploy](../README.md) / DeployEntity

# Interface: DeployEntity

Defined in: [types.ts:9](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/deploy/src/types.ts#L9)

`@suluk/deploy` — ship a Suluk app behind a SWAPPABLE target interface. A DeployProvider turns the app into
the files + ordered steps that deploy it; the host (the vscode extension) runs the steps in a terminal
after the user authenticates. Cloudflare is the first provider (Workers + D1 + static assets) — an adapter,
since the stack is already Cloudflare-native (Hono=Workers, sqlite-core=D1, frontend=assets). CANDIDATE.

## Properties

### name

> **name**: `string`

Defined in: [types.ts:10](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/deploy/src/types.ts#L10)

***

### schema

> **schema**: [`SchemaOrRef`](../../core/type-aliases/SchemaOrRef.md)

Defined in: [types.ts:11](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/deploy/src/types.ts#L11)
