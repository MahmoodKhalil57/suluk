[**Suluk**](../../README.md)

***

[Suluk](../../packages.md) / [Registry](../Registry.md) / Surfaces

# Surfaces

Caller-, agent-, and admin-facing projections of the contract.

3 modules:

- [**admin**](documents/admin.md) — An Effect-TS Admin service exposing GET /api/admin/stats — the admin-scoped ops/usage aggregate. Wraps @suluk/credits' ledgerStats (credits issued vs spent + outstanding balance stay upstream) + the module-owned credit_transaction row count. Admin-scope is enforced globally by the contract's enforceApiKeyScope on /api/admin, so the route does no gating. A stateless read: no schema, no provision (reads existing tables). Own the wiring, npm the aggregate.
- [**mcp**](documents/mcp.md) — The API-as-MCP surface: mounts @suluk/mcp's mcpApp at /api/mcp with the contract's apiDocument(scopes) as the per-caller tool list (a caller only sees the tools its principal can call — the contract-first payoff), executes tools in-process via appExec, exposes the OAuth /.well-known discovery (Better Auth's mcp plugin, enabled in auth via opts.mcp), and manages MCP connections (list/update/revoke; session-only) over an owned mcp_connection table. Own the wiring, npm the protocol + OAuth server.
- [**reference**](documents/reference.md) — An API reference PAGE rendered by @suluk/reference (the complete v4-native renderer: cost badges, access View-as projection, hardening, try-it) over apiDocument() — the SAME per-principal v4 document the contract keystone derives. GET /api/reference renders the full doc; GET /api/reference/:tool projects it to one operation (by its by-name handle). Own the wiring, npm the renderer. Derived + stateless — no schema, no provision.
