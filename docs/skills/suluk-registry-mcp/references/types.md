# Types & Enums

## mcp.connections.service

### `McpConnectionView`
A connection's knob-row as returned to the owner.
**Properties:**
- `clientId: string`
- `keyId: string` — the attributed-spend id (`mcp:<userId>:<clientId>`) — the key a connection's usage is charged under.
- `creditCap: number | null`
- `rateSharePct: number | null`
- `disabled: boolean`
- `createdAt: number`

### `McpConnectionPatch`
A partial patch of a connection's knobs. An OMITTED field is left untouched; a field explicitly `null` clears it.
**Properties:**
- `creditCap: number | null` (optional)
- `rateSharePct: number | null` (optional)
- `disabled: boolean` (optional)
