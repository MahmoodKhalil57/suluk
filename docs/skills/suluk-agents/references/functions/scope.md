# Functions

## scope

### `intersectScope`
INTERSECTION with null-as-unconstrained: ∩(null, X)=X, ∩(X, null)=X, ∩(X, Y)=X∩Y.
```ts
intersectScope(a: Scope, b: Scope): Scope
```
**Parameters:**
- `a: Scope`
- `b: Scope`
**Returns:** `Scope`

### `analyzeScopes`
Walk the agent tree from `root`, computing each reachable node's effective (intersected) scope and every per-edge
escalation. Cycle-guarded (lint rejects cycles independently); on a DAG/tree each node's effective is its first
reaching path's intersection — sufficient for the shallow agent graphs C027 ships.
```ts
analyzeScopes(doc: OpenAPIv4Document, root: string): { effective: Record<string, Scope>; escalations: ScopeEscalation[] }
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `root: string`
**Returns:** `{ effective: Record<string, Scope>; escalations: ScopeEscalation[] }`

### `localEscalations`
A LOCAL author-time escalation check for one agent's direct children: a child may not DECLARE a permission its
immediate parent does not grant (under intersection it would be silently dropped — flag the author's confusion /
a confused-deputy attempt). Used by the linter; the transitive picture is analyzeScopes.
```ts
localEscalations(doc: OpenAPIv4Document, agentName: string): ScopeEscalation[]
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `agentName: string`
**Returns:** `ScopeEscalation[]`
