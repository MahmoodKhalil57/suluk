# Configuration

## MountMcpOptions

### Properties

#### apiDocument

wired from contract (auto-injected — mcp `requires: ["contract"]`): the per-caller v4 doc projector.

**Type:** `(principal?: { scopes: string[] }) => OpenAPIv4Document`

**Required:** yes

#### mcpAuthInstance

wired from auth: a factory returning the Better-Auth INSTANCE (with the mcp() plugin) for the OAuth discovery docs.

**Type:** `(env: Bindings) => unknown`