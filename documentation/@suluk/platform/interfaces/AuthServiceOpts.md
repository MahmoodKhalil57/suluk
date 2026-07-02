[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / AuthServiceOpts

# Interface: AuthServiceOpts

Defined in: [service.ts:150](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/platform/src/service.ts#L150)

auth's serviceOpts: optionally activate the MCP OAuth server (Better Auth `mcp()` plugin).

## Properties

### mcp?

> `optional` **mcp?**: [`McpOAuthOpts`](McpOAuthOpts.md)

Defined in: [service.ts:155](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/platform/src/service.ts#L155)

LEGACY: the full MCP OAuth URL block. Prefer `mcpScopes` (URLs derived). Kept for back-compat with hand-authored URLs.

***

### mcpScopes?

> `optional` **mcpScopes?**: `string`[]

Defined in: [service.ts:153](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/platform/src/service.ts#L153)

C058: activate the MCP OAuth server by declaring its SCOPE SET — the loginPage/consentPage/resource URLs are DERIVED
 from `LIVE_BASE_URL` (no host boilerplate). This is the single-source authoring path.
