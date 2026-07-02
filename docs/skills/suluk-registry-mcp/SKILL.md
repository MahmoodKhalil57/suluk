---
description: Reference tooling for the OpenAPI v4.0 Suluk candidate.
name: suluk-registry-mcp
---

# suluk

Reference tooling for the OpenAPI v4.0 Suluk candidate.

## Configuration

**MountMcpOptions** (1 options — see references/config.md)

## Quick Reference

**mcp.routes:** `mountMcp`
**mcp.connections.routes:** `mcpConnectionsRoutes`
**mcp.connections.service:** `McpConnections`, `McpConnectionView` (A connection's knob-row as returned to the owner), `McpConnectionPatch` (A partial patch of a connection's knobs), `McpConnectionsLive`
**mcp.schema:** `mcpConnection` (One user's knobs on one OAuth connection they authorized)
**mcp.provision:** `mcpProvision`
**mcp.contract:** `mcpOps`

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When using a class → read `references/classes.md` for properties, methods, and inheritance
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`
- When configuring options → read `references/config.md` for all settings and defaults