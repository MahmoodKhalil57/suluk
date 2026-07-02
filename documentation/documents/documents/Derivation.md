[**Suluk**](../../README.md)

***

[Suluk](../../packages.md) / [Registry](../Registry.md) / Derivation

# Derivation

Derived from the installed modules — the v4 contract keystone plus the audit + BDD tools that read it.

3 modules:

- [**audit**](documents/audit.md) — Dev/CI tooling (no runtime mount): a single conformance script that consolidates @suluk/cockpit's lifecycle gates + @suluk/harden's input-hardening security grade + schema-fact readiness grade into one unified ship-readiness pass/fail. Loads your v4 contract and exits non-zero when a gate blocks or the combined grade falls below the floor — the one command your pipeline gates on.
- [**contract**](documents/contract.md) — The keystone: declares the base API surface as @suluk/hono RouteContracts (with x-suluk-access scopes + zod request schemas) and DERIVES everything downstream consumes — apiDocument(principal?) (the per-principal v4 doc via emitV4), SCOPE_BY_OP + PUBLIC_OPS (the scope facets the scope gate / MCP read), the enforceApiKeyScope gate, the validateRequest body gate, and GET /api/openapi.json projected to the caller's scopes. Own the wiring, npm the derivation. Stateless — no schema, no provision.
- [**journeys**](documents/journeys.md) — Dev/CI tooling (no runtime mount): author plain-Gherkin user journeys against the step vocabulary @suluk/journeys projects from your v4 contract, then bind + grade coverage as a bun:test gate. The binder resolves each step exact-or-unbound and grades contract→authored coverage; unbound steps are your worklist. Ships a config, an example feature, and the coverage harness.
