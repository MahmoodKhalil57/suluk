[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / AuthServiceOpts

# Interface: AuthServiceOpts

Defined in: [service.ts:146](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/service.ts#L146)

auth's serviceOpts: optionally activate the MCP OAuth server (Better Auth `mcp()` plugin).

## Properties

### mcp?

> `optional` **mcp?**: [`McpOAuthOpts`](McpOAuthOpts.md)

Defined in: [service.ts:151](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/service.ts#L151)

LEGACY: the full MCP OAuth URL block. Prefer `mcpScopes` (URLs derived). Kept for back-compat with hand-authored URLs.

***

### mcpScopes?

> `optional` **mcpScopes?**: `string`[]

Defined in: [service.ts:149](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/service.ts#L149)

C058: activate the MCP OAuth server by declaring its SCOPE SET — the loginPage/consentPage/resource URLs are DERIVED
 from `LIVE_BASE_URL` (no host boilerplate). This is the single-source authoring path.
