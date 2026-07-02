[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/mcp](../README.md) / appExec

# Function: appExec()

> **appExec**(`app`): (`c`, `op`, `args`) => `Promise`\<`unknown`\>

Defined in: [exec.ts:62](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/mcp/src/exec.ts#L62)

In-process executor for when the MCP server is mounted on the SAME app as the store routes. Dispatches the tool's
 request straight through `app.fetch` — same routing, same auth + access middleware, NO network hop (so no edge
 self-loop / 522 on Cloudflare). Pass the host Hono app; it is read lazily at call time, so mounting MCP on that
 same app first is fine. The tool's request (e.g. `GET /product`) never matches the MCP route, so it can't recurse.

## Parameters

### app

[`FetchApp`](../interfaces/FetchApp.md)

## Returns

(`c`, `op`, `args`) => `Promise`\<`unknown`\>
