# Variables & Constants

## contract.contract

### `CONTRACT`
THE base operation surface = the system ops + every installed module's composed fragment.
```ts
const CONTRACT: any
```

### `SCOPE_BY_OP`
op-name → its single required scope (the `x-suluk-access` facet). DERIVED from the contract's `scopes` (first entry),
so it can never drift from the declared surface. This is the map `enforceApiKeyScope` and the MCP tool-gate read to
enforce a keyed caller's grants on the wire — the server is the only authz boundary (C022 inv.3); the facet describes it.
```ts
const SCOPE_BY_OP: Record<string, string>
```

### `PUBLIC_OPS`
The set of PUBLIC op-names — those that declare NO scope (health, the pricing catalogs, the signature-verified Stripe
webhook). DERIVED from the contract, so a newly-added scoped route is never accidentally treated as public. The scope
gate / MCP consult this to know which ops bypass the grant check.
```ts
const PUBLIC_OPS: Set<string>
```

### `enforceApiKeyScope`
SCOPE-GATE for KEYED callers (an `x-api-key` / MCP caller — a `keyId` is on the context). A key holds a SUBSET of its
owner's access, so a scoped op requires the key to hold that op's scope (from the contract's `x-suluk-access` facet).
SESSION callers (no `keyId`) pass straight through — a signed-in user is unrestricted here (their own auth gates apply).
Runs AFTER `apiKeyAuth` (which set `keyId` + `scopes`). The server is the ONLY authz boundary; the facet describes it.
```ts
const enforceApiKeyScope: MiddlewareHandler
```

### `validateRequest`
CONTRACT-DERIVED request-body validation. Resolves the op the SAME way the scope gate does (matchRoute —
longest static-prefix + method), and, IF that op declares a `request.json` schema AND the method carries a body,
parses `c.req.json()` with it. On a schema failure it synthesizes an RFC-9457 400 (`ValidationError`) with the flattened
Zod issues in `errors`; on success it stashes the parsed body at `c.set("validatedBody", …)` (handlers may re-read the
body themselves — this doesn't consume the stream for them, it only ADDS the pre-parsed value). Any op WITHOUT a
declared `request.json` (or any GET/HEAD) passes straight through, so the gate only ever tightens declared ops — it
never blocks an undeclared surface. Mount AFTER `enforceApiKeyScope` (a missing scope 403 precedes a bad-body 400).
```ts
const validateRequest: MiddlewareHandler
```
