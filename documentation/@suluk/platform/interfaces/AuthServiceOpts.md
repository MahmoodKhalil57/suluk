[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / AuthServiceOpts

# Interface: AuthServiceOpts

Defined in: [service.ts:170](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/platform/src/service.ts#L170)

auth's serviceOpts: optionally activate the MCP OAuth server (Better Auth `mcp()` plugin).

## Properties

### mcp?

> `optional` **mcp?**: [`McpOAuthOpts`](McpOAuthOpts.md)

Defined in: [service.ts:175](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/platform/src/service.ts#L175)

LEGACY: the full MCP OAuth URL block. Prefer `mcpScopes` (URLs derived). Kept for back-compat with hand-authored URLs.

***

### mcpScopes?

> `optional` **mcpScopes?**: `string`[]

Defined in: [service.ts:173](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/platform/src/service.ts#L173)

C058: activate the MCP OAuth server by declaring its SCOPE SET — the loginPage/consentPage/resource URLs are DERIVED
 from `LIVE_BASE_URL` (no host boilerplate). This is the single-source authoring path.
